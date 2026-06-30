# TASK-00: 项目初始化与基础架构

**对应需求**: 全部需求的基础支撑
**优先级**: P0
**预计工时**: 1天

## 子任务

- [ ] 1. 使用 Vite + Vue 3 创建前端项目
  - 安装 Element Plus、Pinia、Vue Router、Axios、ECharts、Leaflet
  - 创建目录结构：`src/views/`、`src/components/`、`src/stores/`、`src/api/`、`src/router/`
  - 配置 Element Plus 全局引入

- [ ] 2. 创建 Express 后端项目
  - 安装 better-sqlite3、jsonwebtoken、bcryptjs、cors、multer
  - 创建目录结构：`server/routes/`、`server/middleware/`、`server/db/`
  - 创建 `server/index.js` 主入口

- [ ] 3. 配置前端代理与预览
  - Vite config 配置 `/api` 代理到 `http://localhost:3001`
  - 配置 `allowedHosts: ['.monkeycode-ai.online']`
  - 根目录创建 `start.sh` 启动脚本

- [ ] 4. 创建 SQLite 数据库初始化脚本
  - 建表：users、departments、vehicles、applications、approvals、dispatches、trips、expenses、gps_tracks、notifications
  - 编写 seed 数据：部门（3级）、管理员账号、测试车辆3台

- [ ] 5. 实现数据库工具模块
  - 封装 db.js（连接、查询参数化、事务支持）

## 产出物

| 类型 | 文件 |
|------|------|
| 前端入口 | `frontend/src/main.js`, `frontend/src/App.vue` |
| 路由配置 | `frontend/src/router/index.js` |
| 布局组件 | `frontend/src/components/Layout.vue` |
| 后端入口 | `server/index.js` |
| 数据库 | `server/db/init.js`, `server/db/db.js`, `server/db/seed.js` |
| 启动脚本 | `start.sh` |
