import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, Layout, Menu } from 'antd'
import {
  BugOutlined,
  BarChartOutlined,
  BookOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import {
  CropVarietyDetailPage,
  CropVarietiesPage,
  CurrentPredictionPage,
  DecisionCurrentPage,
  DecisionLongtermPage,
  FieldDetailPage,
  FieldsPage,
  GrowthStageExperimentPage,
  HelpPage,
  HomePage,
  KnowledgeItemsPage,
  KnowledgePestPage,
  LongtermSimulationPage,
  ModelParameterAdjustmentPage,
  ParameterAdjustmentPage,
  PlantingRecordDetailPage,
  PlantingRecordsPage,
  SettingsPage,
  SoilDataPage
} from './pages'
import { store } from './store'
import './styles.css'

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '系统介绍' },
  { key: '/parameter-management', icon: <SettingOutlined />, label: '参数管理' },
  { key: '/soil-data', icon: <DatabaseOutlined />, label: '土壤数据管理' },
  { key: '/experimental-data', icon: <ExperimentOutlined />, label: '试验数据管理' },
  { key: '/knowledge-cultivation', icon: <BookOutlined />, label: '玉米栽培专家知识库' },
  { key: '/knowledge-pest', icon: <BugOutlined />, label: '玉米病虫害防治专家知识库' },
  { key: '/decision-longterm', icon: <BarChartOutlined />, label: '常年决策子系统' },
  { key: '/decision-current', icon: <ThunderboltOutlined />, label: '当年决策子系统' },
  { key: '/parameter-adjustment', icon: <ControlOutlined />, label: '参数调整' },
  { key: '/help', icon: <QuestionCircleOutlined />, label: '系统帮助' }
]

function resolveSelectedMenuKey(pathname: string): string | null {
  if (pathname === '/') {
    return '/'
  }

  const routeGroups: Array<{ key: string; prefixes: string[] }> = [
    { key: '/parameter-management', prefixes: ['/parameter-management', '/crop-varieties'] },
    { key: '/soil-data', prefixes: ['/soil-data', '/fields'] },
    { key: '/experimental-data', prefixes: ['/experimental-data', '/planting-records'] },
    { key: '/knowledge-cultivation', prefixes: ['/knowledge-cultivation'] },
    { key: '/knowledge-pest', prefixes: ['/knowledge-pest'] },
    { key: '/decision-longterm', prefixes: ['/decision-longterm'] },
    { key: '/decision-current', prefixes: ['/decision-current'] },
    { key: '/parameter-adjustment', prefixes: ['/parameter-adjustment'] },
    { key: '/help', prefixes: ['/help'] }
  ]

  return routeGroups.find((group) => group.prefixes.some((prefix) => pathname.startsWith(prefix)))?.key ?? null
}

export function AppLayout(): React.JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedMenuKey = resolveSelectedMenuKey(location.pathname)

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2d5016',
          colorInfo: '#7cb342',
          borderRadius: 6,
          fontSize: 14
        }
      }}
    >
      <Layout className="app-shell" style={{ minHeight: '100vh' }}>
        <Layout.Sider className="app-sider" width={248}>
          <div className="app-logo">玉米优质高效栽培管理系统</div>
          <div className="app-sider-subtitle">作物建模与应用系统开发原型</div>
          <div className="app-sider-menu">
            <Menu
              className="app-menu"
              mode="inline"
              selectedKeys={selectedMenuKey ? [selectedMenuKey] : []}
              items={menuItems}
              onClick={({ key }) => navigate(key)}
            />
          </div>
        </Layout.Sider>
        <Layout>
          <Layout.Header className="app-header">
            <div className="app-header-title">作物建模与应用系统开发原型</div>
          </Layout.Header>
          <Layout.Content className="app-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/parameter-management" element={<CropVarietiesPage />} />
              <Route path="/parameter-management/:id" element={<CropVarietyDetailPage />} />
              <Route path="/system-settings" element={<SettingsPage />} />
              <Route path="/soil-data" element={<SoilDataPage />} />
              <Route path="/experimental-data" element={<PlantingRecordsPage />} />
              <Route path="/experimental-data/growth-stage" element={<GrowthStageExperimentPage />} />
              <Route path="/experimental-data/:id" element={<PlantingRecordDetailPage />} />
              <Route path="/knowledge-cultivation" element={<KnowledgeItemsPage />} />
              <Route path="/knowledge-pest" element={<KnowledgePestPage />} />
              <Route path="/decision-longterm" element={<DecisionLongtermPage />} />
              <Route path="/decision-longterm/simulation" element={<LongtermSimulationPage />} />
              <Route path="/decision-current" element={<DecisionCurrentPage />} />
              <Route path="/decision-current/prediction" element={<CurrentPredictionPage />} />
              <Route path="/parameter-adjustment" element={<ParameterAdjustmentPage />} />
              <Route path="/parameter-adjustment/model" element={<ModelParameterAdjustmentPage />} />
              <Route path="/help" element={<HelpPage />} />

              <Route path="/fields" element={<FieldsPage />} />
              <Route path="/fields/:id" element={<FieldDetailPage />} />
              <Route path="/crop-varieties" element={<CropVarietiesPage />} />
              <Route path="/crop-varieties/:id" element={<CropVarietyDetailPage />} />
              <Route path="/planting-records" element={<PlantingRecordsPage />} />
              <Route path="/planting-records/:id" element={<PlantingRecordDetailPage />} />

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
