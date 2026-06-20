/** 地块详情 - 基本信息标签页：展示地块的基本属性 */
import { Descriptions } from 'antd'
import type { Field } from '../../../../shared/types/database'

interface FieldOverviewTabProps {
  field: Field
}

export function FieldOverviewTab({ field }: FieldOverviewTabProps): React.JSX.Element {
  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="地块名称">{field.name}</Descriptions.Item>
      <Descriptions.Item label="面积（亩）">{field.area}</Descriptions.Item>
      <Descriptions.Item label="省份">{field.locationProvince ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="城市">{field.locationCity ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="区县">{field.locationCounty ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="详细位置">{field.locationDetail ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="坐标信息" span={2}>{field.coordinates ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="备注" span={2}>{field.notes ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="创建时间">{field.createdAt}</Descriptions.Item>
      <Descriptions.Item label="更新时间">{field.updatedAt}</Descriptions.Item>
    </Descriptions>
  )
}
