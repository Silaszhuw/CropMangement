/** 种植记录详情 - 农事操作标签页：管理施肥灌溉等田间操作记录 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { OperationRecord } from '../../../../shared/types/database'
import type {
  CreateOperationRecordInput,
  UpdateOperationRecordInput
} from '../../../../main/database/repositories/operation-records-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createOperationRecord,
  deleteOperationRecord,
  fetchOperationRecordsByPlantingRecordId,
  updateOperationRecord
} from '../../store/slices/operation-records.slice'

interface OperationRecordsTabProps {
  plantingRecordId: number
}

interface OperationRecordFormValues {
  operationType: string
  operationDate: dayjs.Dayjs
  details?: string
  cost?: number
  operator?: string
  notes?: string
}

function mapFormValues(record: OperationRecord): OperationRecordFormValues {
  return {
    operationType: record.operationType,
    operationDate: dayjs(record.operationDate),
    details: record.details ?? undefined,
    cost: record.cost ?? undefined,
    operator: record.operator ?? undefined,
    notes: record.notes ?? undefined
  }
}

export function OperationRecordsTab({ plantingRecordId }: OperationRecordsTabProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.operationRecords)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<OperationRecordFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<OperationRecord | null>(null)

  useEffect(() => {
    void dispatch(fetchOperationRecordsByPlantingRecordId(plantingRecordId))
  }, [dispatch, plantingRecordId])

  const handleEdit = useCallback(
    (record: OperationRecord) => {
      setEditingRecord(record)
      form.setFieldsValue(mapFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteOperationRecord(id)).unwrap()
        messageApi.success('农事操作删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const columns: ColumnsType<OperationRecord> = useMemo(
    () => [
      { title: '操作日期', dataIndex: 'operationDate', key: 'operationDate' },
      { title: '操作类型', dataIndex: 'operationType', key: 'operationType' },
      { title: '成本（元）', dataIndex: 'cost', key: 'cost', render: (v) => v ?? '-' },
      { title: '操作人', dataIndex: 'operator', key: 'operator', render: (v) => v ?? '-' },
      { title: '详情', dataIndex: 'details', key: 'details', render: (v) => v ?? '-' },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该农事操作吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleDelete, handleEdit]
  )

  async function handleSubmit(values: OperationRecordFormValues): Promise<void> {
    try {
      const payload = {
        plantingRecordId,
        operationType: values.operationType,
        operationDate: values.operationDate.format('YYYY-MM-DD'),
        details: values.details ?? null,
        cost: values.cost ?? null,
        operator: values.operator ?? null,
        notes: values.notes ?? null
      }

      if (editingRecord) {
        await dispatch(updateOperationRecord({ id: editingRecord.id, ...payload } satisfies UpdateOperationRecordInput)).unwrap()
        messageApi.success('农事操作更新成功')
      } else {
        await dispatch(createOperationRecord(payload satisfies CreateOperationRecordInput)).unwrap()
        messageApi.success('农事操作创建成功')
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
      <Button type="primary" onClick={() => { setEditingRecord(null); form.setFieldsValue({ operationDate: dayjs(), operationType: '施肥' }); setModalOpen(true) }}>
        新增农事操作
      </Button>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      <Modal destroyOnHidden open={modalOpen} title={editingRecord ? '编辑农事操作' : '新增农事操作'} confirmLoading={submitting} onCancel={() => setModalOpen(false)} onOk={() => void form.submit()}>
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="操作类型" name="operationType" rules={[{ required: true, message: '请选择操作类型' }]}>
            <Select options={[{ label: '施肥', value: '施肥' }, { label: '灌溉', value: '灌溉' }, { label: '除草', value: '除草' }, { label: '打药', value: '打药' }, { label: '收获', value: '收获' }, { label: '其他', value: '其他' }]} />
          </Form.Item>
          <Form.Item label="操作日期" name="operationDate" rules={[{ required: true, message: '请选择操作日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="操作详情" name="details"><Input.TextArea rows={3} placeholder="可填写施肥方案、灌溉情况等" /></Form.Item>
          <Form.Item label="成本（元）" name="cost"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="操作人员" name="operator"><Input /></Form.Item>
          <Form.Item label="备注" name="notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
