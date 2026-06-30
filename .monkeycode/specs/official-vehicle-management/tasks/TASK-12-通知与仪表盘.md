# TASK-12: 通知消息与仪表盘

**对应需求**: [REQ-11-通知与消息](../requirements/REQ-11-通知与消息.md)、[REQ-02-车辆年检与保险管理](../requirements/REQ-02-车辆年检与保险管理.md)
**优先级**: P1
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现通知后端 API
  - `server/routes/notifications.js`
  - GET `/api/notifications` — 消息列表（按用户+未读优先排序）
  - PUT `/api/notifications/:id/read` — 标记已读
  - 通知推送工具函数 `sendNotification(userId, title, content, type, link)`
    - 在审批流转、派车、驳回、到期提醒等事件中调用

- [ ] 2. 实现通知前端组件
  - `frontend/src/components/HeaderBar.vue` — 顶部栏，含消息铃铛图标 + 未读角标
  - `frontend/src/components/NotificationPanel.vue` — 消息弹窗列表（点击跳转业务页）

- [ ] 3. 实现仪表盘页面
  - `frontend/src/views/DashboardView.vue`
  - 统计卡片：当月用车次数/总里程/总费用/待审批数
  - 年检保险到期提醒
  - 近期用车趋势图

## 产出物

| 类型 | 文件 |
|------|------|
| 通知路由 | `server/routes/notifications.js` |
| 顶部栏 | `frontend/src/components/HeaderBar.vue` |
| 通知面板 | `frontend/src/components/NotificationPanel.vue` |
| 仪表盘 | `frontend/src/views/DashboardView.vue` |
