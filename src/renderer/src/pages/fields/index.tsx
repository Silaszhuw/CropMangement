/** 地块管理页面：提供地块信息的增删改查功能 */
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
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import type { Field } from '../../../../shared/types/database'
import type { CreateFieldInput, UpdateFieldInput } from '../../../../main/database/repositories/fields-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createField, deleteField, fetchFields, updateField } from '../../store/slices/fields.slice'

interface FieldFormValues {
  name: string
  area: number
  locationProvince?: string
  locationCity?: string
  locationCounty?: string
  locationDetail?: string
  soilType?: string
  soilPh?: number
  soilOrganicMatter?: number
  notes?: string
}

function mapFieldToFormValues(field: Field): FieldFormValues {
  return {
    name: field.name,
    area: field.area,
    locationProvince: field.locationProvince ?? undefined,
    locationCity: field.locationCity ?? undefined,
    locationCounty: field.locationCounty ?? undefined,
    locationDetail: field.locationDetail ?? undefined,
    soilType: field.soilType ?? undefined,
    soilPh: field.soilPh ?? undefined,
    soilOrganicMatter: field.soilOrganicMatter ?? undefined,
    notes: field.notes ?? undefined
  }
}

export function FieldsPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, submitting } = useAppSelector((state) => state.fields)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<FieldFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Field | null>(null)
  const [keyword, setKeyword] = useState('')
  const [provinceFilter, setProvinceFilter] = useState<string | undefined>()
  const [soilTypeFilter, setSoilTypeFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchFields())
  }, [dispatch])

  const handleEdit = useCallback(
    (record: Field): void => {
      setEditingRecord(record)
      form.setFieldsValue(mapFieldToFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deleteField(id)).unwrap()
        messageApi.success('地块删除成功')
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
        [item.name, item.locationProvince, item.locationCity, item.locationCounty, item.locationDetail, item.soilType, item.notes]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword))

      const matchesProvince = !provinceFilter || item.locationProvince === provinceFilter
      const matchesSoilType = !soilTypeFilter || item.soilType === soilTypeFilter

      return matchesKeyword && matchesProvince && matchesSoilType
    })
  }, [items, keyword, provinceFilter, soilTypeFilter])

  const provinceOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.locationProvince).filter(Boolean))).map((value) => ({ label: value, value })),
    [items]
  )

  const soilTypeOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.soilType).filter(Boolean))).map((value) => ({ label: value, value })),
    [items]
  )

  const columns: ColumnsType<Field> = useMemo(
    () => [
      {
        title: '地块名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '面积（亩）',
        dataIndex: 'area',
        key: 'area'
      },
      {
        title: '位置',
        key: 'location',
        render: (_, record) =>
          [record.locationProvince, record.locationCity, record.locationCounty].filter(Boolean).join(' / ') || '-'
      },
      {
        title: '土壤信息',
        key: 'soil',
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <span>{record.soilType ? `类型：${record.soilType}` : '类型：-'}</span>
            <span>{record.soilPh != null ? `pH：${record.soilPh}` : 'pH：-'}</span>
          </Space>
        )
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt'
      },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => navigate(`/fields/${record.id}`)}>
              查看详情
            </Button>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除该地块吗？" onConfirm={() => void handleDelete(record.id)}>
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
    form.resetFields()
    setModalOpen(true)
  }

  async function handleSubmit(values: FieldFormValues): Promise<void> {
    try {
      if (editingRecord) {
        const payload: UpdateFieldInput = {
          id: editingRecord.id,
          ...values
        }
        await dispatch(updateField(payload)).unwrap()
        messageApi.success('地块更新成功')
      } else {
        const payload: CreateFieldInput = { ...values }
        await dispatch(createField(payload)).unwrap()
        messageApi.success('地块创建成功')
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
            地块管理
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            维护地块基础信息、位置描述与土壤属性，为后续种植记录提供关联基础。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">筛选后 {filteredItems.length} / 共 {items.length} 条</Tag>
          <Button type="primary" onClick={handleCreate}>
            新增地块
          </Button>
        </Space>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索地块名称、位置、土壤类型、备注"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="按省份筛选"
          value={provinceFilter}
          onChange={setProvinceFilter}
          options={provinceOptions}
          style={{ width: 180 }}
        />
        <Select
          allowClear
          placeholder="按土壤类型筛选"
          value={soilTypeFilter}
          onChange={setSoilTypeFilter}
          options={soilTypeOptions}
          style={{ width: 180 }}
        />
      </div>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={filteredItems} />

      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑地块' : '新增地块'}
        okText={editingRecord ? '保存修改' : '创建地块'}
        cancelText="取消"
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="地块名称" name="name" rules={[{ required: true, message: '请输入地块名称' }]}>
            <Input placeholder="例如：试验田 1 号" />
          </Form.Item>
          <Form.Item label="面积（亩）" name="area" rules={[{ required: true, message: '请输入面积' }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="省份" name="locationProvince">
            <Input placeholder="例如：河北省" />
          </Form.Item>
          <Form.Item label="城市" name="locationCity">
            <Input placeholder="例如：石家庄市" />
          </Form.Item>
          <Form.Item label="区县" name="locationCounty">
            <Input placeholder="例如：正定县" />
          </Form.Item>
          <Form.Item label="详细位置" name="locationDetail">
            <Input placeholder="例如：南岗村东侧" />
          </Form.Item>
          <Form.Item label="土壤类型" name="soilType">
            <Input placeholder="例如：壤土" />
          </Form.Item>
          <Form.Item label="土壤 pH" name="soilPh">
            <InputNumber min={0} max={14} precision={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="有机质含量（g/kg）" name="soilOrganicMatter">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
