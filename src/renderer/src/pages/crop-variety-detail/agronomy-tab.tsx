/** 品种参数详情 - 农艺特征标签页：展示品种的农艺参数 */
import { Descriptions, Empty } from 'antd'
import type { CropVariety } from '../../../../shared/types/database'

interface CropVarietyAgronomyTabProps {
  variety: CropVariety
}

export function CropVarietyAgronomyTab({ variety }: CropVarietyAgronomyTabProps): React.JSX.Element {
  if (variety.growthPeriod == null && variety.yieldPotential == null && !variety.diseaseResistance) {
    return <Empty description="暂无农艺特征信息" />
  }

  return (
    <Descriptions bordered column={2}>
      <Descriptions.Item label="生育期（天）">{variety.growthPeriod ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="产量潜力（kg/亩）">{variety.yieldPotential ?? '-'}</Descriptions.Item>
      <Descriptions.Item label="抗病性描述" span={2}>{variety.diseaseResistance ?? '-'}</Descriptions.Item>
    </Descriptions>
  )
}
