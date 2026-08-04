import { Tray, Menu, app, shell, BrowserWindow, ipcMain, nativeImage, Notification, dialog } from 'electron'
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

let mainWindow
let tray
let isQuiting = false

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
  mainWindow = new BrowserWindow({
    width: 500,
    minWidth: 330,
    height: 700,
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

  let firstClose = true

  mainWindow.on('close', (event) => {
    if (!isQuiting) {
      event.preventDefault()
      mainWindow.hide()

      if (firstClose) {
        firstClose = false

        new Notification({
          title: 'Papo Chat',
          body: 'O aplicativo continuará executando na bandeja do sistema.'
        }).show()
      }
    }
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
  electronApp.setAppUserModelId('com.phcore.papo')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

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
          if (mainWindow) {
            mainWindow.show()

            if (mainWindow.isMinimized()) {
              mainWindow.restore()
            }

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

  tray = new Tray(appIcon)

  tray.setToolTip('Papo Chat')

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Abrir',
        click() {
          if (!mainWindow) return

          mainWindow.show()

          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          }

          mainWindow.focus()
        }
      },
      { type: 'separator' },
      {
        label: 'Sair',
        async click() {
          const { response } = await dialog.showMessageBox(mainWindow, {
            type: 'question',
            title: 'Sair do Papo Chat',
            message: 'Deseja realmente sair?',
            detail:
              'Ao sair, você deixará de receber novas mensagens e notificações.',
            buttons: ['Cancelar', 'Reiniciar', 'Sair'],
            defaultId: 1,
            cancelId: 0,
            icon: appIcon
          })

          switch (response) {
            case 1:
              isQuiting = true
              app.relaunch()
              app.quit()
              break

            case 2:
              isQuiting = true
              app.quit()
              break
          }
        }
      }
    ])
  )

  tray.on('click', () => {
    if (!mainWindow) return

    if (mainWindow.isVisible()) {
      mainWindow.focus()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', (event) => {
  event.preventDefault()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
