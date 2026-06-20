/** 试验数据管理 - 生育期试验数据管理：录入和管理关键生育阶段观测数据 */
import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Descriptions, Empty, Select, Space, Tag } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { GrowthStageObservationsManager } from '../../components/growth-stage-observations-manager'
import { SecondaryModuleFrame } from '../../components/secondary-module-frame'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCropVarieties } from '../../store/slices/crop-varieties.slice'
import { fetchFields } from '../../store/slices/fields.slice'
import { fetchPlantingRecords } from '../../store/slices/planting-records.slice'

export function GrowthStageExperimentPage(): React.JSX.Element {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const plantingRecordsState = useAppSelector((state) => state.plantingRecords)
  const fields = useAppSelector((state) => state.fields.items)
  const cropVarieties = useAppSelector((state) => state.cropVarieties.items)
  const [selectedPlantingRecordId, setSelectedPlantingRecordId] = useState<number | null>(null)

  useEffect(() => {
    void dispatch(fetchPlantingRecords())
    void dispatch(fetchFields())
    void dispatch(fetchCropVarieties())
  }, [dispatch])

  useEffect(() => {
    if (!selectedPlantingRecordId && plantingRecordsState.items.length > 0) {
      setSelectedPlantingRecordId(plantingRecordsState.items[0].id)
    }
  }, [plantingRecordsState.items, selectedPlantingRecordId])

  const selectedRecord = useMemo(
    () => plantingRecordsState.items.find((item) => item.id === selectedPlantingRecordId) ?? null,
    [plantingRecordsState.items, selectedPlantingRecordId]
  )

  const selectedField = useMemo(
    () => fields.find((item) => item.id === selectedRecord?.fieldId) ?? null,
    [fields, selectedRecord]
  )

  const selectedVariety = useMemo(
    () => cropVarieties.find((item) => item.id === selectedRecord?.varietyId) ?? null,
    [cropVarieties, selectedRecord]
  )

  const recordOptions = useMemo(
    () =>
      plantingRecordsState.items.map((item) => {
        const field = fields.find((fieldItem) => fieldItem.id === item.fieldId)
        const variety = cropVarieties.find((varietyItem) => varietyItem.id === item.varietyId)

        return {
          label: `${item.year} ${item.season} / ${field?.name ?? `地块#${item.fieldId}`} / ${variety?.name ?? `品种#${item.varietyId}`}`,
          value: item.id
        }
      }),
    [cropVarieties, fields, plantingRecordsState.items]
  )

  return (
    <SecondaryModuleFrame
      title="生育期试验数据管理"
      description="独立管理生育期观测数据，按种植记录录入关键阶段、累计积温和形态指标，形成可追溯的试验观测台账。"
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/experimental-data')}>
          返回试验数据管理
        </Button>
      }
    >
      <Card title="试验记录选择">
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
          <Select
            placeholder="选择种植记录"
            value={selectedPlantingRecordId ?? undefined}
            options={recordOptions}
            onChange={(value) => setSelectedPlantingRecordId(value)}
            loading={plantingRecordsState.loading}
          />

          {selectedRecord ? (
            <Descriptions bordered column={4} size="small">
              <Descriptions.Item label="地块">{selectedField?.name ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="品种">{selectedVariety?.name ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="播种日期">{selectedRecord.plantingDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedRecord.status === 'growing' ? 'processing' : 'default'}>
                  {selectedRecord.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="暂无可用的试验记录" />
          )}
        </Space>
      </Card>

      {selectedPlantingRecordId ? <GrowthStageObservationsManager plantingRecordId={selectedPlantingRecordId} /> : null}
    </SecondaryModuleFrame>
  )
}
