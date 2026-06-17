import { Typography } from 'antd'

interface OperationRecordsTabProps {
  plantingRecordId: number
}

export function OperationRecordsTab({ plantingRecordId }: OperationRecordsTabProps): React.JSX.Element {
  return (
    <div>
      <Typography.Paragraph type="secondary">
        农事操作记录功能将在后续阶段实现，用于记录施肥、灌溉、除草、病虫害防治等农事活动的详细信息。
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        种植记录 ID: {plantingRecordId}
      </Typography.Paragraph>
    </div>
  )
}
