# TASK-13: 驾驶员信息管理实现

**对应需求**: [REQ-12-驾驶员信息管理](../requirements/REQ-12-驾驶员信息管理.md)
**优先级**: P0（调度依赖）
**预计工时**: 1天

## 子任务

- [ ] 1. 扩展数据库模型
  - 在 `server/db/init.js` 中新增 `drivers` 表、`driver_trainings` 表、`driver_violations` 表、`driver_health_checks` 表
  - seed 数据中预置 3 名驾驶员测试数据（含不同准驾车型和状态）

- [ ] 2. 实现驾驶员后端 API
  - `server/routes/drivers.js`
  - GET `/api/drivers` — 驾驶员列表（筛选：状态/部门/准驾车型/编制类型）
    - 列表中展示三龄信息：驾龄/工龄/年龄
  - POST `/api/drivers` — 新增驾驶员（自动生成工号 DRV2026XX00X）
    - 录入基础档案：姓名、性别、出生日期、电话、政治面貌、编制类型、入职日期、部门
    - 录入驾驶证：号牌、准驾车型、初次领证日期、有效起止日期、发证机关 + 影像
    - 录入从业资格证：号牌、类型、有效起止日期 + 影像
    - 保密岗位标记和保密等级
  - PUT `/api/drivers/:id` — 更新驾驶员信息（含证照更期）
  - GET `/api/drivers/:id` — 驾驶员详情（完整档案 + 三龄两证一检 + 状态）

- [ ] 3. 实现培训记录 API
  - POST `/api/drivers/:id/training` — 录入培训记录
    - 培训日期/类型/时长/内容摘要/考核结果
  - GET `/api/drivers/:id/training` — 培训履历（按时间倒序）
    - 培训逾期检测：最近一次距今 > 6 个月时标记"待培训"

- [ ] 4. 实现违章记录 API
  - POST `/api/drivers/:id/violation` — 录入违章
    - 违章日期/类型/地点/行为描述/处罚结果/是否已处理
  - GET `/api/drivers/:id/violation` — 违章记录列表
    - 12 个月内累计 >= 3 次时自动标记"重点关注"

- [ ] 5. 实现体检记录 API
  - POST `/api/drivers/:id/health-check` — 录入体检
    - 体检日期/机构/结论/报告影像
  - 体检结论为"不合格"或"需复查"且未闭环时，更新驾驶员状态为"暂停出车"
  - 体检逾期检测：距今 > 12 个月时触发提醒

- [ ] 6. 实现驾驶员状态自动管理
  - 综合评估触发条件（体检不合格、违章超标、培训逾期、证照到期、退休预警）
  - 自动更新驾驶员出车状态

- [ ] 7. 实现驾驶员前端页面
  - `frontend/src/views/driver/DriverListView.vue` — 驾驶员列表
    - 筛选：状态/部门/准驾车型
    - 列表展示三龄（驾龄/工龄/年龄）标签
    - 状态标签颜色（空闲=绿、出车中=蓝、暂停=红、重点关注=橙）
  - `frontend/src/views/driver/DriverDetailView.vue` — 驾驶员详情
    - 基础信息 Tab
    - 证照信息 Tab（驾驶证 + 从业资格证 + 影像）
    - 培训履历 Tab（时间轴）
    - 违章记录 Tab（统计卡片 + 列表）
    - 体检记录 Tab

- [ ] 8. 完善调度模块中的驾驶员匹配
  - 在调度 API `GET /api/dispatch/available-drivers` 中增加过滤条件
    - 排除状态非"空闲"的驾驶员
    - 排除准驾车型不匹配的驾驶员
    - 涉密出行时，优先返回匹配保密等级的驾驶员

## 产出物

| 类型 | 文件 |
|------|------|
| 数据库迁移 | `server/db/init.js`（drivers 表、training 表、violation 表、health_check 表） |
| 驾驶员路由 | `server/routes/drivers.js` |
| 驾驶员列表页 | `frontend/src/views/driver/DriverListView.vue` |
| 驾驶员详情页 | `frontend/src/views/driver/DriverDetailView.vue` |
| API 封装 | `frontend/src/api/driver.js` |
