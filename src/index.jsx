import "@logseq/libs"
import { setup, t } from "logseq-l10n"
import { render } from "preact"
import Toolbar from "./toolbar/Toolbar.jsx"
import zhCN from "./translations/zh-CN.json"
import { configToModel, getConfig, registerCommandsByConfig } from "./config/config.jsx"
import { TOOLBAR_ID } from "./contansts.js"
import { isEditingText, isTextSelected, isSelectAll, addTextDeleteCallback, setTextArea } from "./core.jsx"
import { registerCommand, waitForFresh } from "./utils.jsx"
import toolbarContainer from "./toolbar/container.jsx"
import toolbarStyles from "./toolbar/toolbar.css"

export async function main() {
  // Reset values.
  let appContainer = null
  setTextArea(null)

  await setup({ builtinTranslations: { "zh-CN": zhCN } })

  const { preferredFormat } = await logseq.App.getUserConfigs()

  logseq.provideStyle(toolbarStyles)
  const configs = getConfig(preferredFormat)
  const model = configToModel(configs)
  logseq.provideModel(model)

  const onSelectionChangeHandler = () => onSelectionChange(appContainer)

  const mountToolbar = async () => {
    const old = parent.document.getElementById(TOOLBAR_ID)
    logseq.provideUI({
      key: TOOLBAR_ID,
      path: "#app-container",
      template: `<div id="${TOOLBAR_ID}"></div>`,
    })
    let container
    try {
      container = await waitForFresh(`#${TOOLBAR_ID}`, old)
    } catch (e) {
      console.error(e.message)
      return
    }
    appContainer?.unregisterContainerEvents()
    render(<Toolbar items={configs} model={model} />, container)
    appContainer = new toolbarContainer(container)
    appContainer.registerContainerEvents()
    console.log("toolbar mounted")
  }

  if (logseq.settings?.toolbar ?? true) {
    registerCommand(toggleToolbarDisplay, {
      key: "toggle-toolbar",
      label: t("Toggle toolbar display"),
      binding: logseq.settings?.toolbarShortcut,
    })

    setTimeout(async () => {
      await mountToolbar()

      logseq.App.onRouteChanged(async () => {
        await mountToolbar()
      })
    }, 0)
  }

  parent.document.addEventListener("selectionchange", onSelectionChangeHandler)
  registerCommandsByConfig(model, configs)

  logseq.beforeunload(async () => {
    appContainer?.unregisterContainerEvents()
    parent.document.removeEventListener("selectionchange", onSelectionChangeHandler)
  })

  console.log("#wrap loaded")
}

async function onSelectionChange(container) {
  console.debug('selection change triggered')
  const activeElement = parent.document.activeElement
  if (activeElement.nodeName.toLowerCase() === "textarea") {
    setTextArea(activeElement)
  }

  if (container !== null && isEditingText()) {
    if (isSelectAll()) {
      addTextDeleteCallback((e) => {
        if ((e.key === "Backspace" || e.key === "Delete")) {
          container.hideToolbar()
        }
      }, { once: true })
    }

    if (isTextSelected()) {
      await container.showToolbar()
    } else {
      container.hideToolbar()
    }
  }
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
