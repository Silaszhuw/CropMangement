/**
 * 数据库初始化入口：打开数据库连接并执行 SQL 迁移脚本
 */

import type { App } from 'electron'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type Database from 'better-sqlite3'
import { getDatabase, openDatabase } from './connection'
import { runMigrations } from './migrate'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const developmentSeedPath = join(process.cwd(), 'scripts', 'seed-demo-data.sql')

function seedDevelopmentDemoData(database: Database.Database, app: App): void {
  if (app.isPackaged || !existsSync(developmentSeedPath)) {
    return
  }

  // 演示种子采用幂等插入，开发环境允许每次启动补齐新增样例。
  const sql = readFileSync(developmentSeedPath, 'utf-8')
  database.exec(sql)
}

export function initializeDatabase(app: App) {
  const database = openDatabase(app)
  runMigrations(database, {
    isPackaged: app.isPackaged,
    developmentDirectory: join(process.cwd(), 'src/main/database/migrations'),
    packagedDirectory: join(process.resourcesPath, 'migrations'),
    fallbackDirectory: join(currentDirectory, 'migrations')
  })
  seedDevelopmentDemoData(database, app)

  return database
}

export { getDatabase }
