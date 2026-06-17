import { Typography } from 'antd'

interface GrowthRecordsTabProps {
  plantingRecordId: number
}

export function GrowthRecordsTab({ plantingRecordId }: GrowthRecordsTabProps): React.JSX.Element {
  return (
    <div>
      <Typography.Paragraph type="secondary">
        生长记录功能将在后续阶段实现，用于记录玉米生长各阶段的株高、叶片数、病虫害状况、土壤湿度、气象数据等观测信息。
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        种植记录 ID: {plantingRecordId}
      </Typography.Paragraph>
    </div>
  )
}
