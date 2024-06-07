import { app, BrowserWindow,ipcMain,dialog,Menu,MenuItem,Tray,nativeImage,screen } from 'electron/main'
import path from 'node:path'
import os from 'node:os'
import {updateElectronApp} from 'update-electron-app'
updateElectronApp()
async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }else{
    return '已取消'
  }
}
let progressInterval
const createWindow = () => {
  const displayWorkAreaSize = screen.getAllDisplays()[0].workArea;
  const mainWindow = new BrowserWindow({
    width: parseInt(`${displayWorkAreaSize.width * 0.85}`, 10),
    height: parseInt(`${displayWorkAreaSize.height * 0.85}`, 10),
    movable:true,
    show: false,
    center: true,
    resizable: true,
    titleBarStyle: 'default',
    // width: 800,
    // height: 600,
    // transparent: true,
    // titleBarStyle: 'hidden',
    // trafficLightPosition: { x: 100, y: 100 },
    // titleBarStyle: 'hiddenInset',//
    // titleBarStyle: 'customButtonsOnHover',//隐藏红绿灯
    // titleBarStyle: 'hidden',//隐藏标题栏和全尺寸内容窗口
    // resizable:false,
    // frame: false,//无边框窗口
    icon: path.join(import.meta.dirname, 'assets/icon.iconset/icon_128x128@2x.png'),
    webPreferences: {
      devTools: true,
      contextIsolation: false,
      nodeIntegration: true,
      enableRemoteModule:true,
      //sandbox: false,//当前页面进程禁用渲染器沙盒
      preload: path.join(import.meta.dirname, 'preload.cjs')
    }
  })

  if(process.platform === 'darwin'){
    // 设置窗口图标
    app.dock.setIcon(path.join(import.meta.dirname, 'assets/icon.iconset/icon_128x128@2x.png'));
  }

  const electronMenu = new MenuItem({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {
        click: () => mainWindow.webContents.send('update-counter', 1),
        label: '增加'
      },
      {
        click: () => mainWindow.webContents.send('update-counter', -1),
        label: '减少'
      },
      {type: 'separator'},
      {role: 'quit'}
    ]
  });
  const menu = Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {role: 'quit'}
      ]
    },
    electronMenu,
  ])
  Menu.setApplicationMenu(menu)

  // //穿透窗口
  // mainWindow.setIgnoreMouseEvents(true)

  //在 BrowserWindow 中展示文件
  // mainWindow.setRepresentedFilename(os.homedir())
  // mainWindow.setDocumentEdited(true)

  //隐藏红绿灯
  // mainWindow.setWindowButtonVisibility(false)

  mainWindow.loadFile('index.html')
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });
  // mainWindow.loadURL('https://baidu.com')
  // const contents = mainWindow.webContents
  // console.log(contents)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  const INCREMENT = 0.03
  const INTERVAL_DELAY = 100 // ms

  let c = 0
  progressInterval = setInterval(() => {
    // update progress bar to next value
    // values between 0 and 1 will show progress, >1 will show indeterminate or stick at 100%
    mainWindow.setProgressBar(c)

    // increment or reset progress bar
    if (c < 2) {
      c += INCREMENT
    } else {
      mainWindow.setProgressBar(-1)
      clearInterval(progressInterval)
      // c = (-INCREMENT * 5) // reset to a bit less than 0 to show reset state
    }
  }, INTERVAL_DELAY)
}
//强制沙盒化所有渲染器。 注意，此 API 必须在应用的 ready 事件之前调用。
// app.enableSandbox()
let tray
app.whenReady().then(() => {
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  //渲染器进程到主进程（双向） 双向 IPC 的一个常见应用是从渲染器进程代码调用主进程模块并等待结果
  ipcMain.handle('ping', async () => 'pong111')
  ipcMain.handle('dialog:openFile', handleFileOpen)
  //渲染器进程到主进程（单向）
  ipcMain.on('set-title', (event, title) => {
    const webContents = event.sender
    //每当消息通过 set-title 通道传入时，此函数找到附加到消息发送方的 BrowserWindow 实例，并在该实例上使用 win.setTitle API
    const win = BrowserWindow.fromWebContents(webContents)
    win.setTitle(title)
  })
  createWindow()
  
  // console.log('process',process.versions)
  // Linux 和 Windows 应用在没有窗口打开时退出了，
  // macOS 应用通常即使在没有打开任何窗口的情况下也继续运行，并且在没有窗口可用的情况下激活应用时会打开新的窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })


  const iconSrc = path.join(import.meta.dirname,'assets/icon.iconset/icon_16x16.png');
  const icon = nativeImage.createFromPath(iconSrc)
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
    {type: 'separator'},
    {role: 'quit'}
  ])
  
  tray.setContextMenu(contextMenu)
  tray.setToolTip('This is my application')
  // tray.setTitle('110')
})
// before the app is terminated, clear both timers
app.on('before-quit', () => {
  clearInterval(progressInterval)
})
// Windows和Linux，关闭所有窗口退出应用程序
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
