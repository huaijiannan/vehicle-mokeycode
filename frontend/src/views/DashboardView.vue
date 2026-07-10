<template>
  <div>
    <RoleEmployee v-if="role === 'employee'" />
    <RoleApprover v-else-if="role === 'dept_head' || role === 'leader'" />
    <RoleDispatcher v-else-if="role === 'dispatcher'" />
    <RoleDriver v-else-if="role === 'driver'" />
    <RoleAdmin v-else-if="role === 'admin'" />
    <div v-else>
      <h2>系统仪表盘</h2>
      <el-row :gutter="20" style="margin-top:20px">
        <el-col :span="6"><el-card><el-statistic title="车辆总数" :value="stats.vehicles" /></el-card></el-col>
        <el-col :span="6"><el-card><el-statistic title="在途车辆" :value="stats.trips" /></el-card></el-col>
        <el-col :span="6"><el-card><el-statistic title="待审批申请" :value="stats.pending" /></el-card></el-col>
        <el-col :span="6"><el-card><el-statistic title="今日出车次数" :value="stats.todayTrips" /></el-card></el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import request from '@/api/request'
import RoleEmployee from './dashboard/RoleEmployee.vue'
import RoleApprover from './dashboard/RoleApprover.vue'
import RoleDispatcher from './dashboard/RoleDispatcher.vue'
import RoleDriver from './dashboard/RoleDriver.vue'
import RoleAdmin from './dashboard/RoleAdmin.vue'

const authStore = useAuthStore()
const role = computed(() => authStore.role)

const stats = reactive({ vehicles: 0, trips: 0, pending: 0, todayTrips: 0 })

onMounted(async () => {
  try {
    const v = await request.get('/vehicles')
    stats.vehicles = Array.isArray(v) ? v.length : (v.data?.length || 0)
  } catch (e) { /* ignore */ }
})
</script>
