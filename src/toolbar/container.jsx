import { debounce, throttle } from "rambdax"
import { isEditingText, isTextSelected } from "../core"

export default class toolbarContainer {
  constructor(element) {
    this.container = element
  }

  registerContainerEvents() {
    parent.document.addEventListener("focusout", this.#onBlur)
    this.container.addEventListener("transitionend", this.#onToolbarTransitionEnd)

    const mainContentContainer = parent.document.getElementById(
      "main-content-container",
    )
    mainContentContainer.addEventListener("scroll", this.#onScroll, {
      passive: true,
    })
  }

  unregisterContainerEvents() {
    const mainContentContainer = parent.document.getElementById(
      "main-content-container",
    )
    mainContentContainer.removeEventListener("scroll", this.#onScroll, {
      passive: true,
    })
    this.container.removeEventListener("transitionend", this.#onToolbarTransitionEnd)
    parent.document.removeEventListener("focusout", this.#onBlur)
  }

  #onToolbarTransitionEnd(e) {
    if (this.container.style.opacity === "0") {
      this.container.style.top = "0"
      this.container.style.left = "-99999px"
    }
  }

  #onBlur(e) {
    // Update toolbar visibility upon activeElement change.
    if (!isEditingText()) {
      this.hideToolbar()
    }
  }

  #onScroll(e) {
    // There is a large gap between 2 displays of the toolbar, so a large
    // ms number is acceptable.
    throttle(this.hideToolbar, 1000)()
    debounce(async () => {
      if (isTextSelected()) {
        await this.showToolbar()
      }
    }, 100)()
  }

  hideToolbar() {
    if (this.container.style.opacity !== "0") {
      this.container.style.opacity = "0"
    }
  }

  async showToolbar() {
    const curPos = await logseq.Editor.getEditingCursorPosition()
    if (curPos != null) {
      this.container.style.top = `${curPos.top + curPos.rect.y - 35}px`
      if (curPos.left + curPos.rect.x + this.container.clientWidth <= parent.window.innerWidth) {
        this.container.style.left = `${curPos.left + curPos.rect.x}px`
      } else {
        this.container.style.left = `${-this.container.clientWidth + parent.window.innerWidth}px`
      }
      this.container.style.opacity = "1"
    }
  }
}
