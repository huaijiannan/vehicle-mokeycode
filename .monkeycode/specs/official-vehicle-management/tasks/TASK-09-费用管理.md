# TASK-09: 费用管理实现

**对应需求**: [REQ-08-费用管理](../requirements/REQ-08-费用管理.md)
**优先级**: P0
**预计工时**: 2天

## 子任务

- [ ] 1. 扩展数据库模型
  - 在 `server/db/init.js` 中新增表：
    - `budgets` — 年度预算（vehicle_id, year, fuel_budget, toll_budget, parking_budget, repair_budget, insurance_budget, inspection_budget, tax_budget, other_budget）
    - `fuel_cards` — 加油卡（vehicle_id, card_no, issuer, card_type, status）
    - `etc_devices` — ETC设备（vehicle_id, etc_card_no, issuer, bind_date）
    - `service_providers` — 定点服务商（name, address, contact, type, contract_start, contract_end）
    - `repair_applications` — 维修申请（vehicle_id, description, estimated_cost, provider_id, status, 审批字段）
    - `reimbursements` — 报销单（vehicle_id, period_start, period_end, total_amount, status, 审核字段）
    - `reimbursement_items` — 报销单明细（reimbursement_id, expense_id）
    - `expense_anomalies` — 费用异常告警（expense_id, anomaly_type, severity, status, handler_id）
  - 现有 `expenses` 表增加字段：`receipt_url`（凭证照片）、`fuel_card_id`、`etc_device_id`、`provider_id`、`is_anomaly`、`audit_status`

- [ ] 2. 实现预算管理 API
  - `server/routes/budget.js`
  - GET `/api/budget` — 查询某年各车辆预算
  - POST `/api/budget` — 编制年度预算（校验不超过上年决算105%）
  - GET `/api/budget/execution` — 预算执行进度（实际支出/预算×100%，进度条数据）
  - 月度费用超出月度均值 120% 时自动生成预警
  - Q3 末执行率超 85% 时生成年度超支预警

- [ ] 3. 实现加油卡与 ETC 管理 API
  - `server/routes/fuel-card.js`
  - 加油卡绑定/解绑（一车一卡唯一性校验）
  - 加油记录录入（支持手动录入 + Excel 批量导入）
  - 金额自动验算（加油量×单价 vs 金额，偏差>5%提示）
  - 非油品消费自动识别和告警推送
  - `server/routes/etc.js`
  - ETC 绑定/解绑（一车一卡约束）
  - ETC 通行记录批量导入 + 与 GPS 轨迹自动比对
  - 通行记录时间/路线偏离检测

- [ ] 4. 实现油耗考核逻辑
  - 月度自动计算每辆车实际百公里油耗
  - 实际油耗 vs 标定油耗对比（超出120%生成告警）
  - 油耗对比报表数据接口

- [ ] 5. 实现维修保养全流程 API
  - `server/routes/repair.js`
  - 维修事前申请（故障描述、保养类型、预估费用、选定定点维修厂）
  - 维修审批流转（按费用金额自动确定审批层级：≤2000/2000-10000/>10000）
  - 维修结算（实际费用、维修项目明细、配件更换清单、发票+结算单影像）
  - 三单匹配校验（审批单 + 结算单 + 发票，金额偏差>15%警告）
  - 维修履历查询
  - 保养周期自动提醒（按里程/时间双条件）
  - 同车型维修费用横向对比接口

- [ ] 6. 实现报销与审核流程 API
  - `server/routes/reimbursement.js`
  - 按月生成单车费用报销单（汇总当月全部已录入费用）
  - 报销单提交 → 车队负责人审核 → 财务审核 → 财务负责人审批
  - 财务审核时自动标注风险项（凭证缺失/超标/超预算/非定点供应商）
  - 审核退回机制（必须填写退回理由）
  - 审核通过后自动生成入账凭证号

- [ ] 7. 实现费用异常自动检测
  - `server/services/anomaly-detector.js` — 定时扫描模块
  - 8 类异常检测规则：节假日加油、深夜加油、单日多次加油、短间隔大量加油、费用与行程不匹配、闲置期费用、环比飙升、非定点消费
  - 检测到异常后自动写入 `expense_anomalies` 表并推送通知

- [ ] 8. 实现费用查询统计与审计追溯 API
  - 多维费用查询（车辆/部门/类型/时间/入账状态/凭证完整性，任意组合）
  - 6 类标准报表（单车月度明细、部门年度汇总、类型结构分析、月度趋势、预算执行进度、同比环比）
  - 一键审计追溯：按费用记录返回完整证据链（出车记录→GPS轨迹→原始凭证→审核流转）
  - 合规性自查报告生成（按审计格式）

- [ ] 9. 实现费用管理前端页面
  - `frontend/src/views/expense/BudgetView.vue` — 预算编制与执行看板
  - `frontend/src/views/expense/ExpenseListView.vue` — 费用列表 + 多维筛选
  - `frontend/src/views/expense/ExpenseDetailView.vue` — 费用详情（含完整审计证据链）
  - `frontend/src/views/expense/RepairApplyView.vue` — 维修申请与审批
  - `frontend/src/views/expense/ReimbursementView.vue` — 报销单管理与审核
  - `frontend/src/views/expense/AnomalyListView.vue` — 异常告警列表与处理
  - `frontend/src/views/expense/ReportView.vue` — 费用统计报表（各类图表 + 导出）

## 产出物

| 类型 | 文件 |
|------|------|
| 预算路由 | `server/routes/budget.js` |
| 加油卡路由 | `server/routes/fuel-card.js` |
| ETC路由 | `server/routes/etc.js` |
| 维修路由 | `server/routes/repair.js` |
| 报销路由 | `server/routes/reimbursement.js` |
| 异常检测服务 | `server/services/anomaly-detector.js` |
| 预算页 | `frontend/src/views/expense/BudgetView.vue` |
| 费用列表页 | `frontend/src/views/expense/ExpenseListView.vue` |
| 费用详情页 | `frontend/src/views/expense/ExpenseDetailView.vue` |
| 维修申请页 | `frontend/src/views/expense/RepairApplyView.vue` |
| 报销页 | `frontend/src/views/expense/ReimbursementView.vue` |
| 异常告警页 | `frontend/src/views/expense/AnomalyListView.vue` |
| 统计报表页 | `frontend/src/views/expense/ReportView.vue` |
| API 封装 | `frontend/src/api/expense.js` |
