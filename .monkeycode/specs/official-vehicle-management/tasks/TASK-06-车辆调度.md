# TASK-06: 车辆调度实现

**对应需求**: [REQ-05-车辆调度](../requirements/REQ-05-车辆调度.md)
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现调度后端 API
  - `server/routes/dispatch.js`
  - GET `/api/dispatch/pending` — 待调度申请列表
  - GET `/api/dispatch/available-vehicles` — 指定时段可用车辆
    - 排除：已预约（dispatch 已生成但未出车）、已出车、维修中
  - GET `/api/dispatch/available-drivers` — 指定时段空闲司机
    - 查找角色为"司机"且无冲突任务的用户
  - POST `/api/dispatch/assign` — 执行派车
    - 创建 dispatch 记录，关联 application/vehicle/driver
    - 更新车辆状态为"已预约"
    - 推送通知给司机

- [ ] 2. 实现调度前端页面
  - `frontend/src/views/dispatch/DispatchView.vue` — 待调度列表 + 车辆选择器 + 司机选择器
  - 无可用资源时弹窗提示

## 产出物

| 类型 | 文件 |
|------|------|
| 调度路由 | `server/routes/dispatch.js` |
| 调度页面 | `frontend/src/views/dispatch/DispatchView.vue` |
