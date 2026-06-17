import { Typography } from 'antd'

interface EvaluationsTabProps {
  plantingRecordId: number
}

export function EvaluationsTab({ plantingRecordId }: EvaluationsTabProps): React.JSX.Element {
  return (
    <div>
      <Typography.Paragraph type="secondary">
        效益评价功能将在后续阶段实现，用于记录实际产量、成本核算、收益分析和综合评分。
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        种植记录 ID: {plantingRecordId}
      </Typography.Paragraph>
    </div>
  )
}
