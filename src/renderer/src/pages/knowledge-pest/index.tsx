/** 玉米病虫害防治专家知识库页面：管理病虫害识别与防治知识 */
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
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { KnowledgeItem } from '../../../../shared/types/database'
import type {
  CreateKnowledgeItemInput,
  UpdateKnowledgeItemInput
} from '../../../../main/database/repositories/knowledge-items-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
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

export function KnowledgePestPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.knowledgeItems)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<KnowledgeItemFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<KnowledgeItem | null>(null)
  const [keyword, setKeyword] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | undefined>()

  useEffect(() => {
    void dispatch(fetchKnowledgeItems())
  }, [dispatch])

  // 只显示病虫害相关分类
  const pestCategories = ['病害', '虫害', '病虫害防治', '综合防治']
  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()

    return items.filter((item) => {
      // 只显示病虫害相关分类
      if (!pestCategories.includes(item.category)) {
        return false
      }

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

  const categoryOptions = [
    { label: '病害', value: '病害' },
    { label: '虫害', value: '虫害' },
    { label: '病虫害防治', value: '病虫害防治' },
    { label: '综合防治', value: '综合防治' }
  ]

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

  const columns: ColumnsType<KnowledgeItem> = useMemo(
    () => [
      { title: '分类', dataIndex: 'category', key: 'category' },
      { title: '名称', dataIndex: 'title', key: 'title' },
      {
        title: '症状/特征',
        dataIndex: 'tags',
        key: 'tags',
        render: (v: string | null) => v ?? '-'
      },
      {
        title: '来源',
        dataIndex: 'source',
        key: 'source',
        render: (v: string | null) => v ?? '-'
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
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除该知识条目吗？" onConfirm={() => void handleDelete(record.id)}>
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

  function handleCreate(): void {
    setEditingRecord(null)
    form.setFieldsValue({ category: '病害', isActive: true })
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
            玉米病虫害防治专家知识库
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            病虫害识别、发生规律与防治措施知识库,支持按病害和虫害分类管理,为病虫害防治决策提供专家支持。
          </Typography.Paragraph>
        </div>
        <Space>
          <Tag color="processing">
            筛选后 {filteredItems.length} / 共 {items.filter((item) => pestCategories.includes(item.category)).length} 条
          </Tag>
          <Button type="primary" onClick={handleCreate}>
            新增知识条目
          </Button>
        </Space>
      </div>

      <div className="filters-bar">
        <Input
          allowClear
          placeholder="搜索名称、内容、症状特征、来源"
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
          options={[
            { label: '启用', value: 'enabled' },
            { label: '停用', value: 'disabled' }
          ]}
          style={{ width: 180 }}
        />
      </div>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={filteredItems} />

      <Modal
        destroyOnClose
        open={modalOpen}
        title={editingRecord ? '编辑知识条目' : '新增知识条目'}
        okText={editingRecord ? '保存修改' : '创建条目'}
        cancelText="取消"
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{ category: '病害', isActive: true }}
          onFinish={(values) => void handleSubmit(values)}
        >
          <Form.Item label="分类" name="category" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={categoryOptions} />
          </Form.Item>
          <Form.Item label="名称" name="title" rules={[{ required: true, message: '请输入病虫害名称' }]}>
            <Input placeholder="例如：玉米大斑病、玉米螟" />
          </Form.Item>
          <Form.Item
            label="防治方法与发生规律"
            name="content"
            rules={[{ required: true, message: '请输入知识内容' }]}
          >
            <Input.TextArea rows={6} placeholder="包括识别特征、发生规律、防治措施等" />
          </Form.Item>
          <Form.Item label="症状特征" name="tags">
            <Input placeholder="可用逗号分隔,例如：叶片病斑,黄褐色,梭形" />
          </Form.Item>
          <Form.Item label="来源" name="source">
            <Input placeholder="例如：省植保站技术手册" />
          </Form.Item>
          <Form.Item label="是否启用" name="isActive" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
