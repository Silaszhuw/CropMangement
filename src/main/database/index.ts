import type { App } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDatabase, openDatabase } from './connection'
import { runMigrations } from './migrate'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

export function initializeDatabase(app: App) {
  const database = openDatabase(app)
  runMigrations(database, {
    isPackaged: app.isPackaged,
    developmentDirectory: join(process.cwd(), 'src/main/database/migrations'),
    packagedDirectory: join(process.resourcesPath, 'migrations'),
    fallbackDirectory: join(currentDirectory, 'migrations')
  })

  return database
}

export { getDatabase }
