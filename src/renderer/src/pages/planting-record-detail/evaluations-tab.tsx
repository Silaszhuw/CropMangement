/** 种植记录详情 - 效益评价标签页：管理产量成本和效益评价数据 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Evaluation } from '../../../../shared/types/database'
import type {
  CreateEvaluationInput,
  UpdateEvaluationInput
} from '../../../../main/database/repositories/evaluations-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createEvaluation,
  deleteEvaluation,
  fetchEvaluationsByPlantingRecordId,
  updateEvaluation
} from '../../store/slices/evaluations.slice'

interface EvaluationsTabProps {
  plantingRecordId: number
}

interface EvaluationFormValues {
  evaluationDate: dayjs.Dayjs
  evaluationType: string
  actualYield?: number
  totalCost?: number
  totalIncome?: number
  netProfit?: number
  overallScore?: number
  improvementSuggestions?: string
  notes?: string
}

function mapFormValues(record: Evaluation): EvaluationFormValues {
  return {
    evaluationDate: dayjs(record.evaluationDate),
    evaluationType: record.evaluationType,
    actualYield: record.actualYield ?? undefined,
    totalCost: record.totalCost ?? undefined,
    totalIncome: record.totalIncome ?? undefined,
    netProfit: record.netProfit ?? undefined,
    overallScore: record.overallScore ?? undefined,
    improvementSuggestions: record.improvementSuggestions ?? undefined,
    notes: record.notes ?? undefined
  }
}

export function EvaluationsTab({ plantingRecordId }: EvaluationsTabProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.evaluations)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<EvaluationFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Evaluation | null>(null)

  useEffect(() => {
    void dispatch(fetchEvaluationsByPlantingRecordId(plantingRecordId))
  }, [dispatch, plantingRecordId])

  const handleEdit = useCallback(
    (record: Evaluation) => {
      setEditingRecord(record)
      form.setFieldsValue(mapFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteEvaluation(id)).unwrap()
        messageApi.success('效益评价删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const columns: ColumnsType<Evaluation> = useMemo(
    () => [
      { title: '评价日期', dataIndex: 'evaluationDate', key: 'evaluationDate' },
      { title: '评价类型', dataIndex: 'evaluationType', key: 'evaluationType' },
      { title: '实际产量', dataIndex: 'actualYield', key: 'actualYield', render: (v) => v ?? '-' },
      { title: '总成本', dataIndex: 'totalCost', key: 'totalCost', render: (v) => v ?? '-' },
      { title: '总收入', dataIndex: 'totalIncome', key: 'totalIncome', render: (v) => v ?? '-' },
      { title: '净利润', dataIndex: 'netProfit', key: 'netProfit', render: (v) => v ?? '-' },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该评价吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleDelete, handleEdit]
  )

  async function handleSubmit(values: EvaluationFormValues): Promise<void> {
    try {
      const payload = {
        plantingRecordId,
        evaluationDate: values.evaluationDate.format('YYYY-MM-DD'),
        evaluationType: values.evaluationType,
        actualYield: values.actualYield ?? null,
        totalCost: values.totalCost ?? null,
        totalIncome: values.totalIncome ?? null,
        netProfit: values.netProfit ?? null,
        overallScore: values.overallScore ?? null,
        improvementSuggestions: values.improvementSuggestions ?? null,
        notes: values.notes ?? null
      }

      if (editingRecord) {
        await dispatch(updateEvaluation({ id: editingRecord.id, ...payload } satisfies UpdateEvaluationInput)).unwrap()
        messageApi.success('效益评价更新成功')
      } else {
        await dispatch(createEvaluation(payload satisfies CreateEvaluationInput)).unwrap()
        messageApi.success('效益评价创建成功')
      }

      setModalOpen(false)
      form.resetFields()
      setEditingRecord(null)
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      {contextHolder}
      <Button type="primary" onClick={() => { setEditingRecord(null); form.setFieldsValue({ evaluationDate: dayjs(), evaluationType: '阶段评价' }); setModalOpen(true) }}>
        新增效益评价
      </Button>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      <Modal destroyOnHidden open={modalOpen} title={editingRecord ? '编辑效益评价' : '新增效益评价'} confirmLoading={submitting} onCancel={() => setModalOpen(false)} onOk={() => void form.submit()}>
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="评价日期" name="evaluationDate" rules={[{ required: true, message: '请选择评价日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="评价类型" name="evaluationType" rules={[{ required: true, message: '请选择评价类型' }]}>
            <Select options={[{ label: '阶段评价', value: '阶段评价' }, { label: '最终评价', value: '最终评价' }]} />
          </Form.Item>
          <Form.Item label="实际产量（kg/亩）" name="actualYield"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="总成本（元/亩）" name="totalCost"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="总收入（元/亩）" name="totalIncome"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="净利润（元/亩）" name="netProfit"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="综合评分" name="overallScore"><InputNumber style={{ width: '100%' }} min={0} max={100} /></Form.Item>
          <Form.Item label="改进建议" name="improvementSuggestions"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="备注" name="notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
