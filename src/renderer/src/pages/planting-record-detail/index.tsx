/** 种植记录详情页：展示种植记录完整信息及关联的生长数据 */
import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Card, Col, Row, Space, Spin, Statistic, Tabs, Typography, message } from 'antd'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchPlantingRecords } from '../../store/slices/planting-records.slice'
import { fetchFields } from '../../store/slices/fields.slice'
import { fetchCropVarieties } from '../../store/slices/crop-varieties.slice'
import { OverviewTab } from './overview-tab'
import { GrowthRecordsTab } from './growth-records-tab'
import { GrowthStageObservationsTab } from './growth-stage-observations-tab'
import { OperationRecordsTab } from './operation-records-tab'
import { EvaluationsTab } from './evaluations-tab'

export function PlantingRecordDetailPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)
  const fieldsState = useAppSelector((state) => state.fields)
  const cropVarietiesState = useAppSelector((state) => state.cropVarieties)
  const growthRecordsState = useAppSelector((state) => state.growthRecords)
  const operationRecordsState = useAppSelector((state) => state.operationRecords)
  const evaluationsState = useAppSelector((state) => state.evaluations)

  const recordId = id ? parseInt(id, 10) : null
  const record = useMemo(
    () => plantingRecordsState.items.find((item) => item.id === recordId),
    [plantingRecordsState.items, recordId]
  )

  const field = useMemo(
    () => fieldsState.items.find((item) => item.id === record?.fieldId),
    [fieldsState.items, record?.fieldId]
  )

  const variety = useMemo(
    () => cropVarietiesState.items.find((item) => item.id === record?.varietyId),
    [cropVarietiesState.items, record?.varietyId]
  )
  const growthCount = growthRecordsState.items.length
  const operationCount = operationRecordsState.items.length
  const evaluationCount = evaluationsState.items.length
  const latestEvaluation = useMemo(
    () => evaluationsState.items[0] ?? null,
    [evaluationsState.items]
  )

  useEffect(() => {
    void dispatch(fetchPlantingRecords())
    void dispatch(fetchFields())
    void dispatch(fetchCropVarieties())
  }, [dispatch])

  const handleBack = useCallback(() => {
    navigate('/experimental-data')
  }, [navigate])

  if (!recordId) {
    messageApi.error('无效的种植记录 ID')
    return (
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        {contextHolder}
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
      </Space>
    )
  }

  if (plantingRecordsState.loading || fieldsState.loading || cropVarietiesState.loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!record) {
    return (
      <Space direction="vertical" size={24} style={{ display: 'flex' }}>
        {contextHolder}
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
        <Typography.Text type="danger">种植记录不存在</Typography.Text>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      {contextHolder}
      <div className="page-header">
        <div style={{ flex: 1 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回
            </Button>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              种植记录详情
            </Typography.Title>
          </Space>
          <Typography.Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
            {field?.name} / {variety?.name} / {record.year} {record.season}
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="当前状态" value={record.status} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="生长记录" value={growthCount} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="农事操作" value={operationCount} suffix="条" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="效益评价" value={evaluationCount} suffix="条" />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="最近评价类型" value={latestEvaluation?.evaluationType ?? '-'} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="最近综合评分" value={latestEvaluation?.overallScore ?? '-'} />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: '基本信息',
            children: <OverviewTab record={record} field={field} variety={variety} />
          },
          {
            key: 'growth-records',
            label: '生长记录',
            children: <GrowthRecordsTab plantingRecordId={record.id} />
          },
          {
            key: 'growth-stage-observations',
            label: '生育期观测',
            children: <GrowthStageObservationsTab plantingRecordId={record.id} />
          },
          {
            key: 'operation-records',
            label: '农事操作',
            children: <OperationRecordsTab plantingRecordId={record.id} />
          },
          {
            key: 'evaluations',
            label: '效益评价',
            children: <EvaluationsTab plantingRecordId={record.id} />
          }
        ]}
      />
    </Space>
  )
}
