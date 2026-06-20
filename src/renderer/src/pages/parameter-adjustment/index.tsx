/** 参数调整页面：作为二级入口组织模型参数校准流程 */
import { Button, Card, Space, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { SecondaryModuleFrame } from '../../components/secondary-module-frame'

export function ParameterAdjustmentPage(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <SecondaryModuleFrame
      title="参数调整"
      description="该模块在 PDF 信息架构中属于二级入口页，负责组织模型参数校准流程，而不是直接承载全部编辑表格。"
    >
      <div className="module-grid">
        <Card
          className="module-entry-card"
          title="生育期模型参数调整"
          extra={
            <Button type="link" onClick={() => navigate('/parameter-adjustment/model')}>
              进入三级界面
            </Button>
          }
        >
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              对热量参数、光周期参数、品种阈值和土壤适宜性参数进行集中维护，并记录每次调整的原因与责任主体。
            </Typography.Paragraph>
            <Space wrap>
              <Tag color="processing">参数校准</Tag>
              <Tag color="gold">历史追溯</Tag>
              <Tag color="green">默认值对照</Tag>
            </Space>
            <Button type="primary" onClick={() => navigate('/parameter-adjustment/model')}>
              打开模型参数调整
            </Button>
          </Space>
        </Card>

        <Card className="module-entry-card" title="调整流程说明">
          <Space direction="vertical" size={10} style={{ display: 'flex' }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              1. 依据试验观测和模拟偏差识别待校准参数。
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              2. 在三级界面修改当前值并填写调整原因。
            </Typography.Paragraph>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              3. 结合生育进程模拟与预测结果验证参数修正效果。
            </Typography.Paragraph>
          </Space>
        </Card>
      </div>
    </SecondaryModuleFrame>
  )
}
