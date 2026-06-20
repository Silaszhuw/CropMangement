/** 种植记录详情 - 基本信息标签页：展示种植记录的基本参数和关联信息 */
import { Button, Descriptions, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { PlantingRecord, Field, CropVariety } from '../../../../shared/types/database'

interface OverviewTabProps {
  record: PlantingRecord
  field?: Field
  variety?: CropVariety
}

export function OverviewTab({ record, field, variety }: OverviewTabProps): React.JSX.Element {
  const navigate = useNavigate()
  const statusColorMap: Record<string, string> = {
    planning: 'default',
    growing: 'processing',
    harvested: 'success',
    failed: 'error'
  }

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      <div>
        <Typography.Title level={5}>种植基本信息</Typography.Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="关联地块">{field?.name ?? `地块 #${record.fieldId}`}</Descriptions.Item>
          <Descriptions.Item label="关联品种">{variety?.name ?? `品种 #${record.varietyId}`}</Descriptions.Item>
          <Descriptions.Item label="种植年份">{record.year}</Descriptions.Item>
          <Descriptions.Item label="种植季节">{record.season}</Descriptions.Item>
          <Descriptions.Item label="播种日期">{record.plantingDate}</Descriptions.Item>
          <Descriptions.Item label="预计收获日期">{record.expectedHarvestDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="实际收获日期">{record.actualHarvestDate ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="当前状态">
            <Tag color={statusColorMap[record.status] ?? 'default'}>{record.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div>
        <Typography.Title level={5}>种植参数</Typography.Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="种植密度（株/亩）">{record.plantingDensity ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="行距（cm）">{record.rowSpacing ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="株距（cm）">{record.plantSpacing ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>
            {record.notes ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {field && (
        <div>
          <Typography.Title level={5}>地块信息</Typography.Title>
          <Space style={{ marginBottom: 12 }}>
            <Button type="link" onClick={() => navigate(`/fields/${field.id}`)}>
              查看地块详情
            </Button>
          </Space>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="地块名称">{field.name}</Descriptions.Item>
            <Descriptions.Item label="面积（亩）">{field.area}</Descriptions.Item>
            <Descriptions.Item label="位置">
              {[field.locationProvince, field.locationCity, field.locationCounty].filter(Boolean).join(' / ') || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="土壤类型">{field.soilType ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="土壤 pH">{field.soilPh ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="有机质含量">{field.soilOrganicMatter ?? '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {variety && (
        <div>
          <Typography.Title level={5}>品种信息</Typography.Title>
          <Space style={{ marginBottom: 12 }}>
            <Button type="link" onClick={() => navigate(`/parameter-management/${variety.id}`)}>
              查看品种详情
            </Button>
          </Space>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="品种名称">{variety.name}</Descriptions.Item>
            <Descriptions.Item label="品种编号">{variety.code ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="品种类型">{variety.type}</Descriptions.Item>
            <Descriptions.Item label="生育期（天）">{variety.growthPeriod ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="产量潜力（kg/亩）">{variety.yieldPotential ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {variety.isActive ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="抗病性描述" span={2}>
              {variety.diseaseResistance ?? '-'}
            </Descriptions.Item>
            <Descriptions.Item label="品种说明" span={2}>
              {variety.description ?? '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      <div>
        <Typography.Title level={5}>时间信息</Typography.Title>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="创建时间">{record.createdAt}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{record.updatedAt}</Descriptions.Item>
        </Descriptions>
      </div>
    </Space>
  )
}
