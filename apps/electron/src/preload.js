const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  notify: (msg) => ipcRenderer.send('notify', msg),
})
