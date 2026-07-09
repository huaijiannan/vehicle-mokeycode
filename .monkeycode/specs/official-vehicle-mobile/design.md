# 公务用车移动端 - 技术设计文档

Feature Name: official-vehicle-mobile
Updated: 2026-07-09

## 描述

在现有 Vue 3 + Element Plus 的 PC 端管理后台基础上，新增移动端轻量操作终端。移动端采用独立路由和独立页面组件，复用现有后端 API 和 Pinia 状态管理。利用移动设备摄像头实现拍照上传和 OCR 里程识别，不支持 GPS 定位功能（车辆无定位装置）。

## 架构

### 系统架构图

```mermaid
graph TD
    subgraph 移动端
        A1["移动浏览器"]
    end
    subgraph PC端
        A2["PC 浏览器"]
    end
    A1 --> B["Vite Dev Server 端口8080"]
    A2 --> B
    B --> C["Vue 3 SPA"]
    C --> D["PC 端页面 /"]
    C --> E["移动端页面 /m/"]
    B --> F["API 反向代理 /api"]
    F --> G["Express 后端 端口3001"]
    G --> H["JWT 认证中间件"]
    G --> I["业务路由层"]
    I --> J["SQLite 数据库"]
    I --> K["文件存储"]
```

### 分层架构

```mermaid
graph LR
    subgraph 前端层
        A1["PC 端 Views"]
        A2["移动端 Views /m/"]
        A3["Vue Router"]
        A4["Pinia Store"]
        A5["Axios HTTP"]
    end
    subgraph 网关层
        B1["Vite Proxy"]
    end
    subgraph 服务层
        C1["认证服务"]
        C2["车辆服务"]
        C3["申请审批服务"]
        C4["调度服务"]
        C5["行程服务"]
        C6["费用服务"]
        C7["报表服务"]
        C8["通知服务"]
    end
    subgraph 数据层
        D1["SQLite"]
        D2["文件存储"]
    end
    A1 --> A3
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> B1
    B1 --> C1
    B1 --> C2
    B1 --> C3
    B1 --> C4
    B1 --> C5
    B1 --> C6
    B1 --> C7
    B1 --> C8
    C1 --> D1
    C2 --> D1
    C3 --> D1
    C4 --> D1
    C5 --> D1
    C6 --> D1
    C7 --> D1
    C8 --> D1
```

## 组件与接口

### 移动端路由设计

移动端路由统一使用 `/m` 前缀，与 PC 端路由隔离：

| 路径 | 名称 | 组件 | 角色 |
|------|------|------|------|
| `/m/login` | 登录 | MobileLoginView | 公开 |
| `/m/home` | 首页 | MobileHomeView | 全部（按角色渲染） |
| `/m/apply/create` | 用车申请 | MobileApplyCreateView | 普通员工 |
| `/m/apply/list` | 我的申请 | MobileApplyListView | 普通员工 |
| `/m/apply/:id` | 申请详情 | MobileApplyDetailView | 普通员工、审批人 |
| `/m/approve/list` | 待审批列表 | MobileApproveListView | 部门负责人、分管领导 |
| `/m/dispatch/list` | 待调度列表 | MobileDispatchListView | 调度员 |
| `/m/dispatch/assign/:id` | 快速派车 | MobileDispatchAssignView | 调度员 |
| `/m/task/list` | 我的任务 | MobileTaskListView | 驾驶员 |
| `/m/task/:id/start` | 出车确认 | MobileTripStartView | 驾驶员 |
| `/m/task/:id/end` | 归库确认 | MobileTripEndView | 驾驶员 |
| `/m/expense/create` | 费用随手记 | MobileExpenseCreateView | 驾驶员 |
| `/m/repair/create` | 一键报修 | MobileRepairCreateView | 驾驶员 |
| `/m/monitor` | 全局看板 | MobileMonitorView | 管理员 |
| `/m/vehicle/status` | 车辆状态看板 | MobileVehicleStatusView | 调度员、负责人、领导 |
| `/m/notifications` | 消息列表 | MobileNotificationView | 全部 |

### 移动端组件树

```
App.vue
├── RouterView
│   ├── PC 端路由 (/)
│   │   └── Layout (Sidebar + Header + Content)
│   └── 移动端路由 (/m)
│       └── MobileLayout (无侧边栏，底部 TabBar)
│           ├── MobileHomeView
│           │   ├── RoleHomeEmployee      -- 普通员工首页
│           │   ├── RoleHomeApprover      -- 审批人首页
│           │   ├── RoleHomeDispatcher    -- 调度员首页
│           │   ├── RoleHomeDriver        -- 驾驶员首页
│           │   └── RoleHomeAdmin         -- 管理员首页
│           ├── MobileApplyCreateView
│           │   ├── FormSteps             -- 分步表单（3步）
│           │   ├── RoutePicker           -- 常用路线选择
│           │   └── DateTimePicker        -- 时间选择
│           ├── MobileApproveListView
│           │   ├── ApproveCard           -- 审批卡片
│           │   └── StatusTab             -- 状态筛选 Tab
│           ├── MobileDispatchListView
│           │   └── DispatchCard          -- 调度任务卡片
│           ├── MobileDispatchAssignView
│           │   ├── VehicleSelector       -- 可用车辆选择器
│           │   └── DriverSelector        -- 可用司机选择器
│           ├── MobileTaskListView
│           │   └── TaskCard              -- 任务卡片
│           ├── MobileTripStartView
│           │   └── CameraCapture         -- 拍照组件（里程表）
│           ├── MobileTripEndView
│           │   └── CameraCapture         -- 拍照组件（里程表）
│           ├── MobileExpenseCreateView
│           │   ├── ExpenseTypePicker     -- 费用类型选择
│           │   └── CameraCapture         -- 拍照组件（小票）
│           ├── MobileRepairCreateView
│           │   └── CameraCapture         -- 拍照组件（故障）
│           ├── MobileMonitorView
│           │   └── StatCard              -- 指标卡片
│           ├── MobileVehicleStatusView
│           │   └── StatusGrid            -- 状态色块网格
│           └── MobileNotificationView
│               └── NotificationCard      -- 通知卡片
```

### 移动端 UI 组件库选择

使用 Vant 4 作为移动端 UI 组件库，原因：

- 轻量级，专为移动端设计
- 内置 Tabbar、Card、Uploader（拍照）、Steps 等移动端常用组件
- 与 Vue 3 完全兼容
- 与现有 Element Plus 并存，互不冲突

### 新增/复用后端 API

移动端复用现有全部后端 API，仅针对移动端场景新增以下接口：

| 方法 | 路径 | 说明 | 关联需求 |
|------|------|------|---------|
| POST | `/api/mobile/ocr/odometer` | OCR 识别里程表读数 | REQ-MOB-05 |
| GET | `/api/mobile/dashboard/overview` | 全局看板数据 | REQ-MOB-09 |
| GET | `/api/mobile/vehicle/status-grid` | 车辆状态色块数据 | REQ-MOB-10 |
| GET | `/api/mobile/routes/frequent` | 常用路线列表 | REQ-MOB-02 |

### 路由切换策略

```mermaid
graph TD
    A["用户访问"] --> B{"检测 User-Agent"}
    B -->|移动设备| C["重定向到 /m/login"]
    B -->|PC 设备| D["重定向到 /login"]
    C --> E["移动端登录 /m/login"]
    D --> F["PC 端登录 /login"]
    E --> G["移动端首页 /m/home"]
    F --> H["PC 端仪表盘 /"]
```

路由守卫中检测 `navigator.userAgent`，移动设备自动跳转 `/m/` 路由，PC 设备保持 `/` 路由。同时 `/m/` 路由在 PC 端也可直接访问，方便开发调试。

## 数据模型

### 新增数据表

移动端不引入新的核心数据表，复用现有的 Application、Trip、Expense、Notification 等表结构。

### 费用随手记 - 关联增强

Expense 表现在已有 `vehicle_id` 和 `trip_id` 字段。移动端费用随手记提交时自动关联当前驾驶员正在进行中的 Trip 记录：

```
Expense {
    ...existing fields
    int vehicle_id FK    -- 自动取自当前行程的车辆
    int trip_id FK       -- 自动取自驾驶员进行中行程
    string photo_url     -- 小票照片 URL（利用现有字段）
}
```

## 核心业务流程

### 驾驶员出车归库流程

```mermaid
sequenceDiagram
    participant 调度员
    participant 系统
    participant 驾驶员

    调度员->>系统: 派车（选车辆+选司机）
    系统->>驾驶员: 推送出车任务通知
    驾驶员->>系统: 打开任务详情
    驾驶员->>系统: 点击出车确认
    系统->>系统: 弹出摄像头拍照界面
    驾驶员->>系统: 拍摄仪表盘里程表
    系统->>系统: OCR 识别里程数
    系统->>系统: 记录出车时间和起始里程
    驾驶员->>系统: 过程中随手记费用(可选)
    驾驶员->>系统: 点击归库确认
    系统->>系统: 弹出摄像头拍照界面
    驾驶员->>系统: 拍摄仪表盘里程表
    系统->>系统: OCR 识别里程数
    系统->>系统: 计算行程里程、记录归库时间
    系统->>调度员: 推送归库通知
```

### 审批流程

```mermaid
sequenceDiagram
    participant 申请人
    participant 系统
    participant 审批人

    申请人->>系统: 提交用车申请（3步表单）
    系统->>审批人: 推送待审批通知
    审批人->>系统: 点击通知进入详情
    审批人->>系统: 点击通过或驳回
    alt 通过
        系统->>系统: 检查下一级审批
        系统->>调度员: 推送待调度通知
    else 驳回
        系统->>申请人: 推送驳回通知
    end
```

## 正确性约束

1. 出车时里程数必须大于等于该车辆上次归库时的里程数
2. 归库时里程数必须大于等于该车辆本次出车时的里程数
3. 同一驾驶员同时最多存在一条进行中的行程
4. 同一车辆同时最多被一个进行中的行程占用
5. 费用随手记必须关联到驾驶员当前进行中的行程
6. 移动端和 PC 端共享同一 JWT token 认证体系
7. 移动端 OCR 识别结果异常时允许驾驶员手动修正

## 错误处理

| 场景 | 行为 |
|------|------|
| OCR 识别失败 | 提示手动输入里程数，照片一并保存 |
| 网络断开时提交 | 数据暂存本地，网络恢复后自动提交 |
| 拍照权限被拒 | 提示用户授予相机权限，或切换为手动输入 |
| 无进行中行程时记费用 | 提示当前无进行中行程，费用记入最近一次行程 |
| 退登后重新登录 | 恢复断网暂存数据并自动提交 |

## 测试策略

- **单元测试**：OCR 识别逻辑、里程校验逻辑、角色首页渲染逻辑
- **集成测试**：出车-归库完整流程、申请-审批-调度完整流程
- **移动端适配测试**：主要移动设备尺寸（375px、390px、414px 宽度）视觉验证
- **离线场景测试**：断网状态下提交费用、恢复网络后数据上传

## 技术栈

| 组件 | 版本 |
|------|------|
| Vue | 3.4.x (已有) |
| Vite | 5.x (已有) |
| Vant | 4.x (新增) |
| Pinia | 2.x (已有) |
| Vue Router | 4.x (已有) |
| Axios | 1.x (已有) |
| Node.js + Express | 20.x / 4.x (已有) |
| SQLite | 已有 |

## 附录

### Vant 与 Element Plus 并存方案

Vant 和 Element Plus 互相独立，通过路由前缀隔离：
- `/` 前缀路由加载 Element Plus 组件
- `/m/` 前缀路由加载 Vant 组件

两个 UI 库的样式互不干扰，通过 Vite 的 CSS 模块化和 scoped style 保证隔离。
