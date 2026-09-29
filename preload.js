const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
  onGsi: (cb) => ipcRenderer.on("gsi", (_, data) => cb(data)),
  onInputMode: (cb) => ipcRenderer.on("input-mode", (_, v) => cb(v)),
  cacheGet: (key) => ipcRenderer.invoke("cache-get", key),
  cacheSet: (key, data) => ipcRenderer.invoke("cache-set", key, data),
});
