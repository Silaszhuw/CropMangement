import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, Layout, Menu } from 'antd'
import {
  AppstoreOutlined,
  BarChartOutlined,
  BookOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  FieldTimeOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { CropVarietiesPage } from './pages/crop-varieties'
import { FieldsPage } from './pages/fields'
import { HomePage } from './pages/home'
import { PlaceholderPage } from './pages/placeholder'
import { PlantingRecordDetailPage } from './pages/planting-record-detail'
import { PlantingRecordsPage } from './pages/planting-records'
import { store } from './store'
import './styles.css'

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '系统介绍' },
  { key: '/fields', icon: <DatabaseOutlined />, label: '地块管理' },
  { key: '/crop-varieties', icon: <AppstoreOutlined />, label: '品种管理' },
  { key: '/planting-records', icon: <FieldTimeOutlined />, label: '种植记录' },
  { key: '/growth-records', icon: <ExperimentOutlined />, label: '生长记录' },
  { key: '/operation-records', icon: <SettingOutlined />, label: '农事操作' },
  { key: '/evaluations', icon: <BarChartOutlined />, label: '效益评价' },
  { key: '/knowledge-items', icon: <BookOutlined />, label: '专家知识' }
]

export function AppLayout(): React.JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#4f8a10',
          borderRadius: 8
        }
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Layout.Sider theme="light" width={240}>
          <div className="app-logo">玉米栽培管理</div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
          />
        </Layout.Sider>
        <Layout>
          <Layout.Header className="app-header">
            <div className="app-header-title">玉米优质高效栽培管理系统</div>
          </Layout.Header>
          <Layout.Content className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fields" element={<FieldsPage />} />
              <Route path="/crop-varieties" element={<CropVarietiesPage />} />
              <Route path="/planting-records" element={<PlantingRecordsPage />} />
              <Route path="/planting-records/:id" element={<PlantingRecordDetailPage />} />
              <Route
                path="/growth-records"
                element={<PlaceholderPage title="生长记录" description="将在后续阶段接入生长记录录入与列表查询功能。" />}
              />
              <Route
                path="/operation-records"
                element={<PlaceholderPage title="农事操作" description="将在后续阶段接入施肥、灌溉、植保等农事操作管理。" />}
              />
              <Route
                path="/evaluations"
                element={<PlaceholderPage title="效益评价" description="将在后续阶段补充产量、成本与收益评价页面。" />}
              />
              <Route
                path="/knowledge-items"
                element={<PlaceholderPage title="专家知识" description="将在后续阶段实现知识条目管理与分类检索。" />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <AppLayout />
      </Router>
    </Provider>
  </React.StrictMode>
)
