import "@logseq/libs"
import { WRAP_TYPE, REPL_TYPE } from "./contansts.js"

let textarea

export function isTextSelected() {
  return textarea && textarea.selectionStart !== textarea.selectionEnd
}

export function setTextArea(element) {
  textarea = element
}

export function isEditingText() {
  return textarea === parent.document.activeElement
}

export function isSelectAll() {
  return textarea &&
         textarea.selectionStart === 0 &&
         textarea.selectionEnd === textarea.value.length
}

export function addTextDeleteCallback(callback) {
  textarea?.addEventListener("keydown", callback)
}

export function removeTextDeleteCallback(callback) {
  textarea?.removeEventListener("keydown", callback)
}

async function updateBlockText(producer, ...args) {
  const block = await logseq.Editor.getCurrentBlock()

  if (block === null || textarea === null) {
    logseq.UI.showMsg(
      t("This command can only be used when editing text"),
      "error",
    )
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const before = textarea.value.substring(0, start)
  const selection = textarea.value.substring(start, end)
  const after = textarea.value.substring(end)
  const [text, selStart, selEnd] = await producer(
    before,
    selection,
    after,
    start,
    end,
    ...args,
  )
  await logseq.Editor.updateBlock(block.uuid, text)

  if (textarea?.isConnected) {
    textarea.focus()
    textarea.setSelectionRange(selStart, selEnd)
  } else {
    await logseq.Editor.editBlock(block.uuid)
    parent.document.activeElement.setSelectionRange(selStart, selEnd)
  }
}

function wrap(before, selection, after, start, end, template) {
  const m = selection.match(/\s+$/)
  const n = selection.match(/[^\s]/)
  const [beforeWhitespaces, text, afterWhitespaces] = [
    n ? selection.substring(0, n.index) : "",
    selection.trim(),
    m ? m[0] : ""
  ]
  console.debug(text)
  const [wrapBefore, wrapAfter] = template.split("$^")
  return [
    `${before}${beforeWhitespaces}${wrapBefore}${text}${wrapAfter ?? ""}${afterWhitespaces}${after}`,
    start + beforeWhitespaces.length,
    end + wrapBefore.length - afterWhitespaces.length + wrapAfter.length,
  ]
}

function repl(before, selection, after, start, end, regex, replacement) {
  const newText = selection.replace(new RegExp(regex, "g"), replacement)
  return [`${before}${newText}${after}`, start, start + newText.length]
}

export function getTextOperator(type, { template, regex, replacement }) {
  if (type === WRAP_TYPE) {
    return () => updateBlockText(wrap, template)
  } else if (type === REPL_TYPE) {
    return () => updateBlockText(repl, regex, replacement)
  }
}
