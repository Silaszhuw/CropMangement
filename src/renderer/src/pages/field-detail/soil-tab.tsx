/** 地块详情 - 土壤信息标签页：展示地块土壤属性 */
import { Descriptions, Empty } from 'antd'
import type { Field } from '../../../../shared/types/database'

interface FieldSoilTabProps {
  field: Field
}

export function FieldSoilTab({ field }: FieldSoilTabProps): React.JSX.Element {
  if (!field.soilType && field.soilPh == null && field.soilOrganicMatter == null) {
    return <Empty description="暂无土壤信息" />
  }

  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="土壤类型">{field.soilType ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="土壤 pH">{field.soilPh ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="有机质含量（g/kg）">{field.soilOrganicMatter ?? '-'}</Descriptions.Item>
    </Descriptions>
  )
}
