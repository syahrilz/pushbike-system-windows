const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const { spawn } = require('child_process')

let mainWindow
let serverProcess

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    show: false,
    backgroundColor: '#ffffff'
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function startServer() {
  const serverPath = path.join(__dirname, '../server/server.js')
  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit'
  })
}

app.whenReady().then(() => {
  if (process.env.NODE_ENV !== 'development') {
    startServer()
  }
  setTimeout(createWindow, 1000)
})

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})
