/** 系统配置页面：维护系统级配置项和业务规则参数 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, Modal, Popconfirm, Space, Table, Typography, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { AppSetting } from '../../../../shared/types/database'
import type {
  CreateAppSettingInput,
  UpdateAppSettingInput
} from '../../../../main/database/repositories/app-settings-repository'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createAppSetting,
  deleteAppSetting,
  fetchAppSettings,
  updateAppSetting
} from '../../store/slices/app-settings.slice'

interface AppSettingFormValues {
  configKey: string
  configValue: string
  description?: string
}

function mapAppSettingToFormValues(record: AppSetting): AppSettingFormValues {
  return {
    configKey: record.configKey,
    configValue: record.configValue,
    description: record.description ?? undefined
  }
}

export function SettingsPage(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.appSettings)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<AppSettingFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AppSetting | null>(null)

  useEffect(() => {
    void dispatch(fetchAppSettings())
  }, [dispatch])

  const handleEdit = useCallback(
    (record: AppSetting): void => {
      setEditingRecord(record)
      form.setFieldsValue(mapAppSettingToFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deleteAppSetting(id)).unwrap()
        messageApi.success('配置项删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const columns: ColumnsType<AppSetting> = useMemo(
    () => [
      { title: '参数键', dataIndex: 'configKey', key: 'configKey' },
      { title: '参数值', dataIndex: 'configValue', key: 'configValue' },
      { title: '描述', dataIndex: 'description', key: 'description', render: (v: string | null) => v ?? '-' },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
            <Popconfirm title="确定删除该参数吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>删除</Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [handleDelete, handleEdit]
  )

  function handleCreate(): void {
    setEditingRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  async function handleSubmit(values: AppSettingFormValues): Promise<void> {
    try {
      if (editingRecord) {
        const payload: UpdateAppSettingInput = {
          id: editingRecord.id,
          configKey: values.configKey,
          configValue: values.configValue,
          description: values.description ?? null
        }
        await dispatch(updateAppSetting(payload)).unwrap()
        messageApi.success('配置项更新成功')
      } else {
        const payload: CreateAppSettingInput = {
          configKey: values.configKey,
          configValue: values.configValue,
          description: values.description ?? null
        }
        await dispatch(createAppSetting(payload)).unwrap()
        messageApi.success('配置项创建成功')
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
          <Typography.Title level={3} style={{ marginBottom: 8 }}>系统配置</Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            维护系统级配置项，包括默认阈值、业务规则与界面控制参数。该页面属于后台配置入口，不纳入 PDF 主菜单结构。
          </Typography.Paragraph>
        </div>
        <Button type="primary" onClick={handleCreate}>新增配置项</Button>
      </div>

      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} />

      <Modal destroyOnHidden open={modalOpen} title={editingRecord ? '编辑配置项' : '新增配置项'} okText={editingRecord ? '保存修改' : '创建配置项'} cancelText="取消" confirmLoading={submitting} onCancel={() => setModalOpen(false)} onOk={() => void form.submit()}>
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="参数键" name="configKey" rules={[{ required: true, message: '请输入参数键' }]}>
            <Input placeholder="例如：warning.temperature.max" />
          </Form.Item>
          <Form.Item label="参数值" name="configValue" rules={[{ required: true, message: '请输入参数值' }]}>
            <Input.TextArea rows={4} placeholder="可填写普通文本或 JSON 字符串" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
