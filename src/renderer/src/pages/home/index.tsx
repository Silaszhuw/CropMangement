/** 系统首页：展示系统介绍和功能概览 */
import { Space, Tag, Typography } from 'antd'
import { cropModelingApi } from '../../services/ipc-client'

export function HomePage(): React.JSX.Element {
  const version = cropModelingApi.version ?? '0.1.0'

  return (
    <Space direction="vertical" size={24} style={{ display: 'flex' }}>
      <div className="page-header">
        <div>
          <Typography.Title level={3} style={{ marginBottom: 8 }}>
            系统介绍
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
            玉米优质高效栽培管理系统用于组织基础数据、试验观测、专家知识、决策支持与模型参数校准，界面结构按 PDF 原型重新对齐为“一级菜单 + 二级工作台 + 三级专题页面”。
          </Typography.Paragraph>
        </div>
        <Tag color="green">版本 {version}</Tag>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>一、系统定位</Typography.Title>
        <Typography.Paragraph>
          系统面向玉米优质高效栽培业务，围绕“参数建档、土壤基础数据、试验数据、专家知识、常年决策、当年决策、模型参数校准”形成闭环支撑。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          当前实现采用 Electron、React、TypeScript 与 SQLite 的本地化架构，适合离线业务环境下的数据管理与原型验证。
        </Typography.Paragraph>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>二、功能结构</Typography.Title>
        <ul className="bullet-list">
          <li><strong>系统介绍</strong>：说明平台定位、信息架构与业务流程。</li>
          <li><strong>参数管理</strong>：维护玉米品种参数档案，而非系统键值配置。</li>
          <li><strong>土壤数据管理</strong>：维护地块与土壤属性基础数据。</li>
          <li><strong>试验数据管理</strong>：作为二级工作台组织试验记录和生育期试验数据管理入口。</li>
          <li><strong>玉米栽培专家知识库</strong>：沉淀栽培技术知识条目。</li>
          <li><strong>玉米病虫害防治专家知识库</strong>：沉淀病虫害识别与防治知识。</li>
          <li><strong>常年决策子系统</strong>：进入适宜生育进程模拟与长期决策档案。</li>
          <li><strong>当年决策子系统</strong>：进入生育进程预测与季内决策档案。</li>
          <li><strong>参数调整</strong>：进入生育期模型参数调整专题页面。</li>
          <li><strong>系统帮助</strong>：提供操作说明、业务流程与维护要点。</li>
        </ul>
      </div>

      <div className="document-panel">
        <Typography.Title level={4}>三、业务流程</Typography.Title>
        <Typography.Paragraph>
          建议先完成品种参数、地块和土壤基础数据建档，再录入试验记录与生育期观测数据，随后结合专家知识执行常年模拟、当年预测和参数校准。
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          其中，系统级配置页面仍保留为后台管理入口，但不再占据 PDF 主菜单的“参数管理”语义位置。
        </Typography.Paragraph>
      </div>
    </Space>
  )
}
