import { app, BrowserWindow,ipcMain } from 'electron'
import path from 'node:path'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    preload: path.join(import.meta.dirname, 'preload.cjs')
    }
  })

  win.loadFile('index.html')
  // win.loadURL('https://baidu.com')
  // const contents = win.webContents
  // console.log(contents)
}
app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')
  createWindow()
  // console.log('process',process.versions)
  // Linux 和 Windows 应用在没有窗口打开时退出了，
  // macOS 应用通常即使在没有打开任何窗口的情况下也继续运行，并且在没有窗口可用的情况下激活应用时会打开新的窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// Windows和Linux，关闭所有窗口退出应用程序
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})