# TASK-11: 用户与组织管理前端实现

**对应需求**: [REQ-10-权限与角色管理](../requirements/REQ-10-权限与角色管理.md)
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现用户管理后端 API
  - `server/routes/users.js`
  - GET `/api/users` — 用户列表（筛选：部门/角色）
  - POST `/api/users` — 新增用户（bcrypt hash 密码）
  - PUT `/api/users/:id` — 更新用户（角色变更/部门调整）
  - GET `/api/departments` — 组织架构树

- [ ] 2. 实现用户管理前端页面
  - `frontend/src/views/system/UserManageView.vue`
  - 左侧：部门树形结构（Element Plus Tree）
  - 右侧：用户表格（点击部门筛选用户）
  - 新增/编辑用户弹窗（角色下拉选择）

## 产出物

| 类型 | 文件 |
|------|------|
| 用户路由 | `server/routes/users.js` |
| 用户管理页 | `frontend/src/views/system/UserManageView.vue` |
