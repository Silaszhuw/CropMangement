/** 种植记录详情 - 生育期观测标签页：管理关键生育阶段观测数据 */
import { GrowthStageObservationsManager } from '../../components/growth-stage-observations-manager'

interface GrowthStageObservationsTabProps {
  plantingRecordId: number
}

export function GrowthStageObservationsTab({ plantingRecordId }: GrowthStageObservationsTabProps): React.JSX.Element {
  return <GrowthStageObservationsManager plantingRecordId={plantingRecordId} />
}
