<template>
  <div>
    <h2>系统仪表盘</h2>
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="6"><el-card><el-statistic title="车辆总数" :value="stats.vehicles" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="在途车辆" :value="stats.trips" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="待审批申请" :value="stats.pending" /></el-card></el-col>
      <el-col :span="6"><el-card><el-statistic title="今日出车次数" :value="stats.todayTrips" /></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import request from '@/api/request'

const stats = reactive({ vehicles: 0, trips: 0, pending: 0, todayTrips: 0 })

onMounted(async () => {
  try {
    const v = await request.get('/vehicles')
    stats.vehicles = Array.isArray(v) ? v.length : (v.data?.length || 0)
  } catch (e) { /* ignore */ }
})
</script>
