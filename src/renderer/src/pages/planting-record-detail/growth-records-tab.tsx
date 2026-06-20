/** 种植记录详情 - 生长记录标签页：管理玉米生长观测数据 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { GrowthRecord } from '../../../../shared/types/database'
import type {
  CreateGrowthRecordInput,
  UpdateGrowthRecordInput
} from '../../../../main/database/repositories/growth-records-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createGrowthRecord,
  deleteGrowthRecord,
  fetchGrowthRecordsByPlantingRecordId,
  updateGrowthRecord
} from '../../store/slices/growth-records.slice'

interface GrowthRecordsTabProps {
  plantingRecordId: number
}

interface GrowthRecordFormValues {
  recordDate: dayjs.Dayjs
  growthStage: string
  plantHeight?: number
  leafCount?: number
  leafColor?: string
  diseaseStatus?: string
  pestStatus?: string
  soilMoisture?: number
  weatherTemperatureAvg?: number
  weatherRainfall?: number
  notes?: string
}

function mapFormValues(record: GrowthRecord): GrowthRecordFormValues {
  return {
    recordDate: dayjs(record.recordDate),
    growthStage: record.growthStage,
    plantHeight: record.plantHeight ?? undefined,
    leafCount: record.leafCount ?? undefined,
    leafColor: record.leafColor ?? undefined,
    diseaseStatus: record.diseaseStatus ?? undefined,
    pestStatus: record.pestStatus ?? undefined,
    soilMoisture: record.soilMoisture ?? undefined,
    weatherTemperatureAvg: record.weatherTemperatureAvg ?? undefined,
    weatherRainfall: record.weatherRainfall ?? undefined,
    notes: record.notes ?? undefined
  }
}

export function GrowthRecordsTab({ plantingRecordId }: GrowthRecordsTabProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.growthRecords)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<GrowthRecordFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GrowthRecord | null>(null)

  useEffect(() => {
    void dispatch(fetchGrowthRecordsByPlantingRecordId(plantingRecordId))
  }, [dispatch, plantingRecordId])

  const handleEdit = useCallback(
    (record: GrowthRecord) => {
      setEditingRecord(record)
      form.setFieldsValue(mapFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteGrowthRecord(id)).unwrap()
        messageApi.success('生长记录删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const columns: ColumnsType<GrowthRecord> = useMemo(
    () => [
      { title: '记录日期', dataIndex: 'recordDate', key: 'recordDate' },
      { title: '生长阶段', dataIndex: 'growthStage', key: 'growthStage' },
      { title: '株高(cm)', dataIndex: 'plantHeight', key: 'plantHeight', render: (v) => v ?? '-' },
      { title: '叶片数', dataIndex: 'leafCount', key: 'leafCount', render: (v) => v ?? '-' },
      { title: '病害', dataIndex: 'diseaseStatus', key: 'diseaseStatus', render: (v) => v ?? '-' },
      { title: '虫害', dataIndex: 'pestStatus', key: 'pestStatus', render: (v) => v ?? '-' },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除该生长记录吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleDelete, handleEdit]
  )

  async function handleSubmit(values: GrowthRecordFormValues): Promise<void> {
    try {
      const payload = {
        plantingRecordId,
        recordDate: values.recordDate.format('YYYY-MM-DD'),
        growthStage: values.growthStage,
        plantHeight: values.plantHeight ?? null,
        leafCount: values.leafCount ?? null,
        leafColor: values.leafColor ?? null,
        diseaseStatus: values.diseaseStatus ?? null,
        pestStatus: values.pestStatus ?? null,
        soilMoisture: values.soilMoisture ?? null,
        weatherTemperatureAvg: values.weatherTemperatureAvg ?? null,
        weatherRainfall: values.weatherRainfall ?? null,
        notes: values.notes ?? null
      }

      if (editingRecord) {
        await dispatch(updateGrowthRecord({ id: editingRecord.id, ...payload } satisfies UpdateGrowthRecordInput)).unwrap()
        messageApi.success('生长记录更新成功')
      } else {
        await dispatch(createGrowthRecord(payload satisfies CreateGrowthRecordInput)).unwrap()
        messageApi.success('生长记录创建成功')
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
      <Button type="primary" onClick={() => { setEditingRecord(null); form.setFieldsValue({ recordDate: dayjs() }); setModalOpen(true) }}>
        新增生长记录
      </Button>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑生长记录' : '新增生长记录'}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="记录日期" name="recordDate" rules={[{ required: true, message: '请选择记录日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="生长阶段" name="growthStage" rules={[{ required: true, message: '请选择生长阶段' }]}>
            <Select options={[{ label: '苗期', value: '苗期' }, { label: '拔节期', value: '拔节期' }, { label: '抽雄期', value: '抽雄期' }, { label: '灌浆期', value: '灌浆期' }, { label: '成熟期', value: '成熟期' }]} />
          </Form.Item>
          <Form.Item label="株高（cm）" name="plantHeight"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="叶片数" name="leafCount"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="叶色" name="leafColor"><Input /></Form.Item>
          <Form.Item label="病害状况" name="diseaseStatus"><Input /></Form.Item>
          <Form.Item label="虫害状况" name="pestStatus"><Input /></Form.Item>
          <Form.Item label="土壤含水量（%）" name="soilMoisture"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="平均温度（℃）" name="weatherTemperatureAvg"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="降雨量（mm）" name="weatherRainfall"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="备注" name="notes"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
