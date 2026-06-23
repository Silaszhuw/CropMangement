/** 系统帮助页面：提供操作说明、业务流程与维护要点 */
import { Space, Tag, Typography } from 'antd'

export function HelpPage(): React.JSX.Element {
  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      <div className="page-header">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            系统帮助
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            本页采用说明书体例整理系统操作路径、模块职责和维护要点。
          </Typography.Paragraph>
        </div>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>一、推荐使用顺序</Typography.Title>
        <Typography.Paragraph>1. 在“参数管理”录入玉米品种参数。</Typography.Paragraph>
        <Typography.Paragraph>2. 在“土壤数据管理”完善地块与土壤基础信息。</Typography.Paragraph>
        <Typography.Paragraph>
          3. 在“试验数据管理”建立试验记录，并进入“生育期试验数据管理”录入专题观测。
        </Typography.Paragraph>
        <Typography.Paragraph>4. 在“常年决策子系统”和“当年决策子系统”分别开展模拟与预测。</Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          5. 在“参数调整”中根据试验偏差执行模型参数校准。
        </Typography.Paragraph>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>二、模块说明</Typography.Title>
        <Space wrap style={{ marginBottom: 12 }}>
          <Tag color="processing">二级工作台</Tag>
          <Tag color="gold">三级专题页</Tag>
          <Tag color="green">后台配置</Tag>
        </Space>
        <ul className="bullet-list">
          <li><strong>参数管理</strong>：维护品种参数档案，不等同于系统配置页。</li>
          <li><strong>试验数据管理</strong>：承接试验记录总览，并跳转到生育期试验数据管理专题页。</li>
          <li><strong>常年决策子系统</strong>：进入适宜生育进程模拟并维护常年决策记录。</li>
          <li><strong>当年决策子系统</strong>：进入生育进程预测并维护当年决策记录。</li>
          <li><strong>参数调整</strong>：进入生育期模型参数调整专题页。</li>
          <li><strong>系统配置</strong>：后台保留页面，处理系统级键值配置。</li>
        </ul>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>三、常见操作</Typography.Title>
        <Typography.Paragraph>
          查看某条试验记录的完整信息：进入“试验数据管理”，在台账表格中打开对应记录，即可查看生长记录、生育期观测、农事操作和效益评价。
        </Typography.Paragraph>
        <Typography.Paragraph>
          查看某品种关联的试验记录：进入“参数管理”，打开品种参数详情，在“关联种植记录”页签中查看。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          如果需要调整模型阈值，请不要在二级入口页直接寻找编辑表格，应进入“生育期模型参数调整”三级界面操作。
        </Typography.Paragraph>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>四、维护说明</Typography.Title>
        <Typography.Paragraph>
          当前版本数据保存在本地 SQLite 数据库中，适用于原型验证和离线业务场景。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          若后续需要扩展导出、批量导入或权限控制，应优先在后台配置与数据服务层补齐相应机制，再扩展界面入口。
        </Typography.Paragraph>
      </div>
    </Space>
  )
}
