/**
 * SQLite 数据库连接管理：创建并配置数据库连接，启用 WAL 模式和外键约束
 */

import type { App } from 'electron'
import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

let database: Database.Database | null = null

function ensureDatabaseDirectory(app: App): string {
  const userDataPath = app.getPath('userData')
  const dataDirectory = join(userDataPath, 'data')

  if (!existsSync(dataDirectory)) {
    mkdirSync(dataDirectory, { recursive: true })
  }

  return dataDirectory
}

export function openDatabase(app: App): Database.Database {
  if (database) {
    return database
  }

  const dataDirectory = ensureDatabaseDirectory(app)
  const databasePath = join(dataDirectory, 'app.db')

  database = new Database(databasePath)
  database.pragma('journal_mode = WAL')
  database.pragma('foreign_keys = ON')

  return database
}

export function getDatabase(): Database.Database {
  if (!database) {
    throw new Error('Database has not been initialized yet.')
  }

  return database
}
