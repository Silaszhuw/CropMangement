import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { Field, CropVariety, PlantingRecord } from '../../../../shared/types/database'
import type {
  CreatePlantingRecordInput,
  UpdatePlantingRecordInput
} from '../../../../main/database/repositories/planting-records-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCropVarieties } from '../../store/slices/crop-varieties.slice'
import { fetchFields } from '../../store/slices/fields.slice'
import {
  createPlantingRecord,
  deletePlantingRecord,
  fetchPlantingRecords,
  updatePlantingRecord
} from '../../store/slices/planting-records.slice'

interface PlantingRecordFormValues {
  fieldId: number
  varietyId: number
  year: number
  season: string
  plantingDate: dayjs.Dayjs
  expectedHarvestDate?: dayjs.Dayjs
  actualHarvestDate?: dayjs.Dayjs
  plantingDensity?: number
  rowSpacing?: number
  plantSpacing?: number
  status: string
  notes?: string
}

function mapPlantingRecordToFormValues(record: PlantingRecord): PlantingRecordFormValues {
  return {
    fieldId: record.fieldId,
    varietyId: record.varietyId,
    year: record.year,
    season: record.season,
    plantingDate: dayjs(record.plantingDate),
    expectedHarvestDate: record.expectedHarvestDate ? dayjs(record.expectedHarvestDate) : undefined,
    actualHarvestDate: record.actualHarvestDate ? dayjs(record.actualHarvestDate) : undefined,
    plantingDensity: record.plantingDensity ?? undefined,
    rowSpacing: record.rowSpacing ?? undefined,
    plantSpacing: record.plantSpacing ?? undefined,
    status: record.status,
    notes: record.notes ?? undefined
  }
}

function buildFieldMap(fields: Field[]): Map<number, Field> {
  return new Map(fields.map((item) => [item.id, item]))
}

function buildVarietyMap(varieties: CropVariety[]): Map<number, CropVariety> {
  return new Map(varieties.map((item) => [item.id, item]))
}

export function PlantingRecordsPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)
  const fieldsState = useAppSelector((state) => state.fields)
  const cropVarietiesState = useAppSelector((state) => state.cropVarieties)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<PlantingRecordFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PlantingRecord | null>(null)

  useEffect(() => {
    void dispatch(fetchPlantingRecords())
    void dispatch(fetchFields())
    void dispatch(fetchCropVarieties())
  }, [dispatch])

  const fieldMap = useMemo(() => buildFieldMap(fieldsState.items), [fieldsState.items])
  const varietyMap = useMemo(() => buildVarietyMap(cropVarietiesState.items), [cropVarietiesState.items])

  const handleEdit = useCallback(
    (record: PlantingRecord): void => {
      setEditingRecord(record)
      form.setFieldsValue(mapPlantingRecordToFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deletePlantingRecord(id)).unwrap()
        messageApi.success('种植记录删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const columns: ColumnsType<PlantingRecord> = useMemo(
    () => [
      {
        title: '年份 / 季节',
        key: 'season',
        render: (_, record) => `${record.year} / ${record.season}`
      },
      {
        title: '地块',
        key: 'field',
        render: (_, record) => fieldMap.get(record.fieldId)?.name ?? `地块 #${record.fieldId}`
      },
      {
        title: '品种',
        key: 'variety',
        render: (_, record) => varietyMap.get(record.varietyId)?.name ?? `品种 #${record.varietyId}`
      },
      {
        title: '播种日期',
        dataIndex: 'plantingDate',
        key: 'plantingDate'
      },
      {
        title: '种植密度',
        dataIndex: 'plantingDensity',
        key: 'plantingDensity',
        render: (value: number | null) => value ?? '-'
      },
      {
        title: '状态',
        key: 'status',
        render: (_, record) => {
          const colorMap: Record<string, string> = {
            planning: 'default',
            growing: 'processing',
            harvested: 'success',
            failed: 'error'
          }

          return <Tag color={colorMap[record.status] ?? 'default'}>{record.status}</Tag>
        }
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除该种植记录吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [fieldMap, handleDelete, handleEdit, varietyMap]
  )

  function handleCreate(): void {
    setEditingRecord(null)
    form.setFieldsValue({
      year: dayjs().year(),
      season: '春播',
      plantingDate: dayjs(),
      status: 'planning'
    })
    setModalOpen(true)
  }

  async function handleSubmit(values: PlantingRecordFormValues): Promise<void> {
    try {
      const payload = {
        fieldId: values.fieldId,
        varietyId: values.varietyId,
        year: values.year,
        season: values.season,
        plantingDate: values.plantingDate.format('YYYY-MM-DD'),
        expectedHarvestDate: values.expectedHarvestDate?.format('YYYY-MM-DD') ?? null,
        actualHarvestDate: values.actualHarvestDate?.format('YYYY-MM-DD') ?? null,
        plantingDensity: values.plantingDensity ?? null,
        rowSpacing: values.rowSpacing ?? null,
        plantSpacing: values.plantSpacing ?? null,
        status: values.status,
        notes: values.notes ?? null
      }

      if (editingRecord) {
        const updatePayload: UpdatePlantingRecordInput = {
          id: editingRecord.id,
          ...payload
        }
        await dispatch(updatePlantingRecord(updatePayload)).unwrap()
        messageApi.success('种植记录更新成功')
      } else {
        const createPayload: CreatePlantingRecordInput = payload
        await dispatch(createPlantingRecord(createPayload)).unwrap()
        messageApi.success('种植记录创建成功')
      }

      setModalOpen(false)
      form.resetFields()
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      {contextHolder}
      <div className="page-header">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            种植记录
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            将地块与品种串联为具体种植计划，记录播种、收获与当前状态，是后续生长监测和效益评价的主线数据。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">共 {plantingRecordsState.items.length} 条</Tag>
          <Button type="primary" onClick={handleCreate}>
            新增种植记录
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={plantingRecordsState.loading || fieldsState.loading || cropVarietiesState.loading}
        columns={columns}
        dataSource={plantingRecordsState.items}
      />

      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑种植记录' : '新增种植记录'}
        okText={editingRecord ? '保存修改' : '创建记录'}
        cancelText="取消"
        confirmLoading={plantingRecordsState.submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ year: dayjs().year(), season: '春播', plantingDate: dayjs(), status: 'planning' }}
          onFinish={(values) => void handleSubmit(values)}
        >
          <Form.Item label="关联地块" name="fieldId" rules={[{ required: true, message: '请选择地块' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={fieldsState.items.map((item) => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
          <Form.Item label="关联品种" name="varietyId" rules={[{ required: true, message: '请选择品种' }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={cropVarietiesState.items.map((item) => ({ label: item.name, value: item.id }))}
            />
          </Form.Item>
          <Form.Item label="种植年份" name="year" rules={[{ required: true, message: '请输入种植年份' }]}>
            <InputNumber min={2000} max={2100} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="种植季节" name="season" rules={[{ required: true, message: '请选择种植季节' }]}>
            <Select
              options={[
                { label: '春播', value: '春播' },
                { label: '夏播', value: '夏播' }
              ]}
            />
          </Form.Item>
          <Form.Item label="播种日期" name="plantingDate" rules={[{ required: true, message: '请选择播种日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="预计收获日期" name="expectedHarvestDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="实际收获日期" name="actualHarvestDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="种植密度（株/亩）" name="plantingDensity">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="行距（cm）" name="rowSpacing">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="株距（cm）" name="plantSpacing">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select
              options={[
                { label: 'planning', value: 'planning' },
                { label: 'growing', value: 'growing' },
                { label: 'harvested', value: 'harvested' },
                { label: 'failed', value: 'failed' }
              ]}
            />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
