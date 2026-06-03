import "@logseq/libs"

export const registerCommand = (callback, { key, label, binding }) => {
    const command = { key, label }
    if (binding) {
      command.keybinding = { binding }
    }
    logseq.App.registerCommandPalette(command, callback)
  }

/* Helper function to wait for a fresh (different) element matching selector */
export const waitForFresh = async (selector, oldElement) => new Promise(resolve => {
    const delay = 500;
    const f = () => {
        const el = parent.document.querySelector(selector);
        if (el != null && el !== oldElement) {
            resolve(el);
        } else {
            setTimeout(f, delay);
        }
    }
    f();
});