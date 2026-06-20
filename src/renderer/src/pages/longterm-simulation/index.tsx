/** 常年决策 - 适宜生育进程模拟：基于积温模型模拟玉米生育进程 */
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { LongtermSimulationCard } from '../../components/longterm-simulation-card'
import { SecondaryModuleFrame } from '../../components/secondary-module-frame'

export function LongtermSimulationPage(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <SecondaryModuleFrame
      title="适宜生育进程模拟"
      description="基于地块条件、品种参数和平均温度，对播种后的关键生育阶段进行规则化推演，输出适宜生育进程。"
      actions={
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/decision-longterm')}>
          返回常年决策子系统
        </Button>
      }
    >
      <LongtermSimulationCard />
    </SecondaryModuleFrame>
  )
}
