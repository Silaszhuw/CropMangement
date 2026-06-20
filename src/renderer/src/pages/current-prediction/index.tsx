/** 当年决策 - 生育进程预测：动态预测下一关键生育阶段和成熟期窗口 */
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { CurrentPredictionCard } from '../../components/current-prediction-card'
import { SecondaryModuleFrame } from '../../components/secondary-module-frame'

export function CurrentPredictionPage(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <SecondaryModuleFrame
      title="生育进程预测"
      description="结合当前观测记录和模型参数，对下一关键生育阶段和成熟期窗口进行动态预测。"
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/decision-current')}>
          返回当年决策子系统
        </Button>
      }
    >
      <CurrentPredictionCard />
    </SecondaryModuleFrame>
  )
}
