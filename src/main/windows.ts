import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { dataSource, destroyDataSource, setupDataSource } from './data-source'
import { User } from './entity/User'

export let mainWindow: BrowserWindow | null = null
export let dialogWindow: BrowserWindow | null = null
export const createDialogWindow = ({ afterFail = false }: { afterFail?: boolean }): void => {
  console.log(afterFail, 'after fail')
  if (dialogWindow) return
  // Create the browser window.
  dialogWindow = new BrowserWindow({
    width: 400,
    height: 400,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  dialogWindow.on('ready-to-show', () => {
    dialogWindow && dialogWindow.show()
  })

  dialogWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log(process.env['ELECTRON_RENDERER_URL'])
    dialogWindow.loadURL(
      `${process.env['ELECTRON_RENDERER_URL']}/dialog.html?afterFail=${afterFail ? 'true' : ''}`
    )
  } else {
    dialogWindow.loadFile(
      join(__dirname, `../renderer/dialog.html?afterFail=${afterFail ? 'true' : ''}`)
    )
  }
}
export const createMainWindow = async (): Promise<void> => {
  if (mainWindow) return
  try {
    await setupDataSource()
    if (!dataSource) return
    console.log('Inserting a new user into the database...')
    const user = new User()
    user.firstName = 'Timber'
    user.lastName = 'Saw'
    user.age = 25
    await dataSource.manager.save(user)
    console.log('Saved a new user with id: ' + user.id)

    console.log('Loading users from the database...')
    const users = await dataSource.manager.find(User)
    console.log('Loaded users: ', users)
  } catch (e) {
    createDialogWindow({ afterFail: true })
    return
  }
  console.log('Here you can setup and run express / fastify / any other framework.')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow && mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    console.log(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
export const destroyMainWindow = (destroyDB = true): void => {
  destroyDB && destroyDataSource().then()
  mainWindow && mainWindow.close()
  mainWindow = null
}
export const destroyDialogWindow = (): void => {
  dialogWindow && dialogWindow.close()
  dialogWindow = null
}
