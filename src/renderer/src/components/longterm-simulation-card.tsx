/** 常年模拟卡片组件：提供基于积温模型的长期生育进程模拟功能 */
import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Card, DatePicker, Descriptions, Form, InputNumber, Select, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchCropVarieties } from '../store/slices/crop-varieties.slice'
import { fetchFields } from '../store/slices/fields.slice'
import { fetchModelParameters } from '../store/slices/model-parameters.slice'
import { simulateGrowthProcess, type GrowthProcessStageResult, type GrowthSimulationResult } from '../services/growth-modeling'

/**
 * 模拟表单数据结构
 */
interface SimulationFormValues {
  /** 地块 ID（可选） */
  fieldId?: number
  /** 品种 ID（可选） */
  varietyId?: number
  /** 播种日期 */
  plantingDate: dayjs.Dayjs
  /** 平均温度（°C） */
  averageTemperature: number
}

/** 生育阶段模拟结果表格列定义 */
const columns: ColumnsType<GrowthProcessStageResult> = [
  { title: '阶段代码', dataIndex: 'code', key: 'code' },
  { title: '阶段名称', dataIndex: 'name', key: 'name' },
  { title: '所需积温(°C·d)', dataIndex: 'requiredGdd', key: 'requiredGdd', render: (value: number) => value.toFixed(1) },
  { title: '预计历时(天)', dataIndex: 'estimatedDays', key: 'estimatedDays' },
  { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
  { title: '结束日期', dataIndex: 'endDate', key: 'endDate' }
]

/**
 * 常年模拟卡片组件
 * 提供基于历史数据的长期生育进程模拟功能，用于规划和决策支持
 *
 * 主要功能：
 * - 选择地块和品种进行模拟（可选）
 * - 设置播种日期和平均温度
 * - 基于模型参数计算各生育阶段的预计时间
 * - 评估土壤适宜性
 * - 显示完整生育进程时间表
 *
 * @returns React 组件
 */
export function LongtermSimulationCard(): React.JSX.Element {
  const dispatch = useAppDispatch()
  const fields = useAppSelector((state) => state.fields.items)
  const cropVarieties = useAppSelector((state) => state.cropVarieties.items)
  const modelParameters = useAppSelector((state) => state.modelParameters.items)
  const loading = useAppSelector(
    (state) => state.fields.loading || state.cropVarieties.loading || state.modelParameters.loading
  )
  const [form] = Form.useForm<SimulationFormValues>()
  const [result, setResult] = useState<GrowthSimulationResult | null>(null)

  useEffect(() => {
    void dispatch(fetchFields())
    void dispatch(fetchCropVarieties())
    void dispatch(fetchModelParameters())
  }, [dispatch])

  /**
   * 地块选项列表
   * 将地块数据映射为 Select 组件所需格式
   */
  const fieldOptions = useMemo(() => fields.map((item) => ({ label: item.name, value: item.id })), [fields])

  /**
   * 品种选项列表
   * 将品种数据映射为 Select 组件所需格式，显示品种名称和类型
   */
  const varietyOptions = useMemo(
    () => cropVarieties.map((item) => ({ label: `${item.name} (${item.type})`, value: item.id })),
    [cropVarieties]
  )

  /**
   * 处理表单提交，执行生育进程模拟
   * 根据表单输入的参数调用模拟算法，计算各生育阶段的时间节点
   *
   * @param values 表单数据，包含地块、品种、播种日期和平均温度
   */
  function handleSubmit(values: SimulationFormValues): void {
    const field = fields.find((item) => item.id === values.fieldId)
    const variety = cropVarieties.find((item) => item.id === values.varietyId)

    setResult(
      simulateGrowthProcess({
        field,
        variety,
        plantingDate: values.plantingDate.format('YYYY-MM-DD'),
        averageTemperature: values.averageTemperature,
        parameters: modelParameters
      })
    )
  }

  return (
    <Card title="适宜生育进程模拟">
      <Space direction="vertical" size={16} style={{ display: 'flex' }}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          基于规则化积温阈值和当前参数集，对播种后的关键生育阶段进行可解释推演。
        </Typography.Paragraph>

        <Form
          form={form}
          layout="inline"
          initialValues={{ plantingDate: dayjs(), averageTemperature: 26 }}
          onFinish={handleSubmit}
        >
          <Form.Item label="地块" name="fieldId">
            <Select allowClear style={{ width: 180 }} options={fieldOptions} />
          </Form.Item>
          <Form.Item label="品种" name="varietyId">
            <Select allowClear style={{ width: 220 }} options={varietyOptions} />
          </Form.Item>
          <Form.Item label="播种日期" name="plantingDate" rules={[{ required: true, message: '请选择播种日期' }]}>
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
              开始模拟
            </Button>
          </Form.Item>
        </Form>

        {result ? (
          <>
            <Alert
              type="info"
              showIcon
              message={result.summary}
              description={result.notes.join(' ')}
            />
            <Descriptions bordered size="small" column={3}>
              <Descriptions.Item label="土壤适宜性">
                <Tag color={result.soilSuitability === '适宜' ? 'green' : result.soilSuitability === '临界' ? 'gold' : 'red'}>
                  {result.soilSuitability}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="日均有效积温">
                {result.averageDailyGdd.toFixed(1)} °C·d
              </Descriptions.Item>
              <Descriptions.Item label="预计成熟日期">
                {result.stages[result.stages.length - 1]?.endDate}
              </Descriptions.Item>
            </Descriptions>
            <Table rowKey="code" size="small" pagination={false} columns={columns} dataSource={result.stages} />
          </>
        ) : null}
      </Space>
    </Card>
  )
}
