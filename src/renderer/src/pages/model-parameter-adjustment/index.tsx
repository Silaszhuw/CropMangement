/** 参数调整 - 生育期模型参数调整：管理和校准光温参数与品种阈值 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ModelParameter, ParameterAdjustmentRecord } from '../../../../shared/types/database'
import type {
  CreateModelParameterInput,
  UpdateModelParameterInput
} from '../../../../main/database/repositories/model-parameters-repository'
import { SecondaryModuleFrame } from '../../components/secondary-module-frame'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
  createModelParameter,
  deleteModelParameter,
  fetchModelParameters,
  resetModelParameterToDefault,
  updateModelParameter
} from '../../store/slices/model-parameters.slice'
import { fetchParameterAdjustmentRecords } from '../../store/slices/parameter-adjustment-records.slice'

interface ModelParameterFormValues {
  parameterGroup: string
  parameterName: string
  parameterKey: string
  defaultValue: number
  currentValue: number
  minValue?: number
  maxValue?: number
  unit?: string
  description?: string
  adjustmentReason?: string
}

function mapFormValues(record: ModelParameter): ModelParameterFormValues {
  return {
    parameterGroup: record.parameterGroup,
    parameterName: record.parameterName,
    parameterKey: record.parameterKey,
    defaultValue: record.defaultValue,
    currentValue: record.currentValue,
    minValue: record.minValue ?? undefined,
    maxValue: record.maxValue ?? undefined,
    unit: record.unit ?? undefined,
    description: record.description ?? undefined
  }
}

export function ModelParameterAdjustmentPage(): React.JSX.Element {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const modelParametersState = useAppSelector((state) => state.modelParameters)
  const adjustmentRecordsState = useAppSelector((state) => state.parameterAdjustmentRecords)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<ModelParameterFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ModelParameter | null>(null)

  useEffect(() => {
    void dispatch(fetchModelParameters())
    void dispatch(fetchParameterAdjustmentRecords())
  }, [dispatch])

  const parameterMap = useMemo(
    () => new Map(modelParametersState.items.map((item) => [item.id, item])),
    [modelParametersState.items]
  )

  const handleDelete = useCallback(
    async (id: number): Promise<void> => {
      try {
        await dispatch(deleteModelParameter(id)).unwrap()
        messageApi.success('模型参数删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  const handleReset = useCallback(
    async (record: ModelParameter): Promise<void> => {
      try {
        await dispatch(
          resetModelParameterToDefault({
            id: record.id,
            adjustmentReason: '界面重置为默认值',
            adjustedBy: 'ui'
          })
        ).unwrap()
        await dispatch(fetchParameterAdjustmentRecords()).unwrap()
        messageApi.success('参数已重置为默认值')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '重置失败')
      }
    },
    [dispatch, messageApi]
  )

  const parameterColumns: ColumnsType<ModelParameter> = useMemo(
    () => [
      {
        title: '参数组',
        dataIndex: 'parameterGroup',
        key: 'parameterGroup',
        render: (value: string) => <Tag color="processing">{value}</Tag>
      },
      { title: '参数名称', dataIndex: 'parameterName', key: 'parameterName' },
      { title: '参数键', dataIndex: 'parameterKey', key: 'parameterKey' },
      { title: '默认值', dataIndex: 'defaultValue', key: 'defaultValue' },
      {
        title: '当前值',
        dataIndex: 'currentValue',
        key: 'currentValue',
        render: (value: number, record) => (
          <Tag color={value === record.defaultValue ? 'default' : 'gold'}>{value}</Tag>
        )
      },
      {
        title: '取值范围',
        key: 'range',
        render: (_, record) =>
          record.minValue != null || record.maxValue != null
            ? `${record.minValue ?? '-'} ~ ${record.maxValue ?? '-'}`
            : '-'
      },
      { title: '单位', dataIndex: 'unit', key: 'unit', render: (value: string | null) => value ?? '-' },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setEditingRecord(record)
                form.setFieldsValue(mapFormValues(record))
                setModalOpen(true)
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              onClick={() => void handleReset(record)}
              disabled={record.currentValue === record.defaultValue}
            >
              重置
            </Button>
            <Popconfirm title="确定删除该参数吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      }
    ],
    [form, handleDelete, handleReset]
  )

  const adjustmentColumns: ColumnsType<ParameterAdjustmentRecord> = useMemo(
    () => [
      {
        title: '参数',
        key: 'parameter',
        render: (_, record) => parameterMap.get(record.parameterId)?.parameterName ?? `#${record.parameterId}`
      },
      { title: '原值', dataIndex: 'oldValue', key: 'oldValue' },
      { title: '新值', dataIndex: 'newValue', key: 'newValue' },
      { title: '调整原因', dataIndex: 'adjustmentReason', key: 'adjustmentReason', render: (value) => value ?? '-' },
      { title: '调整人', dataIndex: 'adjustedBy', key: 'adjustedBy', render: (value) => value ?? '-' },
      { title: '调整时间', dataIndex: 'adjustedAt', key: 'adjustedAt' }
    ],
    [parameterMap]
  )

  async function handleSubmit(values: ModelParameterFormValues): Promise<void> {
    try {
      if (editingRecord) {
        await dispatch(
          updateModelParameter({
            id: editingRecord.id,
            parameterGroup: values.parameterGroup,
            parameterName: values.parameterName,
            parameterKey: values.parameterKey,
            defaultValue: values.defaultValue,
            currentValue: values.currentValue,
            minValue: values.minValue ?? null,
            maxValue: values.maxValue ?? null,
            unit: values.unit ?? null,
            description: values.description ?? null,
            adjustmentReason: values.adjustmentReason ?? '界面调整参数',
            adjustedBy: 'ui'
          } satisfies UpdateModelParameterInput)
        ).unwrap()
        messageApi.success('模型参数更新成功')
      } else {
        await dispatch(
          createModelParameter({
            parameterGroup: values.parameterGroup,
            parameterName: values.parameterName,
            parameterKey: values.parameterKey,
            defaultValue: values.defaultValue,
            currentValue: values.currentValue,
            minValue: values.minValue ?? null,
            maxValue: values.maxValue ?? null,
            unit: values.unit ?? null,
            description: values.description ?? null
          } satisfies CreateModelParameterInput)
        ).unwrap()
        messageApi.success('模型参数创建成功')
      }

      await dispatch(fetchParameterAdjustmentRecords()).unwrap()
      setModalOpen(false)
      form.resetFields()
      setEditingRecord(null)
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '保存失败')
    }
  }

  return (
    <SecondaryModuleFrame
      title="生育期模型参数调整"
      description="对光温参数、品种积温阈值和土壤适宜性参数进行集中管理，保留每次修改记录以支持参数校准。"
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/parameter-adjustment')}>
          返回参数调整
        </Button>
      }
    >
      {contextHolder}
      <Card
        title="模型参数列表"
        extra={
          <Button
            type="primary"
            onClick={() => {
              setEditingRecord(null)
              form.resetFields()
              form.setFieldsValue({ parameterGroup: 'thermal', defaultValue: 0, currentValue: 0 })
              setModalOpen(true)
            }}
          >
            新增参数
          </Button>
        }
      >
        <Table
          rowKey="id"
          loading={modelParametersState.loading}
          columns={parameterColumns}
          dataSource={modelParametersState.items}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Card title="参数调整记录">
        <Table
          rowKey="id"
          loading={adjustmentRecordsState.loading}
          columns={adjustmentColumns}
          dataSource={adjustmentRecordsState.items}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑模型参数' : '新增模型参数'}
        confirmLoading={modelParametersState.submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="参数组" name="parameterGroup" rules={[{ required: true, message: '请输入参数组' }]}>
            <Select
              options={[
                { label: 'thermal', value: 'thermal' },
                { label: 'photoperiod', value: 'photoperiod' },
                { label: 'variety', value: 'variety' },
                { label: 'soil', value: 'soil' }
              ]}
            />
          </Form.Item>
          <Form.Item label="参数名称" name="parameterName" rules={[{ required: true, message: '请输入参数名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="参数键" name="parameterKey" rules={[{ required: true, message: '请输入参数键' }]}>
            <Input placeholder="例如：thermal.base_temp" />
          </Form.Item>
          <Form.Item label="默认值" name="defaultValue" rules={[{ required: true, message: '请输入默认值' }]}>
            <InputNumber style={{ width: '100%' }} precision={2} />
          </Form.Item>
          <Form.Item label="当前值" name="currentValue" rules={[{ required: true, message: '请输入当前值' }]}>
            <InputNumber style={{ width: '100%' }} precision={2} />
          </Form.Item>
          <Form.Item label="最小值" name="minValue">
            <InputNumber style={{ width: '100%' }} precision={2} />
          </Form.Item>
          <Form.Item label="最大值" name="maxValue">
            <InputNumber style={{ width: '100%' }} precision={2} />
          </Form.Item>
          <Form.Item label="单位" name="unit">
            <Input />
          </Form.Item>
          <Form.Item label="说明" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="调整原因" name="adjustmentReason">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </SecondaryModuleFrame>
  )
}
