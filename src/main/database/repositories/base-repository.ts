import Database from 'better-sqlite3'

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export abstract class BaseRepository {
  protected constructor(protected readonly database: Database.Database) {}

  protected getPaginationClause(options?: PaginationOptions): string {
    if (!options?.limit) {
      return ''
    }

    const offset = options.offset ?? 0
    return ` LIMIT ${options.limit} OFFSET ${offset}`
  }
}
