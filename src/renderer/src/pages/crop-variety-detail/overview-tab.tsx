/** 品种参数详情 - 基本属性标签页：展示品种的基本信息 */
import { Descriptions, Tag } from 'antd'
import type { CropVariety } from '../../../../shared/types/database'

interface CropVarietyOverviewTabProps {
  variety: CropVariety
}

export function CropVarietyOverviewTab({ variety }: CropVarietyOverviewTabProps): React.JSX.Element {
  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="品种名称">{variety.name}</Descriptions.Item>
      <Descriptions.Item label="品种编号">{variety.code ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="品种类型">{variety.type}</Descriptions.Item>
      <Descriptions.Item label="状态">{variety.isActive ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>}</Descriptions.Item>
      <Descriptions.Item label="创建时间">{variety.createdAt}</Descriptions.Item>
      <Descriptions.Item label="更新时间">{variety.updatedAt}</Descriptions.Item>
      <Descriptions.Item label="品种说明" span={2}>{variety.description ?? '-'}</Descriptions.Item>
    </Descriptions>
  )
}
