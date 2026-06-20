/** 品种参数详情页：展示品种完整信息及关联的种植记录 */
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Spin, Statistic, Tabs, Typography, message } from 'antd'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCropVarieties } from '../../store/slices/crop-varieties.slice'
import { fetchPlantingRecords } from '../../store/slices/planting-records.slice'
import { CropVarietyAgronomyTab } from './agronomy-tab'
import { CropVarietyOverviewTab } from './overview-tab'
import { CropVarietyPlantingRecordsTab } from './planting-records-tab'

export function CropVarietyDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  const cropVarietiesState = useAppSelector((state) => state.cropVarieties)
  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)

  const varietyId = id ? parseInt(id, 10) : null
  const variety = useMemo(
    () => cropVarietiesState.items.find((item) => item.id === varietyId),
    [cropVarietiesState.items, varietyId]
  )
  const relatedPlantingRecords = useMemo(
    () => plantingRecordsState.items.filter((item) => item.varietyId === varietyId),
    [plantingRecordsState.items, varietyId]
  )
  const activePlantingCount = useMemo(
    () => relatedPlantingRecords.filter((item) => item.status === 'growing').length,
    [relatedPlantingRecords]
  )
  const harvestedPlantingCount = useMemo(
    () => relatedPlantingRecords.filter((item) => item.status === 'harvested').length,
    [relatedPlantingRecords]
  )
  const distinctFieldCount = useMemo(
    () => new Set(relatedPlantingRecords.map((item) => item.fieldId)).size,
    [relatedPlantingRecords]
  )

  useEffect(() => {
    void dispatch(fetchCropVarieties())
    void dispatch(fetchPlantingRecords())
  }, [dispatch])

  const handleBack = useCallback(() => {
    navigate('/parameter-management')
  }, [navigate])

  if (!varietyId) {
    messageApi.error('无效的品种 ID')
    return (
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        {contextHolder}
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
      </Space>
    )
  }

  if (cropVarietiesState.loading || plantingRecordsState.loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>
  }

  if (!variety) {
    return (
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        {contextHolder}
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>返回列表</Button>
        <Typography.Text type="danger">品种不存在</Typography.Text>
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
            <Typography.Title level={3} style={{ marginBottom: 0 }}>品种参数详情</Typography.Title>
          </Space>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {variety.name} / {variety.type}
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="关联种植记录" value={relatedPlantingRecords.length} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="覆盖地块数" value={distinctFieldCount} suffix="块" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="当前在种" value={activePlantingCount} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已收获" value={harvestedPlantingCount} suffix="条" />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="overview"
        items={[
          { key: 'overview', label: '基本属性', children: <CropVarietyOverviewTab variety={variety} /> },
          { key: 'agronomy', label: '农艺特征', children: <CropVarietyAgronomyTab variety={variety} /> },
          { key: 'planting-records', label: '关联种植记录', children: <CropVarietyPlantingRecordsTab plantingRecords={relatedPlantingRecords} /> }
        ]}
      />
    </Space>
  )
}
