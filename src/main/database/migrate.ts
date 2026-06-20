/**
 * 数据库迁移管理：扫描并执行 SQL 迁移文件，记录已应用版本到 schema_migrations 表
 */

import Database from 'better-sqlite3'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

interface MigrationOptions {
  isPackaged: boolean
  developmentDirectory: string
  packagedDirectory: string
  fallbackDirectory: string
}

function ensureMetaTables(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

function resolveMigrationDirectory(options: MigrationOptions): string {
  if (!options.isPackaged && existsSync(options.developmentDirectory)) {
    return options.developmentDirectory
  }

  if (existsSync(options.packagedDirectory)) {
    return options.packagedDirectory
  }

  return options.fallbackDirectory
}

export function runMigrations(database: Database.Database, options: MigrationOptions): void {
  ensureMetaTables(database)

  const appliedVersions = new Set(
    (database.prepare('SELECT version FROM schema_migrations').all() as Array<{ version: string }>).map(
      (row) => row.version
    )
  )

  const migrationDirectory = resolveMigrationDirectory(options)
  const migrationFiles = readdirSync(migrationDirectory)
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right))

  for (const fileName of migrationFiles) {
    if (appliedVersions.has(fileName)) {
      continue
    }

    const migrationPath = join(migrationDirectory, fileName)
    const sql = readFileSync(migrationPath, 'utf-8')
    const applyMigration = database.transaction(() => {
      database.exec(sql)
      database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(fileName)
    })

    applyMigration()
  }
}
