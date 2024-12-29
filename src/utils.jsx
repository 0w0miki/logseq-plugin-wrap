import "@logseq/libs"

export function registerCommand(callback, { key, label, binding }) {
    const command = { key, label }
    if (binding) {
      command.keybinding = { binding }
    }
    logseq.App.registerCommandPalette(command, callback)
  }