/** 参数管理页面：维护玉米品种参数档案 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import type { CropVariety } from '../../../../shared/types/database'
import type {
  CreateCropVarietyInput,
  UpdateCropVarietyInput
} from '../../../../main/database/repositories/crop-varieties-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createCropVariety,
  deleteCropVariety,
  fetchCropVarieties,
  updateCropVariety
} from '../../store/slices/crop-varieties.slice'

interface CropVarietyFormValues {
  name: string
  code?: string
  type: string
  growthPeriod?: number
  yieldPotential?: number
  diseaseResistance?: string
  description?: string
  isActive: boolean
}

function mapCropVarietyToFormValues(record: CropVariety): CropVarietyFormValues {
  return {
    name: record.name,
    code: record.code ?? undefined,
    type: record.type,
    growthPeriod: record.growthPeriod ?? undefined,
    yieldPotential: record.yieldPotential ?? undefined,
    diseaseResistance: record.diseaseResistance ?? undefined,
    description: record.description ?? undefined,
    isActive: record.isActive
  }
}

export function CropVarietiesPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, submitting } = useAppSelector((state) => state.cropVarieties)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<CropVarietyFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<CropVariety | null>(null)
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchCropVarieties())
  }, [dispatch])

  const handleEdit = useCallback(
    (record: CropVariety): void => {
      setEditingRecord(record)
      form.setFieldsValue(mapCropVarietyToFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deleteCropVariety(id)).unwrap()
        messageApi.success('品种删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return items.filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [item.name, item.code, item.type, item.diseaseResistance, item.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword))

      const matchesType = !typeFilter || item.type === typeFilter
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'enabled' && item.isActive) ||
        (statusFilter === 'disabled' && !item.isActive)

      return matchesKeyword && matchesType && matchesStatus
    })
  }, [items, keyword, typeFilter, statusFilter])

  const typeOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.type))).map((value) => ({ label: value, value })),
    [items]
  )

  const columns: ColumnsType<CropVariety> = useMemo(
    () => [
      {
        title: '品种名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '编号',
        dataIndex: 'code',
        key: 'code',
        render: (value: string | null) => value ?? '-'
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type'
      },
      {
        title: '生育期（天）',
        dataIndex: 'growthPeriod',
        key: 'growthPeriod',
        render: (value: number | null) => value ?? '-'
      },
      {
        title: '产量潜力（kg/亩）',
        dataIndex: 'yieldPotential',
        key: 'yieldPotential',
        render: (value: number | null) => value ?? '-'
      },
      {
        title: '状态',
        key: 'isActive',
        render: (_, record) => (record.isActive ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>)
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => navigate(`/parameter-management/${record.id}`)}>
              查看参数详情
            </Button>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除该品种吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleDelete, handleEdit, navigate]
  )

  function handleCreate(): void {
    setEditingRecord(null)
    form.setFieldsValue({ isActive: true, type: '中熟' })
    setModalOpen(true)
  }

  async function handleSubmit(values: CropVarietyFormValues): Promise<void> {
    try {
      if (editingRecord) {
        const payload: UpdateCropVarietyInput = {
          id: editingRecord.id,
          ...values
        }
        await dispatch(updateCropVariety(payload)).unwrap()
        messageApi.success('品种更新成功')
      } else {
        const payload: CreateCropVarietyInput = { ...values }
        await dispatch(createCropVariety(payload)).unwrap()
        messageApi.success('品种创建成功')
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
            参数管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            维护玉米品种参数档案，包括品种编号、熟期类型、生育期、产量潜力和抗病性描述，为模拟、预测与试验数据关联提供基础参数。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">筛选后 {filteredItems.length} / 共 {items.length} 条</Tag>
          <Button type="primary" onClick={handleCreate}>
            新增品种参数
          </Button>
        </Space>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索名称、编号、类型、抗病性、说明"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="按类型筛选"
          value={typeFilter}
          onChange={setTypeFilter}
          options={typeOptions}
          style={{ width: 180 }}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: '启用', value: 'enabled' },
            { label: '停用', value: 'disabled' }
          ]}
          style={{ width: 180 }}
        />
      </div>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={filteredItems} />

      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑品种' : '新增品种'}
        okText={editingRecord ? '保存修改' : '创建品种'}
        cancelText="取消"
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ isActive: true, type: '中熟' }}
          onFinish={(values) => void handleSubmit(values)}
        >
          <Form.Item label="品种名称" name="name" rules={[{ required: true, message: '请输入品种名称' }]}>
            <Input placeholder="例如：郑单 958" />
          </Form.Item>
          <Form.Item label="品种编号" name="code">
            <Input placeholder="例如：ZD-958" />
          </Form.Item>
          <Form.Item label="品种类型" name="type" rules={[{ required: true, message: '请选择品种类型' }]}>
            <Select
              options={[
                { label: '早熟', value: '早熟' },
                { label: '中熟', value: '中熟' },
                { label: '晚熟', value: '晚熟' }
              ]}
            />
          </Form.Item>
          <Form.Item label="生育期（天）" name="growthPeriod">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="产量潜力（kg/亩）" name="yieldPotential">
            <InputNumber min={0} precision={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="抗病性描述" name="diseaseResistance">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="品种说明" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="是否启用" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
