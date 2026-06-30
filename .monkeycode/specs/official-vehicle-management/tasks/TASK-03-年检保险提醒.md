# TASK-03: 年检与保险到期提醒

**对应需求**: [REQ-02-车辆年检与保险管理](../requirements/REQ-02-车辆年检与保险管理.md)
**优先级**: P1
**预计工时**: 0.25天

## 子任务

- [ ] 1. 在车辆 API 中增加到期日字段
  - 录入/更新 `inspection_due`、`insurance_due`
  - 证件上传功能

- [ ] 2. 实现仪表盘到期提醒组件
  - `frontend/src/components/Dashboard/RemindAlert.vue`
  - 查询距离到期日不足30天的车辆
  - 红/黄两级预警（15天/30天）

## 产出物

| 类型 | 文件 |
|------|------|
| 提醒组件 | `frontend/src/components/Dashboard/RemindAlert.vue` |
