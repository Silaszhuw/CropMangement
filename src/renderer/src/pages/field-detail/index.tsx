/** 地块详情页：展示地块完整信息及关联的种植记录 */
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Spin, Statistic, Tabs, Typography, message } from 'antd'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchFields } from '../../store/slices/fields.slice'
import { fetchPlantingRecords } from '../../store/slices/planting-records.slice'
import { FieldOverviewTab } from './overview-tab'
import { FieldSoilTab } from './soil-tab'
import { FieldPlantingRecordsTab } from './planting-records-tab'

export function FieldDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  const fieldsState = useAppSelector((state) => state.fields)
  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)

  const fieldId = id ? parseInt(id, 10) : null
  const field = useMemo(() => fieldsState.items.find((item) => item.id === fieldId), [fieldsState.items, fieldId])
  const relatedPlantingRecords = useMemo(
    () => plantingRecordsState.items.filter((item) => item.fieldId === fieldId),
    [plantingRecordsState.items, fieldId]
  )
  const activePlantingCount = useMemo(
    () => relatedPlantingRecords.filter((item) => item.status === 'growing').length,
    [relatedPlantingRecords]
  )
  const harvestedPlantingCount = useMemo(
    () => relatedPlantingRecords.filter((item) => item.status === 'harvested').length,
    [relatedPlantingRecords]
  )
  const failedPlantingCount = useMemo(
    () => relatedPlantingRecords.filter((item) => item.status === 'failed').length,
    [relatedPlantingRecords]
  )
  const latestPlantingDate = useMemo(
    () => relatedPlantingRecords.map((item) => item.plantingDate).sort().at(-1) ?? '-',
    [relatedPlantingRecords]
  )

  useEffect(() => {
    void dispatch(fetchFields())
    void dispatch(fetchPlantingRecords())
  }, [dispatch])

  const handleBack = useCallback(() => {
    navigate('/fields')
  }, [navigate])

  if (!fieldId) {
    messageApi.error('无效的地块 ID')
    return (
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        {contextHolder}
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
      </Space>
    )
  }

  if (fieldsState.loading || plantingRecordsState.loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
  }

  if (!field) {
    return (
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        {contextHolder}
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
        <Typography.Text type="danger">地块不存在</Typography.Text>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      {contextHolder}
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回</Button>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>地块详情</Typography.Title>
          </Space>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {field.name} / {field.area} 亩
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="地块面积（亩）" value={field.area} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="历史种植记录" value={relatedPlantingRecords.length} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="当前在种记录" value={activePlantingCount} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="最近播种日期" value={latestPlantingDate} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="已收获记录" value={harvestedPlantingCount} suffix="条" />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="失败记录" value={failedPlantingCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="overview"
        items={[
          { key: 'overview', label: '基本信息', children: <FieldOverviewTab field={field} /> },
          { key: 'soil', label: '土壤信息', children: <FieldSoilTab field={field} /> },
          { key: 'planting-records', label: '历史种植记录', children: <FieldPlantingRecordsTab plantingRecords={relatedPlantingRecords} /> }
        ]}
      />
    </Space>
  )
}
