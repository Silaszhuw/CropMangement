/** 当前预测卡片组件：结合实际观测数据预测下一生育阶段和成熟期 */
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, DatePicker, Descriptions, Form, InputNumber, Select, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchCropVarieties } from '../store/slices/crop-varieties.slice'
import { fetchFields } from '../store/slices/fields.slice'
import { fetchGrowthStageObservationsByPlantingRecordId } from '../store/slices/growth-stage-observations.slice'
import { fetchGrowthRecordsByPlantingRecordId } from '../store/slices/growth-records.slice'
import { fetchModelParameters } from '../store/slices/model-parameters.slice'
import { fetchPlantingRecords } from '../store/slices/planting-records.slice'
import { predictGrowthProcess, type GrowthPredictionResult, type GrowthProcessStageResult } from '../services/growth-modeling'

/**
 * 预测表单数据结构
 */
interface PredictionFormValues {
  /** 种植记录 ID */
  plantingRecordId: number
  /** 基准日期，作为预测的起始时间点 */
  currentDate: dayjs.Dayjs
  /** 平均温度（°C），用于计算有效积温 */
  averageTemperature: number
}

/**
 * 生育阶段预测结果表格列定义
 * 包含阶段名称、结束日期和状态（已观测/预测/模拟）
 */
const columns: ColumnsType<GrowthProcessStageResult> = [
  { title: '阶段', dataIndex: 'name', key: 'name' },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: GrowthProcessStageResult['status']) => {
      const map = {
        observed: { color: 'green', label: '已观测' },
        predicted: { color: 'processing', label: '预测' },
        simulated: { color: 'default', label: '模拟' }
      }

      return <Tag color={map[value].color}>{map[value].label}</Tag>
    }
  }
]

/**
 * 当前预测卡片组件
 * 提供基于实际观测数据的生育进程预测功能
 *
 * 主要功能：
 * - 选择已有的种植记录进行预测
 * - 结合实际观测的生育阶段数据
 * - 结合生长记录（环境数据）
 * - 预测下一关键生育阶段的时间
 * - 预测成熟期时间
 * - 显示预测置信度
 * - 区分已观测、预测和模拟的生育阶段
 *
 * @returns React 组件
 */
export function CurrentPredictionCard(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const plantingRecords = useAppSelector((state) => state.plantingRecords.items)
  const fields = useAppSelector((state) => state.fields.items)
  const cropVarieties = useAppSelector((state) => state.cropVarieties.items)
  const modelParameters = useAppSelector((state) => state.modelParameters.items)
  const growthStageObservations = useAppSelector((state) => state.growthStageObservations.items)
  const growthRecords = useAppSelector((state) => state.growthRecords.items)
  const loading = useAppSelector(
    (state) =>
      state.plantingRecords.loading ||
      state.fields.loading ||
      state.cropVarieties.loading ||
      state.modelParameters.loading ||
      state.growthStageObservations.loading ||
      state.growthRecords.loading
  )
  const [form] = Form.useForm<PredictionFormValues>()
  const [result, setResult] = useState<GrowthPredictionResult | null>(null)
  // 监听表单中选择的种植记录 ID
  const selectedPlantingRecordId = Form.useWatch('plantingRecordId', form)

  // 组件挂载时加载基础数据（种植记录、地块、品种、模型参数）
  useEffect(() => {
    void dispatch(fetchPlantingRecords())
    void dispatch(fetchFields())
    void dispatch(fetchCropVarieties())
    void dispatch(fetchModelParameters())
  }, [dispatch])

  // 当选择的种植记录变化时，加载该记录的观测数据和生长记录
  useEffect(() => {
    if (!selectedPlantingRecordId) {
      return
    }

    void dispatch(fetchGrowthStageObservationsByPlantingRecordId(selectedPlantingRecordId))
    void dispatch(fetchGrowthRecordsByPlantingRecordId(selectedPlantingRecordId))
  }, [dispatch, selectedPlantingRecordId])

  /**
   * 种植记录选项列表
   * 将种植记录映射为 Select 组件所需格式，显示年份、季节和记录 ID
   */
  const plantingRecordOptions = useMemo(
    () =>
      plantingRecords.map((item) => ({
        label: `${item.year} ${item.season} / #${item.id}`,
        value: item.id
      })),
    [plantingRecords]
  )

  /**
   * 处理表单提交，执行生育进程预测
   * 基于选中的种植记录、实际观测数据和环境记录，预测未来的生育进程
   *
   * @param values 表单数据，包含种植记录 ID、基准日期和平均温度
   */
  function handleSubmit(values: PredictionFormValues): void {
    // 查找选中的种植记录
    const plantingRecord = plantingRecords.find((item) => item.id === values.plantingRecordId)
    if (!plantingRecord) {
      return
    }

    // 查找对应的地块和品种信息
    const field = fields.find((item) => item.id === plantingRecord.fieldId)
    const variety = cropVarieties.find((item) => item.id === plantingRecord.varietyId)

    // 调用预测算法，结合观测数据和生长记录进行预测
    setResult(
      predictGrowthProcess({
        plantingRecord,
        field,
        variety,
        averageTemperature: values.averageTemperature,
        parameters: modelParameters,
        observations: growthStageObservations,
        growthRecords,
        currentDate: values.currentDate.format('YYYY-MM-DD')
      })
    )
  }

  return (
    <Card title="生育进程预测">
      <Space direction="vertical" size={16} style={{ display: 'flex' }}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          结合当前观测记录、种植记录与模型参数，对下一关键生育阶段和预计成熟期进行预测。
        </Typography.Paragraph>

        <Form
          form={form}
          layout="inline"
          initialValues={{ currentDate: dayjs(), averageTemperature: 26 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="种植记录"
            name="plantingRecordId"
            rules={[{ required: true, message: '请选择种植记录' }]}
          >
            <Select style={{ width: 220 }} options={plantingRecordOptions} />
          </Form.Item>
          <Form.Item label="基准日期" name="currentDate" rules={[{ required: true, message: '请选择基准日期' }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item
            label="平均温度"
            name="averageTemperature"
            rules={[{ required: true, message: '请输入平均温度' }]}
          >
            <InputNumber min={5} max={40} precision={1} addonAfter="°C" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              生成预测
            </Button>
          </Form.Item>
        </Form>

        {result ? (
          <>
            <Alert type="info" showIcon message={`当前阶段：${result.currentStage}`} description={result.notes.join(' ')} />
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="下一阶段">{result.nextStage ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="下一阶段日期">{result.predictedNextStageDate ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="成熟期预测">{result.predictedMaturityDate ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="预测置信度">
                <Tag color={result.confidence === '较高' ? 'green' : result.confidence === '中' ? 'gold' : 'red'}>
                  {result.confidence}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="日均有效积温">
                {result.averageDailyGdd.toFixed(1)} °C·d
              </Descriptions.Item>
              <Descriptions.Item label="已观测阶段数">
                {result.stages.filter((item) => item.status === 'observed').length}
              </Descriptions.Item>
            </Descriptions>
            <Table rowKey="code" size="small" pagination={false} columns={columns} dataSource={result.stages} />
          </>
        ) : null}
      </Space>
    </Card>
  )
}
