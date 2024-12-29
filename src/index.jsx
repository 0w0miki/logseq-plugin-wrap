import "@logseq/libs"
import { setup, t } from "logseq-l10n"
import { render } from "preact"
import { debounce, throttle } from "rambdax"
import Toolbar from "./Toolbar.jsx"
import zhCN from "./translations/zh-CN.json"
import { configToModel, getConfig, registerCommandsByConfig } from "./config/config.jsx"
import { TOOLBAR_ID } from "./contansts.js"
import { isEditingText, isTextSelected, addTextDeleteCallback, removeTextDeleteCallback, setTextArea } from "./core.jsx"
import { registerCommand } from "./utils.jsx"

let toolbar

async function main() {
  // Reset values.
  toolbar = null
  setTextArea(null)

  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  const { preferredFormat } = await logseq.App.getUserConfigs()

  logseq.provideStyle(`
    :root {
      --kef-wrap-tb-bg: #333e;
    }
    :root.dark {
      --kef-wrap-tb-bg: #777e;
    }
    #kef-wrap-toolbar {
      position: absolute;
      top: 0;
      left: -99999px;
      z-index: var(--ls-z-index-level-2);
      opacity: 0;
      will-change: opacity;
      transition: opacity 100ms ease-in-out;
      background: var(--kef-wrap-tb-bg);
      border-radius: 6px;
      color: #fff;
      display: flex;
      align-items: center;
      height: 30px;
      padding: 0 10px;
    }
    .kef-wrap-tb-list {
      position: relative;
    }
    .kef-wrap-tb-list:hover .kef-wrap-tb-itemlist {
      transform: scaleY(1);
    }
    .kef-wrap-tb-itemlist {
      position: absolute;
      top: 100%;
      left: 0;
      background: var(--kef-wrap-tb-bg);
      border-radius: 0 0 6px 6px;
      transform: scaleY(0);
      transform-origin: top center;
      will-change: transform;
      transition: transform 100ms ease-in-out;
    }
    .kef-wrap-tb-item {
      width: 30px;
      line-height: 20px;
      height: 30px;
      overflow: hidden;
      text-align: center;
      padding: 5px;
      margin: 0 2px;
      cursor: pointer;
    }
    .kef-wrap-tb-item:hover {
      filter: drop-shadow(0 0 3px #fff);
    }
    .kef-wrap-tb-item img {
      width: 20px;
      height: 20px;
    }
    #kef-wrap-toolbar.kef-wrap-hidden {
      display: none;
    }

    span[data-ref="#red"],
    span[data-ref="#green"],
    span[data-ref="#blue"],
    span[data-ref="$red"],
    span[data-ref="$green"],
    span[data-ref="$blue"] {
      display: none;
    }
    span[data-ref="#red"] + mark {
      background: #ffc7c7 !important;
      color: #262626 !important;
    }
    span[data-ref="#green"] + mark {
      background: #ccffc1 !important;
      color: #262626 !important;
    }
    span[data-ref="#blue"] + mark {
      background: #abdfff !important;
      color: #262626 !important;
    }
    span[data-ref="$red"] + mark {
      color: #f00 !important;
      background: unset !important;
      padding: 0;
      border-radius: 0;
    }
    span[data-ref="$green"] + mark {
      color: #0f0 !important;
      background: unset !important;
      padding: 0;
      border-radius: 0;
    }
    span[data-ref="$blue"] + mark {
      color: #00f !important;
      background: unset !important;
      padding: 0;
      border-radius: 0;
    }
  `)
  const configs = getConfig(preferredFormat)
  const model = configToModel(configs)
  logseq.provideModel(model)

  if (logseq.settings?.toolbar ?? true) {
    logseq.provideUI({
      key: TOOLBAR_ID,
      path: "#app-container",
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })

    registerCommand(toggleToolbarDisplay, {
      key: "toggle-toolbar",
      label: t("Toggle toolbar display"),
      binding: logseq.settings?.toolbarShortcut,
    })

    // Let div root element get generated first.
    setTimeout(async () => {
      toolbar = parent.document.getElementById(TOOLBAR_ID)
      render(<Toolbar items={configs} model={model} />, toolbar)

      toolbar.addEventListener("transitionend", onToolbarTransitionEnd)
      parent.document.addEventListener("focusout", onBlur)

      const mainContentContainer = parent.document.getElementById(
        "main-content-container",
      )
      mainContentContainer.addEventListener("scroll", onScroll, {
        passive: true,
      })
    }, 0)
  }

  parent.document.addEventListener("selectionchange", (e) => onSelectionChange(e))
  registerCommandsByConfig(model, configs)

  logseq.beforeunload(async () => {
    removeTextDeleteCallback(onTextDelete)
    const mainContentContainer = parent.document.getElementById(
      "main-content-container",
    )
    mainContentContainer.removeEventListener("scroll", onScroll, {
      passive: true,
    })
    toolbar?.removeEventListener("transitionend", onToolbarTransitionEnd)
    parent.document.removeEventListener("focusout", onBlur)
    parent.document.removeEventListener("selectionchange", onSelectionChange)
  })

  console.log("#wrap loaded")
}

async function onSelectionChange(e) {
  const activeElement = parent.document.activeElement
  if (activeElement.nodeName.toLowerCase() === "textarea") {
    if (toolbar != null) {
      removeTextDeleteCallback(onTextDelete)
    }
    setTextArea(activeElement)
    if (toolbar != null) {
      addTextDeleteCallback(onTextDelete)
    }
  }

  if (toolbar != null && isEditingText()) {
    if (isTextSelected()) {
      await updateToolbarPosition()
    } else {
      hideToolbar()
    }
  }
}

function onTextDelete(e) {
  if ((e.key === "Backspace" || e.key === "Delete") && isSelectAll()) {
    hideToolbar()
  }
}

async function updateToolbarPosition() {
  const curPos = await logseq.Editor.getEditingCursorPosition()
  if (curPos != null) {
    toolbar.style.top = `${curPos.top + curPos.rect.y - 35}px`
    if (curPos.left + curPos.rect.x + toolbar.clientWidth <= parent.window.innerWidth) {
      toolbar.style.left = `${curPos.left + curPos.rect.x}px`
    } else {
      toolbar.style.left = `${-toolbar.clientWidth + parent.window.innerWidth}px`
    }
    toolbar.style.opacity = "1"
  }
}

function onToolbarTransitionEnd(e) {
  if (toolbar.style.opacity === "0") {
    toolbar.style.top = "0"
    toolbar.style.left = "-99999px"
  }
}

function onBlur(e) {
  // Update toolbar visibility upon activeElement change.
  if (!isEditingText()) {
    hideToolbar()
  }
}

function hideToolbar() {
  if (toolbar.style.opacity !== "0") {
    toolbar.style.opacity = "0"
  }
}

function onScroll(e) {
  // There is a large gap between 2 displays of the toolbar, so a large
  // ms number is acceptable.
  const hide = throttle(hideToolbar, 1000)
  const show = debounce(async () => {
    if (isTextSelected()) {
      await updateToolbarPosition()
    }
  }, 100)

  hide()
  show()
}

function toggleToolbarDisplay() {
  const toolbar = parent.document.getElementById(TOOLBAR_ID)
  if (toolbar.classList.contains("kef-wrap-hidden")) {
    toolbar.classList.remove("kef-wrap-hidden")
  } else {
    toolbar.classList.add("kef-wrap-hidden")
  }
}

logseq.ready(main).catch(console.error)
