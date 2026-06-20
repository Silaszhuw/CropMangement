# src 目录文件架构说明

## 1. 完整目录树

```text
src/
├── main/                                  Electron 主进程：窗口、数据库、IPC
│   ├── index.ts                           应用主入口：初始化数据库、注册 IPC、创建窗口
│   ├── preload.ts                         预加载脚本：向渲染进程暴露安全 API
│   ├── database/                          SQLite 数据层
│   │   ├── index.ts                       数据库初始化入口
│   │   ├── connection.ts                  创建并配置 SQLite 连接
│   │   ├── migrate.ts                     执行数据库迁移
│   │   ├── migrations/
│   │   │   ├── 001_init.sql               初始数据库表结构（9张核心表）
│   │   │   └── 002_phase1_tables.sql      Phase 1 扩展表（3张模型相关表）
│   │   └── repositories/                  Repository 数据访问层（13个）
│   │       ├── base-repository.ts         通用仓储基础能力（分页、排序）
│   │       ├── fields-repository.ts       地块数据访问
│   │       ├── crop-varieties-repository.ts
│   │       │                              品种数据访问
│   │       ├── planting-records-repository.ts
│   │       │                              种植记录数据访问
│   │       ├── growth-records-repository.ts
│   │       │                              生长记录数据访问
│   │       ├── operation-records-repository.ts
│   │       │                              农事操作数据访问
│   │       ├── growth-stage-observations-repository.ts
│   │       │                              生育期观测数据访问
│   │       ├── knowledge-items-repository.ts
│   │       │                              知识条目数据访问
│   │       ├── decisions-repository.ts    决策记录数据访问
│   │       ├── evaluations-repository.ts  效益评价数据访问
│   │       ├── app-settings-repository.ts 应用配置数据访问
│   │       ├── model-parameters-repository.ts
│   │       │                              模型参数数据访问
│   │       ├── parameter-adjustment-records-repository.ts
│   │       │                              参数调整记录数据访问
│   │       └── index.ts                   仓储统一导出
│   └── ipc/                               IPC 处理层（13个）
│       ├── index.ts                       IPC 模块统一出口
│       ├── fields.ipc.ts                  地块相关 IPC handler
│       ├── crop-varieties.ipc.ts          品种相关 IPC handler
│       ├── planting-records.ipc.ts        种植记录相关 IPC handler
│       ├── growth-records.ipc.ts          生长记录相关 IPC handler
│       ├── operation-records.ipc.ts       农事操作相关 IPC handler
│       ├── growth-stage-observations.ipc.ts
│       │                                  生育期观测相关 IPC handler
│       ├── knowledge-items.ipc.ts         知识条目相关 IPC handler
│       ├── decisions.ipc.ts               决策记录相关 IPC handler
│       ├── evaluations.ipc.ts             效益评价相关 IPC handler
│       ├── app-settings.ipc.ts            应用配置相关 IPC handler
│       ├── model-parameters.ipc.ts        模型参数相关 IPC handler
│       └── parameter-adjustment-records.ipc.ts
│                                          参数调整记录相关 IPC handler
│
├── renderer/                              React 渲染层
│   ├── index.html                         前端宿主页
│   └── src/
│       ├── main.tsx                       React 入口：布局、菜单、路由、Redux Provider
│       ├── styles.css                     全局样式（农业主题配色）
│       ├── styles.d.ts                    样式类型声明
│       ├── vite-env.d.ts                  Vite 环境声明
│       │
│       ├── components/                    公共组件层（4个）
│       │   ├── secondary-module-frame.tsx 二级模块统一框架组件
│       │   ├── longterm-simulation-card.tsx
│       │   │                              常年决策-生育进程模拟卡片
│       │   ├── current-prediction-card.tsx
│       │   │                              当年决策-生育进程预测卡片
│       │   └── growth-stage-observations-manager.tsx
│       │                                  生育期观测数据管理组件
│       │
│       ├── services/                      服务层（2个）
│       │   ├── ipc-client.ts              前端 IPC 调用统一封装
│       │   └── growth-modeling.ts         生育模型算法（模拟+预测）
│       │
│       ├── store/                         Redux 状态管理
│       │   ├── index.ts                   store 配置入口
│       │   ├── hooks.ts                   类型安全 hooks 封装
│       │   └── slices/                    Redux Slices（11个）
│       │       ├── fields.slice.ts        地块状态与异步 CRUD
│       │       ├── crop-varieties.slice.ts
│       │       │                          品种状态与异步 CRUD
│       │       ├── planting-records.slice.ts
│       │       │                          种植记录状态与异步 CRUD
│       │       ├── growth-records.slice.ts
│       │       │                          生长记录状态与异步 CRUD
│       │       ├── operation-records.slice.ts
│       │       │                          农事操作状态与异步 CRUD
│       │       ├── growth-stage-observations.slice.ts
│       │       │                          生育期观测状态与异步 CRUD
│       │       ├── knowledge-items.slice.ts
│       │       │                          知识条目状态与异步 CRUD
│       │       ├── decisions.slice.ts     决策记录状态与异步 CRUD
│       │       ├── evaluations.slice.ts   效益评价状态与异步 CRUD
│       │       ├── app-settings.slice.ts  应用配置状态与异步 CRUD
│       │       ├── model-parameters.slice.ts
│       │       │                          模型参数状态与异步 CRUD
│       │       └── parameter-adjustment-records.slice.ts
│       │                                  参数调整记录状态与异步 CRUD
│       │
│       └── pages/                         页面模块（21个页面）
│           ├── index.ts                   页面统一导出
│           │
│           ├── home/                      系统介绍（一级主界面）
│           │   └── index.tsx
│           │
│           ├── fields/                    地块管理（支撑模块）
│           │   └── index.tsx
│           ├── field-detail/              地块详情
│           │   ├── index.tsx
│           │   ├── overview-tab.tsx       地块概览
│           │   ├── soil-tab.tsx           土壤信息
│           │   └── planting-records-tab.tsx
│           │                              关联种植记录
│           │
│           ├── crop-varieties/            参数管理（二级界面）
│           │   └── index.tsx
│           ├── crop-variety-detail/       品种详情
│           │   ├── index.tsx
│           │   ├── overview-tab.tsx       品种概览
│           │   ├── agronomy-tab.tsx       农艺特性
│           │   └── planting-records-tab.tsx
│           │                              关联种植记录
│           │
│           ├── soil-data/                 土壤数据管理（二级界面）
│           │   └── index.tsx
│           │
│           ├── planting-records/          试验数据管理（二级界面）
│           │   └── index.tsx
│           ├── planting-record-detail/    种植记录详情
│           │   ├── index.tsx
│           │   ├── overview-tab.tsx       记录概览
│           │   ├── growth-records-tab.tsx 生长记录
│           │   ├── growth-stage-observations-tab.tsx
│           │   │                          生育期观测
│           │   ├── operation-records-tab.tsx
│           │   │                          农事操作
│           │   └── evaluations-tab.tsx    效益评价
│           │
│           ├── experimental-growth-stage/ 生育期试验数据管理（三级界面）
│           │   └── index.tsx
│           │
│           ├── knowledge-items/           玉米栽培专家知识库（二级界面）
│           │   └── index.tsx
│           ├── knowledge-pest/            玉米病虫害防治专家知识库（二级界面）
│           │   └── index.tsx
│           │
│           ├── decision-longterm/         常年决策子系统（二级界面）
│           │   └── index.tsx
│           ├── longterm-simulation/       适宜生育进程模拟（三级界面）
│           │   └── index.tsx
│           │
│           ├── decision-current/          当年决策子系统（二级界面）
│           │   └── index.tsx
│           ├── current-prediction/        生育进程预测（三级界面）
│           │   └── index.tsx
│           │
│           ├── parameter-adjustment/      参数调整（二级界面）
│           │   └── index.tsx
│           ├── model-parameter-adjustment/
│           │   └── index.tsx              生育期模型参数调整（三级界面）
│           │
│           ├── help/                      系统帮助（二级界面）
│           │   └── index.tsx
│           │
│           ├── decisions/                 决策记录查询（辅助页面）
│           │   └── index.tsx
│           ├── settings/                  系统设置（辅助页面）
│           │   └── index.tsx
│           └── placeholder/               占位页面
│               └── index.tsx
│
└── shared/                                跨进程共享层
    ├── constants/
    │   └── ipc.ts                         IPC 通道常量（13个channel）
    └── types/
        ├── database.ts                    数据库实体类型（12个实体）
        ├── ipc.ts                         IPC 请求/响应类型
        ├── global.d.ts                    window 全局类型扩展
        └── json.ts                        JSON 类型工具
```

## 2. 分层说明

### 2.1 `src/main` - Electron 主进程层

**职责**：
- 启动桌面应用
- 初始化 SQLite 数据库（WAL 模式、外键约束）
- 注册 13 个 IPC 通道
- 作为前端访问本地数据的唯一入口

**关键模块**：
- **数据库层**：2 个 migration 文件、13 个 repository
- **IPC 层**：13 个 handler，统一错误处理和响应包装
- **安全桥接**：preload.ts 通过 contextBridge 暴露安全 API

**主调用链路**：
```
renderer -> preload -> ipc handler -> repository -> sqlite
```

### 2.2 `src/renderer` - React 前端层

**职责**：
- 页面展示与用户交互
- 路由和布局（左侧导航 + 顶部标题 + 内容区）
- Redux 状态管理
- 业务逻辑封装（生育模型算法）

**关键模块**：
- **页面层**：21 个页面，覆盖 PDF 要求的 10 个二级 + 4 个三级界面
- **组件层**：4 个公共组件（模块框架、模拟卡片、预测卡片、观测管理器）
- **服务层**：
  - `ipc-client.ts`：统一 IPC 调用封装
  - `growth-modeling.ts`：生育模型算法（积温模型、模拟与预测）
- **状态层**：11 个 Redux slices，覆盖所有业务实体

**当前页面结构**：
- **二级界面（10个）**：系统介绍、参数管理、土壤数据管理、试验数据管理、栽培知识库、病虫害知识库、常年决策、当年决策、参数调整、系统帮助
- **三级界面（4个）**：生育期试验数据管理、适宜生育进程模拟、生育进程预测、生育期模型参数调整
- **辅助页面**：详情页（地块、品种、种植记录）、决策记录查询、系统设置

### 2.3 `src/shared` - 跨进程共享层

**职责**：
- 定义跨 main / renderer 进程的共享契约
- 统一 IPC 通道常量
- 全局类型声明

**关键内容**：
- **database.ts**：12 个数据库实体类型定义
- **ipc.ts**：IPC 请求/响应结构、API 类型契约
- **constants/ipc.ts**：13 个 IPC channel 常量
- **global.d.ts**：window.cropModeling 全局扩展

## 3. 当前架构特点

### 优点

- 分层较清晰：`main / renderer / shared`
- 数据访问链路完整
- 已形成以业务实体为核心的 CRUD 闭环
- 共享类型集中，便于主进程和渲染进程复用

### 已打通的主干模块

- `fields`：地块管理
- `cropVarieties`：品种管理
- `plantingRecords`：种植记录管理

这些模块基本都具备：

- 数据表
- repository
- IPC handler
- preload 暴露
- renderer 页面与 Redux 状态

## 4. 当前存在的不足

### 4.1 缺少公共组件层
目前没有明显独立的 `components` 目录，页面更多直接使用 UI 库组件，后续扩展时可能出现重复代码。

### 4.2 `main.tsx` 职责偏重
`src/renderer/src/main.tsx` 同时承担入口、布局、菜单、路由等职责，随着模块增加可能会变得臃肿。

### 4.3 Redux slice 重复度较高
`fields`、`cropVarieties`、`plantingRecords` 三类 slice 结构相似，后续实体继续增加时维护成本会升高。

### 4.4 数据模型超前于功能实现
数据库和共享类型中已经定义了更多业务实体，但前端实际落地的功能仍以地块、品种、种植记录为主。

## 5. 一句话总结

这是一个典型的 Electron 桌面应用三层结构：

- `main` 持有系统能力与 SQLite 数据层
- `renderer` 负责 React 页面与状态管理
- `shared` 负责跨层共享契约

当前主干链路已经打通，但仍处于早期阶段，后续适合继续补充公共组件抽象、路由拆分和类型边界整理。
