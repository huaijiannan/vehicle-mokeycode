# TASK-02: 车辆档案管理实现

**对应需求**: [REQ-01-车辆档案管理](../requirements/REQ-01-车辆档案管理.md)
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现车辆后端 API
  - `server/routes/vehicles.js`
  - GET `/api/vehicles` — 列表查询（筛选：部门/类型/状态）
  - POST `/api/vehicles` — 新增车辆（校验必填字段）
  - PUT `/api/vehicles/:id` — 更新车辆、上传证件（multer）
  - DELETE `/api/vehicles/:id` — 删除车辆

- [ ] 2. 实现车辆档案管理前端页面
  - `frontend/src/views/vehicle/VehicleListView.vue` — 搜索筛选 + 数据表格 + 新增/编辑弹窗
  - `frontend/src/views/vehicle/VehicleDetailView.vue` — 车辆详情 + 证件展示

- [ ] 3. 实现车辆 API 封装
  - `frontend/src/api/vehicle.js` — Axios 请求封装

## 产出物

| 类型 | 文件 |
|------|------|
| 车辆路由 | `server/routes/vehicles.js` |
| 车辆列表页 | `frontend/src/views/vehicle/VehicleListView.vue` |
| 车辆详情页 | `frontend/src/views/vehicle/VehicleDetailView.vue` |
| API 封装 | `frontend/src/api/vehicle.js` |
