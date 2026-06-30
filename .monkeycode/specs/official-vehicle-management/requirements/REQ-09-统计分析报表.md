# REQ-09: 统计分析报表 (V1)

**优先级**: P1
**版本**: V1（第一版基础功能）

## 描述

提供基础的数据统计看板和报表，帮助管理层了解车队运营概况。

## 需求条目

### 第一节：系统仪表盘

REQ-09-1-1: The system shall 在首页仪表盘展示系统核心指标：车辆总数、在途车辆数、待审批申请数、今日出车次数。

REQ-09-1-2: The system shall 在仪表盘展示到期提醒区域：年检即将到期车辆、保险即将到期车辆。

REQ-09-1-3: The system shall 在仪表盘展示部门车辆编制执行情况（各部门实有数/编制数）。

### 第二节：基础统计

REQ-09-2-1: The system shall 支持按日期范围统计车辆使用次数。

REQ-09-2-2: The system shall 支持按车辆统计累计行驶里程。

REQ-09-2-3: The system shall 支持按部门统计用车申请量和审批通过率。

### 第三节：费用统计

REQ-09-3-1: The system shall 支持按费用类型统计月度费用汇总。

REQ-09-3-2: The system shall 支持按车辆统计累计费用。

REQ-09-3-3: The system shall 以柱状图或折线图展示月度费用趋势。

### 第四节：数据导出

REQ-09-4-1: The system shall 支持将统计数据导出为 Excel 文件。

## 关联接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/reports/summary` | 仪表盘汇总数据 |
| GET | `/api/reports/usage` | 车辆使用统计 |
| GET | `/api/reports/expense-stats` | 费用统计 |
| GET | `/api/reports/export` | 导出报表 |

## V2 预留

- 日报体系（车队运营日报、纪检风险日报）
- 月报体系（运行分析月报、三公经费公示报告）
- 自定义报表设计器
- 大屏驾驶舱（实时数据可视化大屏）
- 智能预警规则引擎
- 趋势预测分析
- 同比/环比分析
