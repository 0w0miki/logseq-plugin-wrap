import "@logseq/libs"

export const registerCommand = (callback, { key, label, binding }) => {
    const command = { key, label }
    if (binding) {
      command.keybinding = { binding }
    }
    logseq.App.registerCommandPalette(command, callback)
  }

/* Helper function to wait for a fresh (different) element matching selector */
export const waitForFresh = async (selector, oldElement, timeout = 10000) => new Promise((resolve, reject) => {
    const delay = 500;
    const deadline = Date.now() + timeout;
    const f = () => {
        const el = parent.document.querySelector(selector);
        if (el != null && el !== oldElement) {
            resolve(el);
        } else if (Date.now() >= deadline) {
            reject(new Error(`waitForFresh: "${selector}" did not appear within ${timeout}ms`));
        } else {
            setTimeout(f, delay);
        }
    }
    f();
});