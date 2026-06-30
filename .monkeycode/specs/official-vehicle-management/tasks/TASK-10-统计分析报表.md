# TASK-10: 统计分析报表实现

**对应需求**: [REQ-09-统计分析报表](../requirements/REQ-09-统计分析报表.md)
**优先级**: P1
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现报表后端 API
  - `server/routes/reports.js`
  - GET `/api/reports/summary` — 仪表盘汇总（当月用车次数/总里程/总费用/待审批数/出车中数）
  - GET `/api/reports/department-ranking` — 部门排名（按次数/里程/费用排序）
  - GET `/api/reports/vehicle-usage` — 车辆使用率（出车天数/工作日天数）
  - GET `/api/reports/export` — 导出 Excel

- [ ] 2. 实现报表前端页面
  - `frontend/src/views/report/ReportView.vue`
  - 统计卡片看板
  - ECharts 柱状图（部门排名）、饼图（车辆使用率分布）
  - 导出按钮

## 产出物

| 类型 | 文件 |
|------|------|
| 报表路由 | `server/routes/reports.js` |
| 报表页面 | `frontend/src/views/report/ReportView.vue` |
