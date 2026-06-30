# TASK-01: 认证与权限系统

**对应需求**: REQ-10（权限与角色管理）
**优先级**: P0
**预计工时**: 0.5天

## 子任务

- [ ] 1. 实现 JWT 认证中间件
  - `server/middleware/auth.js` — token 校验，401 拦截
  - POST `/api/auth/login` — bcrypt 校验密码，签发 JWT（8h 有效期）
  - GET `/api/auth/me` — 返回当前用户信息和角色权限

- [ ] 2. 实现角色权限中间件
  - `server/middleware/rbac.js` — 角色权限映射表
  - 八种角色：普通员工、部门负责人、分管领导、车队调度员、司机、纪检监察、财务、管理员
  - 路由级权限拦截，越权返回 403

- [ ] 3. 实现登录页面
  - `frontend/src/views/LoginView.vue` — 登录表单
  - Pinia store `useAuthStore` — token 持久化与路由守卫

## 产出物

| 类型 | 文件 |
|------|------|
| 认证中间件 | `server/middleware/auth.js` |
| 权限中间件 | `server/middleware/rbac.js` |
| 认证路由 | `server/routes/auth.js` |
| 登录页 | `frontend/src/views/LoginView.vue` |
| 认证 Store | `frontend/src/stores/auth.js` |
