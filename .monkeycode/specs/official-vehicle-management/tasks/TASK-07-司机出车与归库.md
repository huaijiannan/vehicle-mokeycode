# TASK-07: 司机出车与归库实现

**对应需求**: [REQ-06-司机出车与归库](../requirements/REQ-06-司机出车与归库.md)
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现行程后端 API
  - `server/routes/trips.js`
  - GET `/api/trips` — 行程列表（司机看自己的，管理员看全部）
  - POST `/api/trips/start` — 开始出车
    - 创建 trip 记录，记录 start_time、start_odometer
    - 更新车辆状态为"已出车"
  - POST `/api/trips/end` — 结束行程
    - 记录 end_time、end_odometer
    - 自动计算 total_mileage = end_odometer - start_odometer
    - 更新车辆状态为"可用"
    - 支持同步录入费用（油费/过路费/停车费）

- [ ] 2. 实现行程前端页面
  - `frontend/src/views/trip/TripListView.vue` — 任务列表
  - 操作按钮：开始出车/结束行程（根据状态动态显示）
  - 归库时弹出费用录入表单

## 产出物

| 类型 | 文件 |
|------|------|
| 行程路由 | `server/routes/trips.js` |
| 行程页面 | `frontend/src/views/trip/TripListView.vue` |
