# TASK-05: 用车审批实现

**对应需求**: [REQ-04-用车审批](../requirements/REQ-04-用车审批.md)
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现审批后端 API
  - `server/routes/approvals.js`
  - GET `/api/approvals/pending` — 获取当前用户待审批列表
  - POST `/api/approvals/:id/approve` — 审批通过
    - 判断是否存在下一级审批，有则推送通知给下一级
    - 无则流转至调度员待办
  - POST `/api/approvals/:id/reject` — 驳回申请（必填理由）
    - 推送驳回通知给申请人

- [ ] 2. 实现审批前端页面
  - `frontend/src/views/approve/ApproveListView.vue` — 待审批列表
  - 操作区：查看详情弹窗 + 通过/驳回按钮
  - 驳回需填写理由（必填校验）

## 产出物

| 类型 | 文件 |
|------|------|
| 审批路由 | `server/routes/approvals.js` |
| 审批页面 | `frontend/src/views/approve/ApproveListView.vue` |
