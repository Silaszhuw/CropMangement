/** 试验数据管理页面：作为二级工作台组织试验记录和生育期试验数据管理入口 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
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
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)
  const fieldsState = useAppSelector((state) => state.fields)
  const cropVarietiesState = useAppSelector((state) => state.cropVarieties)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<PlantingRecordFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PlantingRecord | null>(null)
  const [keyword, setKeyword] = useState('')
  const [yearFilter, setYearFilter] = useState<number | undefined>()
  const [seasonFilter, setSeasonFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchPlantingRecords())
    void dispatch(fetchFields())
    void dispatch(fetchCropVarieties())
  }, [dispatch])

  const fieldMap = useMemo(() => buildFieldMap(fieldsState.items), [fieldsState.items])
  const varietyMap = useMemo(() => buildVarietyMap(cropVarietiesState.items), [cropVarietiesState.items])
  const statusSummary = useMemo(
    () => ({
      growing: plantingRecordsState.items.filter((item) => item.status === 'growing').length,
      harvested: plantingRecordsState.items.filter((item) => item.status === 'harvested').length
    }),
    [plantingRecordsState.items]
  )

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return plantingRecordsState.items.filter((item) => {
      const fieldName = fieldMap.get(item.fieldId)?.name
      const varietyName = varietyMap.get(item.varietyId)?.name
      const matchesKeyword =
        !normalizedKeyword ||
        [fieldName, varietyName, item.season, item.status, item.notes]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword))

      const matchesYear = !yearFilter || item.year === yearFilter
      const matchesSeason = !seasonFilter || item.season === seasonFilter
      const matchesStatus = !statusFilter || item.status === statusFilter

      return matchesKeyword && matchesYear && matchesSeason && matchesStatus
    })
  }, [plantingRecordsState.items, keyword, yearFilter, seasonFilter, statusFilter, fieldMap, varietyMap])

  const yearOptions = useMemo(
    () => Array.from(new Set(plantingRecordsState.items.map((item) => item.year))).sort((a, b) => b - a).map((value) => ({ label: String(value), value })),
    [plantingRecordsState.items]
  )

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
            <Button type="link" onClick={() => navigate(`/experimental-data/${record.id}`)}>
              查看详情
            </Button>
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
    [fieldMap, handleDelete, handleEdit, navigate, varietyMap]
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
            试验数据管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            本模块为二级工作台，负责组织试验记录台账与专题试验录入入口。根据 PDF 结构，生育期试验数据管理应作为独立三级页面进入。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">筛选后 {filteredItems.length} / 共 {plantingRecordsState.items.length} 条</Tag>
          <Button type="primary" onClick={handleCreate}>
            新增种植记录
          </Button>
        </Space>
      </div>

      <div className="module-grid">
        <Card
          className="module-entry-card"
          title="生育期试验数据管理"
          extra={
            <Button type="link" onClick={() => navigate('/experimental-data/growth-stage')}>
              进入三级界面
            </Button>
          }
        >
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              录入拔节、抽雄、吐丝、成熟等关键生育阶段观测信息，形成可用于模型校准和生育进程预测的试验观测台账。
            </Typography.Paragraph>
            <Button type="primary" onClick={() => navigate('/experimental-data/growth-stage')}>
              打开生育期试验数据管理
            </Button>
          </Space>
        </Card>

        <Card className="module-entry-card" title="试验记录总览">
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              下方表格继续承担试验批次与种植记录主台账功能，用于维护地块、品种、播种日期和生育状态等基础业务数据。
            </Typography.Paragraph>
            <Space wrap>
              <Tag color="processing">在种 {statusSummary.growing} 条</Tag>
              <Tag color="success">已收获 {statusSummary.harvested} 条</Tag>
            </Space>
          </Space>
        </Card>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索地块、品种、季节、状态、备注"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="按年份筛选"
          value={yearFilter}
          onChange={setYearFilter}
          options={yearOptions}
          style={{ width: 140 }}
        />
        <Select
          allowClear
          placeholder="按季节筛选"
          value={seasonFilter}
          onChange={setSeasonFilter}
          options={[
            { label: '春播', value: '春播' },
            { label: '夏播', value: '夏播' }
          ]}
          style={{ width: 140 }}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'planning', value: 'planning' },
            { label: 'growing', value: 'growing' },
            { label: 'harvested', value: 'harvested' },
            { label: 'failed', value: 'failed' }
          ]}
          style={{ width: 160 }}
        />
      </div>

      <Table
        rowKey="id"
        loading={plantingRecordsState.loading || fieldsState.loading || cropVarietiesState.loading}
        columns={columns}
        dataSource={filteredItems}
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
