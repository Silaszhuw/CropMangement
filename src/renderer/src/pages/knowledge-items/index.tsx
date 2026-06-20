/** 玉米栽培专家知识库页面：管理栽培技术知识条目 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Decision, KnowledgeItem } from '../../../../shared/types/database'
import type {
  CreateKnowledgeItemInput,
  UpdateKnowledgeItemInput
} from '../../../../main/database/repositories/knowledge-items-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchDecisions } from '../../store/slices/decisions.slice'
import {
  createKnowledgeItem,
  deleteKnowledgeItem,
  fetchKnowledgeItems,
  updateKnowledgeItem
} from '../../store/slices/knowledge-items.slice'

interface KnowledgeItemFormValues {
  category: string
  title: string
  content: string
  tags?: string
  source?: string
  isActive: boolean
}

function mapKnowledgeItemToFormValues(record: KnowledgeItem): KnowledgeItemFormValues {
  return {
    category: record.category,
    title: record.title,
    content: record.content,
    tags: record.tags ?? undefined,
    source: record.source ?? undefined,
    isActive: record.isActive
  }
}

function getRelatedDecisions(item: KnowledgeItem, decisions: Decision[]): Decision[] {
  const title = item.title.toLowerCase()
  const category = item.category.toLowerCase()
  const tags = (item.tags ?? '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)

  return decisions.filter((decision) => {
    const haystack = [decision.decisionCategory, decision.title, decision.content, decision.basisSummary]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    if (haystack.includes(category) || haystack.includes(title)) {
      return true
    }

    return tags.some((tag) => haystack.includes(tag))
  })
}

export function KnowledgeItemsPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.knowledgeItems)
  const decisions = useAppSelector((state) => state.decisions.items)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<KnowledgeItemFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<KnowledgeItem | null>(null)
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchKnowledgeItems())
    void dispatch(fetchDecisions())
  }, [dispatch])

  const handleEdit = useCallback(
    (record: KnowledgeItem): void => {
      setEditingRecord(record)
      form.setFieldsValue(mapKnowledgeItemToFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deleteKnowledgeItem(id)).unwrap()
        messageApi.success('知识条目删除成功')
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
        [item.category, item.title, item.content, item.tags, item.source]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedKeyword))

      const matchesCategory = !categoryFilter || item.category === categoryFilter
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'enabled' && item.isActive) ||
        (statusFilter === 'disabled' && !item.isActive)

      return matchesKeyword && matchesCategory && matchesStatus
    })
  }, [items, keyword, categoryFilter, statusFilter])

  const categoryOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.category))).map((value) => ({ label: value, value })),
    [items]
  )

  const columns: ColumnsType<KnowledgeItem> = useMemo(
    () => [
      { title: '分类', dataIndex: 'category', key: 'category' },
      { title: '标题', dataIndex: 'title', key: 'title' },
      { title: '标签', dataIndex: 'tags', key: 'tags', render: (v: string | null) => v ?? '-' },
      {
        title: '关联决策',
        key: 'relatedDecisions',
        render: (_, record) => {
          const relatedDecisions = getRelatedDecisions(record, decisions)
          if (relatedDecisions.length === 0) {
            return '-'
          }

          return (
            <Tooltip title={relatedDecisions.map((decision) => decision.title).join('；')}>
              <Tag color="processing">{relatedDecisions.length} 条关联</Tag>
            </Tooltip>
          )
        }
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
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该知识条目吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [decisions, handleDelete, handleEdit]
  )

  function handleCreate(): void {
    setEditingRecord(null)
    form.setFieldsValue({ category: '施肥', isActive: true })
    setModalOpen(true)
  }

  async function handleSubmit(values: KnowledgeItemFormValues): Promise<void> {
    try {
      if (editingRecord) {
        const payload: UpdateKnowledgeItemInput = {
          id: editingRecord.id,
          category: values.category,
          title: values.title,
          content: values.content,
          tags: values.tags ?? null,
          source: values.source ?? null,
          isActive: values.isActive
        }
        await dispatch(updateKnowledgeItem(payload)).unwrap()
        messageApi.success('知识条目更新成功')
      } else {
        const payload: CreateKnowledgeItemInput = {
          category: values.category,
          title: values.title,
          content: values.content,
          tags: values.tags ?? null,
          source: values.source ?? null,
          isActive: values.isActive
        }
        await dispatch(createKnowledgeItem(payload)).unwrap()
        messageApi.success('知识条目创建成功')
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
            玉米栽培专家知识库
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            汇集玉米栽培实践经验与技术规范,涵盖施肥、灌溉、播种、收获、田间管理等关键环节,为科学决策提供知识支撑。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">筛选后 {filteredItems.length} / 共 {items.length} 条</Tag>
          <Button type="primary" onClick={handleCreate}>新增知识条目</Button>
        </Space>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索分类、标题、内容、标签、来源"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
        <Select
          allowClear
          placeholder="按分类筛选"
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
          options={[{ label: '启用', value: 'enabled' }, { label: '停用', value: 'disabled' }]}
          style={{ width: 180 }}
        />
      </div>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={filteredItems} />

      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑知识条目' : '新增知识条目'}
        okText={editingRecord ? '保存修改' : '创建条目'}
        cancelText="取消"
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form layout="vertical" form={form} initialValues={{ category: '施肥', isActive: true }} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={[{ label: '施肥', value: '施肥' }, { label: '灌溉', value: '灌溉' }, { label: '病虫害防治', value: '病虫害防治' }, { label: '播种', value: '播种' }, { label: '收获', value: '收获' }, { label: '其他', value: '其他' }]} />
          </Form.Item>
          <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="例如：拔节期追肥建议" />
          </Form.Item>
          <Form.Item label="内容" name="content" rules={[{ required: true, message: '请输入知识内容' }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item label="标签" name="tags">
            <Input placeholder="可用逗号分隔，例如：高产,节水,夏播" />
          </Form.Item>
          <Form.Item label="来源" name="source">
            <Input placeholder="例如：省农科院试验报告" />
          </Form.Item>
          <Form.Item label="是否启用" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
