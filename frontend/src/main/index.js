import { app, shell, BrowserWindow, ipcMain, nativeImage, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import https from 'https'
import http from 'http'

const iconPath =
  process.platform === 'win32'
    ? join(__dirname, '../../build/icon.ico')
    : process.platform === 'darwin'
      ? join(__dirname, '../../build/icon.icns')
      : join(__dirname, '../../build/icon.png')

const appIcon = nativeImage.createFromPath(iconPath)

// Função helper para converter URL para base64
async function urlToBase64(url) {
  if (!url) return null

  // Se já é um data URI, retorna como está
  if (url.startsWith('data:')) {
    return url
  }

  try {
    const protocol = url.startsWith('https') ? https : http
    return new Promise((resolve, reject) => {
      protocol.get(url, { timeout: 5000 }, (response) => {
        const chunks = []
        response.on('data', chunk => chunks.push(chunk))
        response.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks)
            const base64 = buffer.toString('base64')
            const mimeType = response.headers['content-type'] || 'image/png'
            const dataUri = `data:${mimeType};base64,${base64}`
            resolve(dataUri)
          } catch (err) {
            reject(err)
          }
        })
      }).on('error', reject)
    })
  } catch (error) {
    console.warn('Erro ao converter imagem para base64:', error)
    return null
  }
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 500,
    minWidth: 330,
    height: 600,
    minHeight: 400,
    show: false,
    icon: appIcon,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(appIcon)
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.phcore.papo')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC para notificações do sistema
  ipcMain.on('notification:show', async (event, config) => {
    try {
      const { title, body, icon } = config

      let notificationIcon = appIcon

      if (icon) {
        try {
          const data = await urlToBase64(icon)
          if (data) {
            notificationIcon = nativeImage.createFromDataURL(data)
          }
        } catch (e) {
          console.error(e)
        }
      }

      const notification = new Notification({
        title: title || 'Notificação',
        body: body || '',
        icon: notificationIcon,
        silent: false,
        urgency: config.urgency || 'normal'
      })


      notification.show()

      notification.on('click', () => {
        try {
          event.sender.send('notification:clicked', config)
          const mainWindow = BrowserWindow.getAllWindows()[0]
          if (mainWindow) {
            mainWindow.focus()
          }
        } catch (error) {
          console.error('Erro ao processar clique em notificação:', error)
        }
      })
    } catch (error) {
      console.error('Erro ao exibir notificação:', error)
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
