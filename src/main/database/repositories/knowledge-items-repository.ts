/** 知识项数据访问层：提供专家知识的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { KnowledgeItem } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface KnowledgeItemRow {
  id: number
  category: string
  title: string
  content: string
  tags: string | null
  source: string | null
  is_active: number
  created_at: string
  updated_at: string
}

export interface CreateKnowledgeItemInput {
  category: string
  title: string
  content: string
  tags?: string | null
  source?: string | null
  isActive?: boolean
}

export interface UpdateKnowledgeItemInput extends CreateKnowledgeItemInput {
  id: number
}

function mapKnowledgeItem(row: KnowledgeItemRow): KnowledgeItem {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    content: row.content,
    tags: row.tags,
    source: row.source,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class KnowledgeItemsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有知识项
   * @returns 知识项列表，按更新时间降序、ID 降序排列
   */
  findAll(): KnowledgeItem[] {
    const rows = this.database
      .prepare<[], KnowledgeItemRow>(
        'SELECT * FROM knowledge_items ORDER BY updated_at DESC, id DESC'
      )
      .all()

    return rows.map(mapKnowledgeItem)
  }

  /**
   * 根据 ID 查询知识项
   * @param id 记录ID
   * @returns 知识项对象，如果不存在则返回 null
   */
  findById(id: number): KnowledgeItem | null {
    const row = this.database
      .prepare<[number], KnowledgeItemRow>('SELECT * FROM knowledge_items WHERE id = ?')
      .get(id)

    return row ? mapKnowledgeItem(row) : null
  }

  /**
   * 创建知识项
   * @param input 创建输入数据，isActive 默认为 true
   * @returns 创建的知识项对象
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateKnowledgeItemInput): KnowledgeItem {
    const result = this.database
      .prepare(
        `INSERT INTO knowledge_items (
          category,
          title,
          content,
          tags,
          source,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.category,
        input.title,
        input.content,
        input.tags ?? null,
        input.source ?? null,
        input.isActive === false ? 0 : 1
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create knowledge item.')
    }

    return created
  }

  /**
   * 更新知识项
   * @param input 更新输入数据
   * @returns 更新后的知识项对象
   * @throws 如果记录不存在则抛出错误
   */
  update(input: UpdateKnowledgeItemInput): KnowledgeItem {
    this.database
      .prepare(
        `UPDATE knowledge_items SET
          category = ?,
          title = ?,
          content = ?,
          tags = ?,
          source = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.category,
        input.title,
        input.content,
        input.tags ?? null,
        input.source ?? null,
        input.isActive === false ? 0 : 1,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Knowledge item ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除知识项
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM knowledge_items WHERE id = ?').run(id)
  }
}
