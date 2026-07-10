<template>
  <div>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="今日申请" :value="stats.applications" /></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="在途车辆" :value="stats.activeTrips">
          <template #suffix><span style="font-size:14px;color:#fa8c16">辆</span></template>
        </el-statistic></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="今日完成" :value="stats.completed">
          <template #suffix><span style="font-size:14px;color:#52c41a">次</span></template>
        </el-statistic></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><el-statistic title="空闲车辆" :value="stats.idleVehicles">
          <template #suffix><span style="font-size:14px;color:#1a73e8">辆</span></template>
        </el-statistic></el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span style="font-weight:600">车辆状态分布</span></template>
          <div v-if="vehicleStats.total" style="margin-bottom:12px">
            <div style="display:flex;height:32px;border-radius:6px;overflow:hidden">
              <div v-if="vehicleStats.idle" :style="{width:vehicleStats.idle/vehicleStats.total*100+'%',background:'#52c41a'}" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600">空闲 {{vehicleStats.idle}}</div>
              <div v-if="vehicleStats.active" :style="{width:vehicleStats.active/vehicleStats.total*100+'%',background:'#1a73e8'}" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600">在途{{vehicleStats.active}}</div>
              <div v-if="vehicleStats.maintenance" :style="{width:vehicleStats.maintenance/vehicleStats.total*100+'%',background:'#fa8c16'}" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600">维{{vehicleStats.maintenance}}</div>
            </div>
          </div>
          <div style="display:flex;gap:24px;font-size:13px;color:#666">
            <span>总计 {{ vehicleStats.total }} 辆</span>
            <span style="color:#52c41a">空闲 {{ vehicleStats.idle }}</span>
            <span style="color:#1a73e8">在途 {{ vehicleStats.active }}</span>
            <span style="color:#fa8c16">维修 {{ vehicleStats.maintenance }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header><span style="font-weight:600">异常提醒</span></template>
          <div v-if="alerts.length">
            <div v-for="(alert, idx) in alerts" :key="idx" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f5f5f5">
              <div :style="{width:'8px',height:'8px',borderRadius:'50%',background:alert.color,flexShrink:0}"></div>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:600;color:#333">{{ alert.title }}</div>
                <div style="font-size:11px;color:#999;margin-top:2px">{{ alert.desc }}</div>
              </div>
              <span style="font-size:11px;color:#999">{{ alert.time }}</span>
            </div>
          </div>
          <el-empty v-else description="暂无异常" :image-size="40" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import request from '@/api/request'

const stats = reactive({ applications: 0, activeTrips: 0, completed: 0, idleVehicles: 0 })
const vehicleStats = reactive({ total: 0, idle: 0, active: 0, maintenance: 0 })
const alerts = reactive([])

onMounted(async () => {
  try {
    const [vehicles, trips, apps] = await Promise.all([
      request.get('/vehicles').catch(() => ({ data: [] })),
      request.get('/trips').catch(() => ({ data: [] })),
      request.get('/applications').catch(() => ({ data: [] }))
    ])

    const vData = Array.isArray(vehicles) ? vehicles : (vehicles.data || [])
    const tData = Array.isArray(trips) ? trips : (trips.data || [])
    const aData = Array.isArray(apps) ? apps : (apps.data || [])

    vehicleStats.total = vData.length
    vehicleStats.idle = vData.filter(v => v.status === 'idle' || v.status === '空闲').length
    vehicleStats.active = vData.filter(v => v.status === 'active' || v.status === '占用').length
    vehicleStats.maintenance = vData.filter(v => v.status === 'maintenance' || v.status === '维修').length

    stats.activeTrips = tData.filter(t => t.status === 'active').length
    stats.completed = tData.filter(t => t.status === 'completed').length
    stats.applications = aData.length
    stats.idleVehicles = vehicleStats.idle

    const now = new Date()
    if (stats.activeTrips > 0) {
      alerts.push({ color: '#f5222d', title: '超时未归库', desc: '有车辆超过预计时间未归库，请关注', time: now.toTimeString().slice(0,5) })
    }
    const dueVehicles = vData.filter(v => v.inspection_due || v.insurance_due)
    dueVehicles.slice(0, 2).forEach(v => {
      if (v.inspection_due) alerts.push({ color: '#fa8c16', title: '年检即将到期', desc: `${v.plate_number} 年检到期 ${v.inspection_due}`, time: '今日' })
    })
  } catch (e) { /* ignore */ }
})
</script>
