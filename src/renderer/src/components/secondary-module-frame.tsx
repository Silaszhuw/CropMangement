/** 二级模块框架组件：提供二级页面的统一布局结构 */
import { Space, Typography } from 'antd'

interface SecondaryModuleFrameProps {
  title: string
  description: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function SecondaryModuleFrame({
  title,
  description,
  actions,
  children
}: SecondaryModuleFrameProps): React.JSX.Element {
  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      <div className="page-header">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            {title}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {description}
          </Typography.Paragraph>
        </div>
        {actions}
      </div>
      {children}
    </Space>
  )
}
