/**
 * Electron 主进程入口：初始化数据库、注册所有 IPC handler、创建应用主窗口
 */

import { app, BrowserWindow } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { initializeDatabase } from './database'
import {
  registerAppSettingsIpc,
  registerCropVarietiesIpc,
  registerDecisionsIpc,
  registerEvaluationsIpc,
  registerFieldsIpc,
  registerGrowthStageObservationsIpc,
  registerGrowthRecordsIpc,
  registerKnowledgeItemsIpc,
  registerModelParametersIpc,
  registerOperationRecordsIpc,
  registerParameterAdjustmentRecordsIpc,
  registerPlantingRecordsIpc
} from './ipc'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const isDev = !app.isPackaged
const windowsAppUserModelId = 'com.cropmodeling.desktop'

function resolveWindowIconPath(): string | undefined {
  const iconPath = isDev
    ? join(currentDirectory, '../../resources/app.ico')
    : join(process.resourcesPath, 'app.ico')

  return existsSync(iconPath) ? iconPath : undefined
}

function createWindow(): void {
  const windowIconPath = resolveWindowIconPath()
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 905,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    ...(windowIconPath ? { icon: windowIconPath } : {}),
    webPreferences: {
      preload: join(currentDirectory, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
    return
  }

  void mainWindow.loadFile(join(currentDirectory, '../renderer/index.html'))
}

app.whenReady().then(() => {
  app.setAppUserModelId(windowsAppUserModelId)
  initializeDatabase(app)
  registerFieldsIpc()
  registerCropVarietiesIpc()
  registerPlantingRecordsIpc()
  registerGrowthRecordsIpc()
  registerOperationRecordsIpc()
  registerEvaluationsIpc()
  registerKnowledgeItemsIpc()
  registerDecisionsIpc()
  registerAppSettingsIpc()
  registerModelParametersIpc()
  registerGrowthStageObservationsIpc()
  registerParameterAdjustmentRecordsIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
