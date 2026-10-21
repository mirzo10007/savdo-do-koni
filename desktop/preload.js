// Dastur oynasi va Windows o'rtasidagi xavfsiz ko'prik
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gmz', {
  load: () => ipcRenderer.invoke('gmz:load'),
  save: (text) => ipcRenderer.invoke('gmz:save', text),
  saveSync: (text) => ipcRenderer.sendSync('gmz:saveSync', text),
  dataPath: () => ipcRenderer.invoke('gmz:dataPath'),
  openPath: (p) => ipcRenderer.invoke('gmz:openPath', p),
  backupDir: (p) => ipcRenderer.invoke('gmz:backupDir', p),
  chooseDir: () => ipcRenderer.invoke('gmz:chooseDir'),
  backup: (text, day, dir) => ipcRenderer.invoke('gmz:backup', text, day, dir),
  printers: () => ipcRenderer.invoke('gmz:printers'),
  print: (html, opt) => ipcRenderer.invoke('gmz:print', html, opt),
  machineId: () => ipcRenderer.invoke('gmz:machineId')
});
