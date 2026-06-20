/** 决策数据访问层：提供决策记录的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { Decision } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface DecisionRow {
  id: number
  field_id: number | null
  planting_record_id: number | null
  decision_type: string
  decision_category: string
  decision_date: string
  title: string
  content: string
  basis_summary: string | null
  recommended_actions: string | null
  status: string
  user_feedback: string | null
  created_at: string
  updated_at: string
}

export interface CreateDecisionInput {
  fieldId?: number | null
  plantingRecordId?: number | null
  decisionType: string
  decisionCategory: string
  decisionDate: string
  title: string
  content: string
  basisSummary?: string | null
  recommendedActions?: string | null
  status?: string
  userFeedback?: string | null
}

export interface UpdateDecisionInput extends CreateDecisionInput {
  id: number
}

function mapDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    fieldId: row.field_id,
    plantingRecordId: row.planting_record_id,
    decisionType: row.decision_type,
    decisionCategory: row.decision_category,
    decisionDate: row.decision_date,
    title: row.title,
    content: row.content,
    basisSummary: row.basis_summary,
    recommendedActions: row.recommended_actions,
    status: row.status,
    userFeedback: row.user_feedback,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class DecisionsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 查询所有决策记录
   * @returns 决策记录列表，按决策日期降序、ID 降序排列
   */
  findAll(): Decision[] {
    const rows = this.database
      .prepare<[], DecisionRow>(
        'SELECT * FROM decisions ORDER BY decision_date DESC, id DESC'
      )
      .all()
    return rows.map(mapDecision)
  }

  /**
   * 根据 ID 查询决策记录
   * @param id 记录ID
   * @returns 决策记录对象，如果不存在则返回 null
   */
  findById(id: number): Decision | null {
    const row = this.database.prepare<[number], DecisionRow>('SELECT * FROM decisions WHERE id = ?').get(id)
    return row ? mapDecision(row) : null
  }

  /**
   * 创建决策记录
   * @param input 创建输入数据，status 默认为 'pending'
   * @returns 创建的决策记录对象
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateDecisionInput): Decision {
    const result = this.database
      .prepare(
        `INSERT INTO decisions (
          field_id,
          planting_record_id,
          decision_type,
          decision_category,
          decision_date,
          title,
          content,
          basis_summary,
          recommended_actions,
          status,
          user_feedback
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.fieldId ?? null,
        input.plantingRecordId ?? null,
        input.decisionType,
        input.decisionCategory,
        input.decisionDate,
        input.title,
        input.content,
        input.basisSummary ?? null,
        input.recommendedActions ?? null,
        input.status ?? 'pending',
        input.userFeedback ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create decision.')
    }

    return created
  }

  /**
   * 更新决策记录
   * @param input 更新输入数据
   * @returns 更新后的决策记录对象
   * @throws 如果记录不存在则抛出错误
   */
  update(input: UpdateDecisionInput): Decision {
    this.database
      .prepare(
        `UPDATE decisions SET
          field_id = ?,
          planting_record_id = ?,
          decision_type = ?,
          decision_category = ?,
          decision_date = ?,
          title = ?,
          content = ?,
          basis_summary = ?,
          recommended_actions = ?,
          status = ?,
          user_feedback = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.fieldId ?? null,
        input.plantingRecordId ?? null,
        input.decisionType,
        input.decisionCategory,
        input.decisionDate,
        input.title,
        input.content,
        input.basisSummary ?? null,
        input.recommendedActions ?? null,
        input.status ?? 'pending',
        input.userFeedback ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Decision ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除决策记录
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM decisions WHERE id = ?').run(id)
  }
}
