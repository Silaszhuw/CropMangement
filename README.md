# 玉米优质高效栽培管理系统

## 项目概述

玉米优质高效栽培管理系统是一款**单机桌面应用**，面向玉米种植过程中的数据管理、专家知识沉淀、决策支持和效益评价等核心场景。系统以本地化部署和本地数据存储为原则，优先满足农场、合作社、农技推广与科研场景下的日常使用需求。

当前版本以 **MVP（最小可用版本）** 为目标，重点建设种植全周期的核心数据闭环，暂不引入多用户体系、审计日志、复杂规则引擎和外部气象平台集成。

### 核心价值
- **科学决策**：结合地块、品种、生长和历史记录，为种植管理提供数据支撑
- **精细管理**：完整记录播种、生长监测、农事操作、收获评价等关键数据
- **效益优化**：围绕产量、成本、收益形成持续改进闭环
- **知识积累**：将专家经验和本地实践沉淀为可检索、可复用的知识条目

### 适用场景
- 规模化玉米种植农场
- 农业合作社
- 农技推广部门
- 农业科研与试验示范场景

## 功能模块

### 1. 系统介绍
- 系统定位与使用说明
- 功能导航
- 版本信息
- 快速入门指南

### 2. 数据管理
- **地块管理**：维护地块基础信息、土壤信息和位置描述
- **品种管理**：维护玉米品种档案和关键农艺属性
- **种植记录**：记录年度/季节种植计划与执行情况
- **生长监测**：记录长势、生育阶段、病虫害和环境观察数据
- **农事操作**：记录施肥、灌溉、植保、除草、收获等操作

### 3. 专家知识管理
- **知识录入**：录入施肥、灌溉、病虫害防治等专家知识
- **分类检索**：按分类、标题、标签快速查找知识内容
- **本地经验沉淀**：支持将实践经验持续补充到知识库中

### 4. 常年决策
- **品种选择建议**：结合地区、地块和历史表现形成选种参考
- **种植规划建议**：形成年度播种安排和地块使用建议
- **长期管理建议**：沉淀针对地块特征的长期改进方向

### 5. 当年决策
- **播种决策**：播种时间、种植密度等建议
- **田间管理决策**：施肥、灌溉、病虫害处理建议
- **收获决策**：收获时机和注意事项建议

### 6. 参数调整
- **应用参数配置**：维护系统级配置项
- **阈值调整**：为后续模型或规则扩展保留参数入口
- **本地化适配**：根据地区和经营方式微调应用参数

### 7. 效益评价
- **产量记录**：记录种植结果和实际产量
- **成本核算**：记录总成本
- **收益分析**：记录总收入、净利润和综合评分
- **改进建议**：形成下一季种植的优化方向

### 8. 帮助
- 使用说明
- 常见问题
- 技术支持信息

## 技术架构

### 技术栈

#### 前端
- **框架**：React 18
- **语言**：TypeScript
- **状态管理**：Redux Toolkit
- **UI 组件库**：Ant Design
- **图表库**：ECharts
- **日期处理**：date-fns
- **表单验证**：React Hook Form + Zod

#### 桌面端
- **框架**：Electron
- **构建工具**：electron-vite
- **打包工具**：Electron Builder
- **自动更新**：electron-updater
- **本地配置**：electron-store

#### 数据层
- **运行时**：Node.js
- **数据库**：SQLite
- **访问方式**：better-sqlite3
- **存储方式**：本地数据库文件（如 `data/app.db`）

#### 开发工具
- **包管理器**：pnpm
- **代码规范**：ESLint + Prettier
- **Git Hooks**：husky + lint-staged
- **测试框架**：Vitest + React Testing Library

### 架构设计

```
┌─────────────────────────────────────────┐
│           Electron Main Process          │
│  ┌─────────────────────────────────┐    │
│  │ IPC 通信 / 数据库访问 / 系统集成 │    │
│  └─────────────────────────────────┘    │
└─────────────┬───────────────────────────┘
              │
┌─────────────┴───────────────────────────┐
│        Electron Renderer Process         │
│  ┌─────────────────────────────────┐    │
│  │         React Application        │    │
│  │  ┌───────────────────────────┐  │    │
│  │  │   Presentation Layer      │  │    │
│  │  │   (Components / Pages)    │  │    │
│  │  └───────────┬───────────────┘  │    │
│  │              │                   │    │
│  │  ┌───────────┴───────────────┐  │    │
│  │  │   State Management        │  │    │
│  │  │   (Redux Toolkit)         │  │    │
│  │  └───────────┬───────────────┘  │    │
│  │              │                   │    │
│  │  ┌───────────┴───────────────┐  │    │
│  │  │   Business Logic Layer    │  │    │
│  │  │   (Services / Hooks)      │  │    │
│  │  └───────────┬───────────────┘  │    │
│  └──────────────┼───────────────────┘    │
└─────────────────┼───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│            Local Data Layer              │
│  ┌───────────────────────────────────┐  │
│  │            SQLite / app.db        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 数据流

1. **用户交互** → React 组件
2. **组件触发** → Redux Action / 业务服务
3. **业务逻辑处理** → IPC 通信到 Main Process
4. **Main Process 持久化** → SQLite
5. **数据返回** → 更新 Redux State
6. **状态变化** → 组件重新渲染

## 数据库设计

### 设计原则
- **单机优先**：所有业务数据保存在本地 SQLite 数据库中
- **核心收敛**：优先覆盖地块、品种、种植、生长、操作、决策、评价等核心流程
- **规则后置**：首期不引入复杂规则引擎，先用知识条目和人工决策记录支撑业务
- **结构清晰**：控制表数量和字段复杂度，优先保证易实现、易维护

### 核心数据表

#### 1. 地块信息（fields）
```sql
- id: 主键
- name: 地块名称
- area: 面积（亩）
- location_province / location_city / location_county: 行政区划
- location_detail: 详细位置
- coordinates: GeoJSON 字符串（可选）
- soil_type: 土壤类型
- soil_ph: 土壤 pH 值
- soil_organic_matter: 有机质含量
- notes: 备注
- created_at / updated_at: 时间戳
```

#### 2. 作物品种（crop_varieties）
```sql
- id: 主键
- name: 品种名称
- code: 品种编号
- type: 品种类型（早熟/中熟/晚熟）
- growth_period: 生育期（天）
- yield_potential: 产量潜力
- disease_resistance: 抗病性描述
- description: 品种说明
- is_active: 是否启用
- created_at / updated_at: 时间戳
```

#### 3. 种植记录（planting_records）
```sql
- id: 主键
- field_id: 地块 ID（外键）
- variety_id: 品种 ID（外键）
- year: 种植年份
- season: 季节
- planting_date: 播种日期
- expected_harvest_date: 预计收获日期
- actual_harvest_date: 实际收获日期
- planting_density: 种植密度
- row_spacing / plant_spacing: 行距、株距
- status: 状态（planning/growing/harvested/failed）
- notes: 备注
- created_at / updated_at: 时间戳
```

#### 4. 生长记录（growth_records）
```sql
- id: 主键
- planting_record_id: 种植记录 ID（外键）
- record_date: 记录日期
- growth_stage: 生长阶段
- plant_height: 株高
- leaf_count: 叶片数
- leaf_color: 叶色
- disease_status: 病害情况
- pest_status: 虫害情况
- soil_moisture: 土壤含水量
- weather_temperature_avg: 平均温度
- weather_rainfall: 降雨量
- photo_paths: 照片路径 JSON 字符串
- notes: 备注
- created_at / updated_at: 时间戳
```

#### 5. 农事操作记录（operation_records）
```sql
- id: 主键
- planting_record_id: 种植记录 ID（外键）
- operation_type: 操作类型
- operation_date: 操作日期
- details: 详情 JSON 字符串
- cost: 成本
- operator: 操作人员
- photo_paths: 照片路径 JSON 字符串
- notes: 备注
- created_at / updated_at: 时间戳
```

> 说明：不同操作类型（施肥、灌溉、植保、除草、收获等）的差异化参数统一收敛到 `details` 字段中，避免首期表结构过宽。

#### 6. 专家知识条目（knowledge_items）
```sql
- id: 主键
- category: 知识分类
- title: 标题
- content: 内容
- tags: 标签 JSON 字符串
- source: 来源
- is_active: 是否启用
- created_at / updated_at: 时间戳
```

#### 7. 决策记录（decisions）
```sql
- id: 主键
- field_id: 地块 ID（可空）
- planting_record_id: 种植记录 ID（可空）
- decision_type: 决策类型（常年决策/当年决策）
- decision_category: 决策类别
- decision_date: 决策日期
- title: 决策标题
- content: 决策内容
- basis_summary: 决策依据摘要
- recommended_actions: 推荐行动清单
- status: 状态（pending/accepted/rejected/executed/completed）
- user_feedback: 用户反馈
- created_at / updated_at: 时间戳
```

> 说明：决策既可以面向地块，也可以面向某次具体种植，因此 `field_id` 和 `planting_record_id` 采用可空设计。

#### 8. 效益评价（evaluations）
```sql
- id: 主键
- planting_record_id: 种植记录 ID（外键）
- evaluation_date: 评价日期
- evaluation_type: 评价类型（阶段评价/最终评价）
- actual_yield: 实际产量
- total_cost: 总成本
- total_income: 总收入
- net_profit: 净利润
- overall_score: 综合评分
- improvement_suggestions: 改进建议
- notes: 备注
- created_at / updated_at: 时间戳
```

#### 9. 应用配置（app_settings）
```sql
- id: 主键
- config_key: 配置键
- config_value: 配置值（文本或 JSON 字符串）
- description: 描述
- updated_at: 更新时间
```

### 当前版本明确不纳入首期数据库的内容
- 多用户登录与权限管理
- 审计日志
- 独立气象数据中心
- 自动规则引擎及规则触发链路
- PostgreSQL / 服务端数据库部署

### 数据关系

```
fields (1) ─→ (N) planting_records
crop_varieties (1) ─→ (N) planting_records
planting_records (1) ─→ (N) growth_records
planting_records (1) ─→ (N) operation_records
planting_records (1) ─→ (N) evaluations
fields (1) ─→ (N) decisions
planting_records (1) ─→ (N) decisions
```

## 开发规范

### 代码规范

#### 目录结构
```text
src/
├── main/                     # Electron 主进程
│   ├── index.ts
│   ├── ipc/                  # IPC 通信处理
│   ├── database/             # SQLite 访问层
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   └── repositories/
│   └── services/             # 主进程业务服务
├── renderer/                 # Electron 渲染进程
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── pages/
│       ├── store/
│       ├── services/
│       ├── hooks/
│       ├── utils/
│       ├── types/
│       ├── App.tsx
│       └── main.tsx
└── shared/
    ├── types/
    └── constants/
```

#### 命名规范
- **文件名**：小写 + 连字符（kebab-case）
- **组件名**：大驼峰（PascalCase）
- **函数/变量**：小驼峰（camelCase）
- **常量**：全大写 + 下划线
- **类型/接口**：大驼峰 + 描述性命名

#### TypeScript 规范
- 优先使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型与交叉类型
- 避免使用 `any`
- 为关键函数的参数和返回值补全类型

#### React 规范
- 优先使用函数组件
- 使用 Hooks 管理状态和副作用
- 组件保持单一职责
- 谨慎使用 `memo` 做性能优化
- Props 解构并提供明确类型定义

#### 数据访问规范
- SQLite 访问集中在 Main Process
- Renderer 不直接操作数据库文件
- 所有数据库读写通过 IPC 和统一仓储层封装
- JSON 字段统一在应用层序列化/反序列化

### 开发流程

1. 需求分析
2. 数据表设计
3. IPC 接口设计
4. 主进程数据库访问实现
5. 渲染层页面与状态管理开发
6. 单元测试与集成测试
7. 功能验证与迭代收敛

### 测试策略
- **单元测试**：工具函数、业务逻辑、数据转换
- **组件测试**：React 组件渲染和交互
- **集成测试**：IPC 通信、SQLite 数据访问
- **E2E 测试**：关键种植业务流程

## 部署与发布

### 构建命令
```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 打包应用
pnpm package

# 打包并创建安装程序
pnpm package:all
```

### 数据存储与初始化
- 应用使用本地 SQLite 数据库文件保存数据
- 数据库文件可放置于应用数据目录，例如 `data/app.db`
- 首次启动时由应用自动初始化数据库结构
- 后续表结构变更通过本地迁移脚本维护

### 打包配置
支持多平台打包：
- **Windows**：NSIS 安装程序（.exe）
- **macOS**：DMG 镜像（.dmg）
- **Linux**：AppImage / Deb / RPM

### 更新机制
使用 `electron-updater` 实现自动更新：
1. 应用启动时检查更新
2. 后台下载新版本
3. 提示用户安装更新
4. 重启后完成升级

## 项目初始化

```bash
# 克隆项目
git clone <repository-url>
cd CropModeling

# 安装依赖
pnpm install

# 启动开发模式
pnpm dev
```

## 环境要求
- **Node.js**：>= 18.0.0
- **pnpm**：>= 8.0.0
- **操作系统**：Windows 10+、macOS 11+、Linux

## 许可证
[待定]

## 贡献指南
[待定]

## 联系方式
[待定]

---

**最后更新时间**：2026-06-17
