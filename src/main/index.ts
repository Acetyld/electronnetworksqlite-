import 'reflect-metadata'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import './menu'
import { initDataSource } from './data-source'
import { store } from './store'
import {
  createDialogWindow,
  createMainWindow,
  destroyDialogWindow,
  destroyMainWindow
} from './windows'

async function testConnection(): Promise<void> {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) {
    throw new Error('No directory selected')
  }
  const selectedDirectory = result.filePaths[0]
  const databasePath = `${selectedDirectory}/database.sqlite`
  const dataSource = await initDataSource({
    database: databasePath,
    synchronize: true
  })
  await dataSource.initialize()
  if (!dataSource.isInitialized) {
    throw new Error('Database not initialized')
  }
  await dataSource.destroy()
  store.set('databasePath', databasePath)
}

ipcMain.handle('setup-database', async () => {
  try {
    await testConnection()
    await destroyDialogWindow()
    await createMainWindow()
    return {
      message: 'Connection successful',
      success: true
    }
  } catch (e: unknown) {
    const error = e as Error
    return {
      message: error?.message,
      success: false
    }
  }
})

const initialize = async (): Promise<void> => {
  if (!store.get('databasePath')) {
    createDialogWindow({})
  } else {
    console.log(store.get('databasePath'))
    createMainWindow().then()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await initialize()

  app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) await initialize
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    destroyMainWindow()
    destroyDialogWindow()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
