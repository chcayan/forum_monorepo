// @ts-check
const { Notification, BrowserWindow } = require('electron')

function showNotification(
  /** @type {Electron.WebContents} */ sender,
  /** @type {import('../../types/notify').Notify} */ msg
) {
  const webContents = sender
  const win = BrowserWindow.fromWebContents(webContents)

  if (!win) return
  if (win.isMinimized() || !win.isVisible() || !win.isFocused()) {
    if (msg.type === 'chat') {
      const notification = new Notification({
        title: msg.title,
        body: msg.body,
      })

      notification.once('click', () => {
        if (win.isMinimized()) win.restore()
        win.focus()
        win.show()
      })

      notification.on('close', () => {
        notification.removeAllListeners()
      })

      notification.show()
    }
  }
}

module.exports = { showNotification }
