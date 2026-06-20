/** 基础数据访问层：提供通用的数据库操作方法 */
import Database from 'better-sqlite3'

/** 分页选项 */
export interface PaginationOptions {
  /** 返回的最大记录数 */
  limit?: number
  /** 跳过的记录数（偏移量） */
  offset?: number
}

/**
 * 数据仓储基类
 * 提供通用的数据库访问方法，所有具体仓储类继承此类
 */
export abstract class BaseRepository {
  /**
   * 构造函数
   * @param database better-sqlite3数据库实例
   */
  protected constructor(protected readonly database: Database.Database) {}

  /**
   * 生成SQL分页子句
   * 根据分页选项生成对应的LIMIT和OFFSET子句
   * @param options 分页选项，包含limit和offset参数
   * @returns SQL分页子句字符串，如" LIMIT 10 OFFSET 20"，如果未指定limit则返回空字符串
   */
  protected getPaginationClause(options?: PaginationOptions): string {
    if (!options?.limit) {
      return ''
    }

    const offset = options.offset ?? 0
    return ` LIMIT ${options.limit} OFFSET ${offset}`
  }
}
