# TASK-04: 用车申请实现

**对应需求**: [REQ-03-用车申请](../requirements/REQ-03-用车申请.md)
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现申请后端 API
  - `server/routes/applications.js`
  - POST `/api/applications` — 提交申请
    - 校验：出发时间 >= 当前时间，返回时间 > 出发时间
    - 自动创建审批流（基于申请人部门向上查找审批人）
    - 推送待办通知给第一级审批人
  - GET `/api/applications` — 本人申请列表
  - GET `/api/applications/:id` — 申请详情（含审批历史）

- [ ] 2. 实现申请前端页面
  - `frontend/src/views/apply/ApplyCreateView.vue` — 申请表单（事由/出发地/目的地/时间/人数/是否需要司机）
  - `frontend/src/views/apply/ApplyListView.vue` — 申请记录列表（状态标签：待审批/已通过/已驳回/已调度/已出车/已完成）

- [ ] 3. 实现申请 API 封装
  - `frontend/src/api/application.js`

## 产出物

| 类型 | 文件 |
|------|------|
| 申请路由 | `server/routes/applications.js` |
| 申请表单页 | `frontend/src/views/apply/ApplyCreateView.vue` |
| 申请列表页 | `frontend/src/views/apply/ApplyListView.vue` |
| API 封装 | `frontend/src/api/application.js` |
