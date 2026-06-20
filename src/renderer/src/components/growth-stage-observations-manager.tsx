/** 生长阶段观测管理组件：提供生育期观测数据的完整 CRUD 功能 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import type { GrowthStageObservation } from '../../../shared/types/database'
import type {
  CreateGrowthStageObservationInput,
  UpdateGrowthStageObservationInput
} from '../../../main/database/repositories/growth-stage-observations-repository'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  createGrowthStageObservation,
  deleteGrowthStageObservation,
  fetchGrowthStageObservationsByPlantingRecordId,
  updateGrowthStageObservation
} from '../store/slices/growth-stage-observations.slice'

/**
 * 生长阶段观测管理组件的 Props
 */
interface GrowthStageObservationsManagerProps {
  /** 种植记录 ID，用于关联观测数据 */
  plantingRecordId: number
}

/**
 * 生育期观测表单数据结构
 */
interface GrowthStageObservationFormValues {
  /** 生育阶段代码（VE、V6、VT、R1、R3、R6） */
  stageCode: string
  /** 生育阶段名称 */
  stageName: string
  /** 观测日期 */
  observationDate: dayjs.Dayjs
  /** 播种后天数 */
  daysAfterPlanting?: number
  /** 累计积温（°C·d） */
  accumulatedTemperature?: number
  /** 株高（cm） */
  plantHeight?: number
  /** 叶片数 */
  leafCount?: number
  /** 茎粗（mm） */
  stemDiameter?: number
  /** 备注信息 */
  notes?: string
}

/** 玉米生育阶段选项，包含代码、名称和显示标签 */
const stageOptions = [
  { label: 'VE / 出苗期', value: 'VE', stageName: '出苗期' },
  { label: 'V6 / 六叶期', value: 'V6', stageName: '六叶期' },
  { label: 'VT / 抽雄期', value: 'VT', stageName: '抽雄期' },
  { label: 'R1 / 吐丝期', value: 'R1', stageName: '吐丝期' },
  { label: 'R3 / 乳熟期', value: 'R3', stageName: '乳熟期' },
  { label: 'R6 / 成熟期', value: 'R6', stageName: '成熟期' }
]

/**
 * 将数据库记录映射为表单数据格式
 * 将日期字符串转换为 dayjs 对象，将 null 值转换为 undefined 以适配 Ant Design Form
 * @param record 数据库中的生长阶段观测记录
 * @returns 表单数据对象
 */
function mapFormValues(record: GrowthStageObservation): GrowthStageObservationFormValues {
  return {
    stageCode: record.stageCode,
    stageName: record.stageName,
    observationDate: dayjs(record.observationDate),
    daysAfterPlanting: record.daysAfterPlanting ?? undefined,
    accumulatedTemperature: record.accumulatedTemperature ?? undefined,
    plantHeight: record.plantHeight ?? undefined,
    leafCount: record.leafCount ?? undefined,
    stemDiameter: record.stemDiameter ?? undefined,
    notes: record.notes ?? undefined
  }
}

/**
 * 生长阶段观测管理组件
 *
 * 主要功能：
 * - 展示种植记录下的所有生育期观测数据
 * - 新增、编辑、删除生育期观测记录
 * - 支持关键生育阶段（VE、V6、VT、R1、R3、R6）的观测记录
 * - 记录植株形态指标（株高、叶片数、茎粗等）和生育进程指标（播后天数、累计积温等）
 *
 * @param props 组件属性
 * @param props.plantingRecordId 种植记录ID，用于关联观测数据
 * @returns React 组件
 */
export function GrowthStageObservationsManager({
  plantingRecordId
}: GrowthStageObservationsManagerProps): React.JSX.Element {
  const dispatch = useAppDispatch()
  const { items, loading, submitting } = useAppSelector((state) => state.growthStageObservations)
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<GrowthStageObservationFormValues>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GrowthStageObservation | null>(null)

  // 组件挂载时加载当前种植记录的所有观测数据
  useEffect(() => {
    void dispatch(fetchGrowthStageObservationsByPlantingRecordId(plantingRecordId))
  }, [dispatch, plantingRecordId])

  /**
   * 处理编辑操作
   * 设置编辑状态，将数据填充到表单，并打开编辑对话框
   * @param record 要编辑的观测记录
   */
  const handleEdit = useCallback(
    (record: GrowthStageObservation) => {
      setEditingRecord(record)
      form.setFieldsValue(mapFormValues(record))
      setModalOpen(true)
    },
    [form]
  )

  /**
   * 处理删除操作
   * 调用 Redux action 删除观测记录，并显示操作结果提示
   * @param id 要删除的观测记录 ID
   */
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await dispatch(deleteGrowthStageObservation(id)).unwrap()
        messageApi.success('生育期观测删除成功')
      } catch (error) {
        messageApi.error(error instanceof Error ? error.message : '删除失败')
      }
    },
    [dispatch, messageApi]
  )

  /**
   * 表格列定义
   * 定义观测记录表格的列结构，包括观测日期、阶段信息、形态指标和操作按钮
   */
  const columns: ColumnsType<GrowthStageObservation> = useMemo(
    () => [
      { title: '观测日期', dataIndex: 'observationDate', key: 'observationDate' },
      {
        title: '阶段',
        key: 'stage',
        render: (_, record) => (
          <Space>
            <Tag color="processing">{record.stageCode}</Tag>
            <span>{record.stageName}</span>
          </Space>
        )
      },
      { title: '播后天数', dataIndex: 'daysAfterPlanting', key: 'daysAfterPlanting', render: (value) => value ?? '-' },
      {
        title: '累计积温(°C·d)',
        dataIndex: 'accumulatedTemperature',
        key: 'accumulatedTemperature',
        render: (value: number | null) => (value != null ? value.toFixed(1) : '-')
      },
      { title: '株高(cm)', dataIndex: 'plantHeight', key: 'plantHeight', render: (value) => value ?? '-' },
      { title: '叶片数', dataIndex: 'leafCount', key: 'leafCount', render: (value) => value ?? '-' },
      { title: '茎粗(mm)', dataIndex: 'stemDiameter', key: 'stemDiameter', render: (value) => value ?? '-' },
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Popconfirm title="确定删除该观测记录吗？" onConfirm={() => void handleDelete(record.id)}>
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

  /**
   * 处理表单提交
   * 根据是否存在 editingRecord 判断是新增还是更新操作
   * 将表单数据转换为 API 所需格式（undefined 转为 null，日期转为字符串）
   * @param values 表单数据
   */
  async function handleSubmit(values: GrowthStageObservationFormValues): Promise<void> {
    try {
      // 构建 API payload，将 undefined 转换为 null，日期对象转换为字符串
      const payload = {
        plantingRecordId,
        stageCode: values.stageCode,
        stageName: values.stageName,
        observationDate: values.observationDate.format('YYYY-MM-DD'),
        daysAfterPlanting: values.daysAfterPlanting ?? null,
        accumulatedTemperature: values.accumulatedTemperature ?? null,
        plantHeight: values.plantHeight ?? null,
        leafCount: values.leafCount ?? null,
        stemDiameter: values.stemDiameter ?? null,
        notes: values.notes ?? null
      }

      if (editingRecord) {
        // 更新已有记录
        await dispatch(
          updateGrowthStageObservation({ id: editingRecord.id, ...payload } satisfies UpdateGrowthStageObservationInput)
        ).unwrap()
        messageApi.success('生育期观测更新成功')
      } else {
        // 创建新记录
        await dispatch(createGrowthStageObservation(payload satisfies CreateGrowthStageObservationInput)).unwrap()
        messageApi.success('生育期观测创建成功')
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
      <Button
        type="primary"
        onClick={() => {
          setEditingRecord(null)
          form.setFieldsValue({
            stageCode: 'VE',
            stageName: '出苗期',
            observationDate: dayjs()
          })
          setModalOpen(true)
        }}
      >
        新增生育期观测
      </Button>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={items} pagination={false} />
      <Modal
        destroyOnHidden
        open={modalOpen}
        title={editingRecord ? '编辑生育期观测' : '新增生育期观测'}
        confirmLoading={submitting}
        onCancel={() => setModalOpen(false)}
        onOk={() => void form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={(values) => void handleSubmit(values)}>
          <Form.Item label="阶段代码" name="stageCode" rules={[{ required: true, message: '请选择阶段代码' }]}>
            <Select
              options={stageOptions.map((item) => ({ label: item.label, value: item.value }))}
              onChange={(value) => {
                // 当阶段代码变化时，自动更新阶段名称
                const selected = stageOptions.find((item) => item.value === value)
                form.setFieldValue('stageName', selected?.stageName ?? '')
              }}
            />
          </Form.Item>
          <Form.Item label="阶段名称" name="stageName" rules={[{ required: true, message: '请输入阶段名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="观测日期" name="observationDate" rules={[{ required: true, message: '请选择观测日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="播后天数" name="daysAfterPlanting">
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
          <Form.Item label="累计积温（°C·d）" name="accumulatedTemperature">
            <InputNumber style={{ width: '100%' }} min={0} precision={1} />
          </Form.Item>
          <Form.Item label="株高（cm）" name="plantHeight">
            <InputNumber style={{ width: '100%' }} min={0} precision={1} />
          </Form.Item>
          <Form.Item label="叶片数" name="leafCount">
            <InputNumber style={{ width: '100%' }} min={0} precision={0} />
          </Form.Item>
          <Form.Item label="茎粗（mm）" name="stemDiameter">
            <InputNumber style={{ width: '100%' }} min={0} precision={1} />
          </Form.Item>
          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
