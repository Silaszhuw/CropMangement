/** 当年决策子系统页面：作为二级工作台进入生育进程预测和决策档案 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Decision, KnowledgeItem } from '../../../../shared/types/database'
import type {
  CreateDecisionInput,
  UpdateDecisionInput
} from '../../../../main/database/repositories/decisions-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchFields } from '../../store/slices/fields.slice'
import { fetchKnowledgeItems } from '../../store/slices/knowledge-items.slice'
import { fetchPlantingRecords } from '../../store/slices/planting-records.slice'
import { createDecision, deleteDecision, fetchDecisions, updateDecision } from '../../store/slices/decisions.slice'

interface DecisionFormValues {
  fieldId?: number
  plantingRecordId?: number
  decisionCategory: string
  decisionDate: dayjs.Dayjs
  title: string
  content: string
  basisSummary?: string
  recommendedActions?: string
  status: string
  userFeedback?: string
}

function mapDecisionToFormValues(record: Decision): DecisionFormValues {
  return {
    fieldId: record.fieldId ?? undefined,
    plantingRecordId: record.plantingRecordId ?? undefined,
    decisionCategory: record.decisionCategory,
    decisionDate: dayjs(record.decisionDate),
    title: record.title,
    content: record.content,
    basisSummary: record.basisSummary ?? undefined,
    recommendedActions: record.recommendedActions ?? undefined,
    status: record.status,
    userFeedback: record.userFeedback ?? undefined
  }
}

function getRelatedKnowledgeItems(decision: Decision, knowledgeItems: KnowledgeItem[]): KnowledgeItem[] {
  const haystack = [decision.decisionCategory, decision.title, decision.content, decision.basisSummary, decision.recommendedActions]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return knowledgeItems.filter((item) => {
    const title = item.title.toLowerCase()
    const category = item.category.toLowerCase()
    const tags = (item.tags ?? '')
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    if (haystack.includes(title) || haystack.includes(category)) {
      return true
    }

    return tags.some((tag) => haystack.includes(tag))
  })
}

export function DecisionCurrentPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, submitting } = useAppSelector((state) => state.decisions)
  const fieldsState = useAppSelector((state) => state.fields)
  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)
  const knowledgeItems = useAppSelector((state) => state.knowledgeItems.items)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<DecisionFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Decision | null>(null)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>()
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchDecisions())
    void dispatch(fetchFields())
    void dispatch(fetchPlantingRecords())
    void dispatch(fetchKnowledgeItems())
  }, [dispatch])

  const fieldMap = useMemo(() => new Map(fieldsState.items.map((item) => [item.id, item])), [fieldsState.items])

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return items.filter((item) => {
      if (item.decisionType !== '当年决策') {
        return false
      }

      const fieldName = item.fieldId ? fieldMap.get(item.fieldId)?.name : ''
      const matchesKeyword =
        !normalizedKeyword ||
        [item.title, item.decisionCategory, item.content, item.basisSummary, item.recommendedActions, item.userFeedback, fieldName]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword))

      const matchesStatus = !statusFilter || item.status === statusFilter
      const matchesCategory = !categoryFilter || item.decisionCategory === categoryFilter

      return matchesKeyword && matchesStatus && matchesCategory
    })
  }, [items, keyword, statusFilter, categoryFilter, fieldMap])

  const categoryOptions = useMemo(
    () => Array.from(new Set(items.filter(i => i.decisionType === '当年决策').map((item) => item.decisionCategory))).filter(Boolean).map((value) => ({ label: value, value })),
    [items]
  )

  const handleEdit = useCallback(
    (record: Decision): void => {
      setEditingRecord(record)
      form.setFieldsValue(mapDecisionToFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deleteDecision(id)).unwrap()
        messageApi.success('决策记录删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const columns: ColumnsType<Decision> = useMemo(
    () => [
      { title: '决策日期', dataIndex: 'decisionDate', key: 'decisionDate' },
      { title: '决策类别', dataIndex: 'decisionCategory', key: 'decisionCategory' },
      { title: '标题', dataIndex: 'title', key: 'title' },
      { title: '关联地块', key: 'field', render: (_, record) => record.fieldId ? <Button type="link" onClick={() => navigate(`/fields/${record.fieldId}`)}>{fieldMap.get(record.fieldId)?.name ?? `地块 #${record.fieldId}`}</Button> : '-' },
      { title: '关联种植记录', key: 'plantingRecord', render: (_, record) => record.plantingRecordId ? <Button type="link" onClick={() => navigate(`/experimental-data/${record.plantingRecordId}`)}>#{record.plantingRecordId}</Button> : '-' },
      {
        title: '关联知识',
        key: 'knowledgeItems',
        render: (_, record) => {
          const relatedKnowledgeItems = getRelatedKnowledgeItems(record, knowledgeItems)
          if (relatedKnowledgeItems.length === 0) {
            return '-'
          }

          return (
            <Tooltip title={relatedKnowledgeItems.map((item) => `${item.category} / ${item.title}`).join('；')}>
              <Tag color="processing">{relatedKnowledgeItems.length} 条关联</Tag>
            </Tooltip>
          )
        }
      },
      { title: '状态', key: 'status', render: (_, record) => <Tag>{record.status}</Tag> },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该决策记录吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [fieldMap, handleDelete, handleEdit, knowledgeItems, navigate]
  )

  function handleCreate(): void {
    setEditingRecord(null)
    form.setFieldsValue({ decisionDate: dayjs(), status: 'pending' })
    setModalOpen(true)
  }

  async function handleSubmit(values: DecisionFormValues): Promise<void> {
    try {
      const payload = {
        fieldId: values.fieldId ?? null,
        plantingRecordId: values.plantingRecordId ?? null,
        decisionType: '当年决策',
        decisionCategory: values.decisionCategory,
        decisionDate: values.decisionDate.format('YYYY-MM-DD'),
        title: values.title,
        content: values.content,
        basisSummary: values.basisSummary ?? null,
        recommendedActions: values.recommendedActions ?? null,
        status: values.status,
        userFeedback: values.userFeedback ?? null
      }

      if (editingRecord) {
        await dispatch(updateDecision({ id: editingRecord.id, ...payload } satisfies UpdateDecisionInput)).unwrap()
        messageApi.success('决策记录更新成功')
      } else {
        await dispatch(createDecision(payload satisfies CreateDecisionInput)).unwrap()
        messageApi.success('决策记录创建成功')
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
          <Typography.Title level={3} style={{ marginBottom: 8 }}>当年决策子系统</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            当年决策工作台，再进入独立的生育进程预测页面和季内决策档案。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">筛选后 {filteredItems.length} / 共 {items.filter(i => i.decisionType === '当年决策').length} 条</Tag>
          <Button type="primary" onClick={handleCreate}>新增当年决策</Button>
        </Space>
      </div>

      <div className="module-grid">
        <Card
          className="module-entry-card"
          title="生育进程预测"
          extra={
            <Button type="link" onClick={() => navigate('/decision-current/prediction')}>
              进入三级界面
            </Button>
          }
        >
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              基于当前试验观测和已有模型参数，对下一关键生育阶段与成熟窗口进行动态预测，服务季内管理决策。
            </Typography.Paragraph>
            <Button type="primary" onClick={() => navigate('/decision-current/prediction')}>
              打开生育进程预测
            </Button>
          </Space>
        </Card>

        <Card className="module-entry-card" title="当年决策档案">
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            下方表格保留追肥、灌溉、病虫害防治等当年决策记录，用于执行跟踪与反馈闭环。
          </Typography.Paragraph>
        </Card>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索标题、类别、内容、依据、推荐动作、反馈"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="按决策类别筛选"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
          style={{ width: 180 }}
        />
        <Select
          allowClear
          placeholder="按状态筛选"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: 'pending', value: 'pending' },
            { label: 'accepted', value: 'accepted' },
            { label: 'rejected', value: 'rejected' },
            { label: 'executed', value: 'executed' },
            { label: 'completed', value: 'completed' }
          ]}
          style={{ width: 160 }}
        />
      </div>

      <Table rowKey="id" loading={loading || fieldsState.loading || plantingRecordsState.loading} columns={columns} dataSource={filteredItems} />

      <Modal destroyOnHidden open={modalOpen} title={editingRecord ? '编辑当年决策' : '新增当年决策'} okText={editingRecord ? '保存修改' : '创建记录'} cancelText="取消" confirmLoading={submitting} onCancel={() => setModalOpen(false)} onOk={() => void form.submit()}>
        <Form layout="vertical" form={form} initialValues={{ decisionDate: dayjs(), status: 'pending' }} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="关联地块" name="fieldId">
            <Select allowClear options={fieldsState.items.map((item) => ({ label: item.name, value: item.id }))} />
          </Form.Item>
          <Form.Item label="关联种植记录" name="plantingRecordId">
            <Select allowClear options={plantingRecordsState.items.map((item) => ({ label: `${item.year} ${item.season} / #${item.id}`, value: item.id }))} />
          </Form.Item>
          <Form.Item label="决策类别" name="decisionCategory" rules={[{ required: true, message: '请输入决策类别' }]}>
            <Input placeholder="例如：追肥决策、灌溉调度、病虫害防治" />
          </Form.Item>
          <Form.Item label="决策日期" name="decisionDate" rules={[{ required: true, message: '请选择决策日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="决策内容" name="content" rules={[{ required: true, message: '请输入决策内容' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="依据摘要" name="basisSummary"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="推荐动作" name="recommendedActions"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select options={[{ label: 'pending', value: 'pending' }, { label: 'accepted', value: 'accepted' }, { label: 'rejected', value: 'rejected' }, { label: 'executed', value: 'executed' }, { label: 'completed', value: 'completed' }]} />
          </Form.Item>
          <Form.Item label="用户反馈" name="userFeedback"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
