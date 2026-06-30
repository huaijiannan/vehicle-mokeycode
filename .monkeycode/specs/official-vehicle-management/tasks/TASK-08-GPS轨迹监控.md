# TASK-08: GPS 轨迹监控实现

**对应需求**: [REQ-07-GPS轨迹监控](../requirements/REQ-07-GPS轨迹监控.md)
**优先级**: P1
**预计工时**: 0.75天

## 子任务

- [ ] 1. 实现 GPS 后端 API
  - `server/routes/track.js`
  - POST `/api/track/upload` — 接收 GPS 数据上报
    - 接收经纬度、速度、时间戳
  - GET `/api/track/live` — 实时获取出车车辆最新位置
  - GET `/api/track/replay/:tripId` — 获取指定行程轨迹点列表
    - 偏离检测：对比申请路线与 GPS 轨迹，超过 2km 阈值生成告警

- [ ] 2. 实现轨迹监控前端页面
  - `frontend/src/views/track/TrackMonitorView.vue`
  - 集成 Leaflet 地图，标注车辆实时位置
  - 车辆选择面板，切换跟踪目标
  - 轨迹回放：播放/暂停/速度控制
  - 异常告警列表与处理

## 产出物

| 类型 | 文件 |
|------|------|
| 轨迹路由 | `server/routes/track.js` |
| 轨迹页面 | `frontend/src/views/track/TrackMonitorView.vue` |
