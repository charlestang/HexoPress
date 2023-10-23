window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('site', {
  getPosts:(...args) => ipcRenderer.invoke('site:posts', args),
  getCategories:  (...args) => ipcRenderer.invoke('site:categories', args),
  getTags:  (...args) => ipcRenderer.invoke('site:tags', args),
  ipcRenderer: () => ipcRenderer
})
