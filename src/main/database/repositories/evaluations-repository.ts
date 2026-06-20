/** 评价数据访问层：提供效益评价的 CRUD 操作 */
import Database from 'better-sqlite3'
import type { Evaluation } from '../../../shared/types/database'
import { BaseRepository } from './base-repository'

interface EvaluationRow {
  id: number
  planting_record_id: number
  evaluation_date: string
  evaluation_type: string
  actual_yield: number | null
  total_cost: number | null
  total_income: number | null
  net_profit: number | null
  overall_score: number | null
  improvement_suggestions: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateEvaluationInput {
  plantingRecordId: number
  evaluationDate: string
  evaluationType: string
  actualYield?: number | null
  totalCost?: number | null
  totalIncome?: number | null
  netProfit?: number | null
  overallScore?: number | null
  improvementSuggestions?: string | null
  notes?: string | null
}

export interface UpdateEvaluationInput extends CreateEvaluationInput {
  id: number
}

function mapEvaluation(row: EvaluationRow): Evaluation {
  return {
    id: row.id,
    plantingRecordId: row.planting_record_id,
    evaluationDate: row.evaluation_date,
    evaluationType: row.evaluation_type,
    actualYield: row.actual_yield,
    totalCost: row.total_cost,
    totalIncome: row.total_income,
    netProfit: row.net_profit,
    overallScore: row.overall_score,
    improvementSuggestions: row.improvement_suggestions,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export class EvaluationsRepository extends BaseRepository {
  constructor(database: Database.Database) {
    super(database)
  }

  /**
   * 根据种植记录 ID 查询效益评价列表
   * @param plantingRecordId 种植记录ID
   * @returns 效益评价列表，按评价日期降序、ID 降序排列
   */
  findAllByPlantingRecordId(plantingRecordId: number): Evaluation[] {
    const rows = this.database
      .prepare<[number], EvaluationRow>(
        'SELECT * FROM evaluations WHERE planting_record_id = ? ORDER BY evaluation_date DESC, id DESC'
      )
      .all(plantingRecordId)

    return rows.map(mapEvaluation)
  }

  /**
   * 根据 ID 查询效益评价
   * @param id 记录ID
   * @returns 效益评价对象，如果不存在则返回 null
   */
  findById(id: number): Evaluation | null {
    const row = this.database.prepare<[number], EvaluationRow>('SELECT * FROM evaluations WHERE id = ?').get(id)
    return row ? mapEvaluation(row) : null
  }

  /**
   * 创建效益评价
   * @param input 创建输入数据
   * @returns 创建的效益评价对象
   * @throws 如果创建失败则抛出错误
   */
  create(input: CreateEvaluationInput): Evaluation {
    const result = this.database
      .prepare(
        `INSERT INTO evaluations (
          planting_record_id,
          evaluation_date,
          evaluation_type,
          actual_yield,
          total_cost,
          total_income,
          net_profit,
          overall_score,
          improvement_suggestions,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        input.plantingRecordId,
        input.evaluationDate,
        input.evaluationType,
        input.actualYield ?? null,
        input.totalCost ?? null,
        input.totalIncome ?? null,
        input.netProfit ?? null,
        input.overallScore ?? null,
        input.improvementSuggestions ?? null,
        input.notes ?? null
      )

    const created = this.findById(Number(result.lastInsertRowid))
    if (!created) {
      throw new Error('Failed to create evaluation.')
    }

    return created
  }

  /**
   * 更新效益评价
   * @param input 更新输入数据
   * @returns 更新后的效益评价对象
   * @throws 如果记录不存在则抛出错误
   */
  update(input: UpdateEvaluationInput): Evaluation {
    this.database
      .prepare(
        `UPDATE evaluations SET
          planting_record_id = ?,
          evaluation_date = ?,
          evaluation_type = ?,
          actual_yield = ?,
          total_cost = ?,
          total_income = ?,
          net_profit = ?,
          overall_score = ?,
          improvement_suggestions = ?,
          notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`
      )
      .run(
        input.plantingRecordId,
        input.evaluationDate,
        input.evaluationType,
        input.actualYield ?? null,
        input.totalCost ?? null,
        input.totalIncome ?? null,
        input.netProfit ?? null,
        input.overallScore ?? null,
        input.improvementSuggestions ?? null,
        input.notes ?? null,
        input.id
      )

    const updated = this.findById(input.id)
    if (!updated) {
      throw new Error(`Evaluation ${input.id} not found after update.`)
    }

    return updated
  }

  /**
   * 删除效益评价
   * @param id 记录ID
   */
  delete(id: number): void {
    this.database.prepare('DELETE FROM evaluations WHERE id = ?').run(id)
  }
}
