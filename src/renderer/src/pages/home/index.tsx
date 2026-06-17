import { Card, Col, Row, Space, Statistic, Tag, Typography } from 'antd'
import { cropModelingApi } from '../../services/ipc-client'

export function HomePage(): React.JSX.Element {
  const version = cropModelingApi.version ?? '0.1.0'

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      <div className="page-header">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            系统概览
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            当前工程已完成 Electron、SQLite、Repository 与 IPC 基础链路，可开始逐步完善核心业务页面。
          </Typography.Paragraph>
        </div>
        <Tag color="green">版本 {version}</Tag>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic title="当前完成阶段" value="阶段 3" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="已接通模块" value={3} suffix="个" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="数据存储" value="SQLite" />
          </Card>
        </Col>
      </Row>

      <Card title="下一步建议">
        <ul className="bullet-list">
          <li>完善地块管理 CRUD 页面</li>
          <li>完善品种管理 CRUD 页面</li>
          <li>继续推进种植记录页面并串联关联选择</li>
        </ul>
      </Card>
    </Space>
  )
}
