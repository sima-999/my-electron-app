const { contextBridge,ipcRenderer } = require('electron/renderer')
const name = '司马懿-诸葛亮'
contextBridge.exposeInMainWorld('userInfo', {
  getName: () => name,
  name,
  ping: () => ipcRenderer.invoke('ping')
})


window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
})