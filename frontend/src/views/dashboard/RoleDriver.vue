<template>
  <div>
    <h3 style="margin-bottom:12px;color:#303133">进行中</h3>
    <el-card v-if="activeTrip" style="margin-bottom:16px;background:linear-gradient(135deg, #1a73e8, #4080ff);color:#fff;border:none" shadow="hover">
      <div style="font-size:12px;opacity:.8">出车时间</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">{{ activeTrip.start_time?.slice(0,16) || '-' }}</div>
      <div style="font-size:16px;font-weight:700;margin-bottom:4px">{{ activeTrip.origin || '-' }} → {{ activeTrip.destination || '-' }}</div>
      <div style="font-size:13px;opacity:.9">{{ activeTrip.plate_number || '-' }} · {{ activeTrip.vehicle_model || '-' }} · {{ activeTrip.passenger_count || 0 }}人</div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <el-button style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)" size="small" @click="$router.push('/expense/list')">费用记入</el-button>
        <el-button style="background:#fff;color:#1a73e8;border:none" size="small" @click="handleEndTrip">确认归库</el-button>
      </div>
    </el-card>
    <el-empty v-if="!activeTrip" description="暂无进行中任务" />

    <h3 style="margin-bottom:12px;color:#303133">待执行 ({{ pendingTrips.length }})</h3>
    <el-card v-for="item in pendingTrips" :key="item.id" style="margin-bottom:10px" shadow="hover">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:15px;font-weight:600">{{ item.purpose || '出车任务' }}</span>
            <el-tag size="small" type="info">{{ item.depart_time ? formatDate(item.depart_time) : '-' }}</el-tag>
          </div>
          <div style="font-size:13px;color:#999">
            <span>{{ item.plate_number || '-' }}</span>
            <span style="margin-left:12px">{{ item.origin || '-' }} → {{ item.destination || '-' }}</span>
          </div>
          <div style="font-size:11px;color:#bbb;margin-top:2px">调度员：{{ item.dispatcher_name || '-' }}</div>
        </div>
        <el-button type="primary" size="small" @click="handleStartTrip(item)">确认出车</el-button>
      </div>
    </el-card>
    <el-empty v-if="!pendingTrips.length && !activeTrip" description="暂无待执行任务" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const trips = ref([])

const activeTrip = computed(() => trips.value.find(t => t.status === 'active'))
const pendingTrips = computed(() => trips.value.filter(t => t.status === 'pending' || t.status === 'assigned'))

function formatDate(d) {
  if (!d) return '-'
  const date = new Date(d)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return '今天'
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1)
  if (date.toDateString() === tomorrow.toDateString()) return '明天'
  return d.slice(0,10)
}

async function handleStartTrip(item) {
  try {
    await request.post(`/trips/start`, { trip_id: item.id })
    ElMessage.success('出车确认成功')
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

async function handleEndTrip() {
  try {
    await request.post(`/trips/end`, { trip_id: activeTrip.value.id })
    ElMessage.success('归库确认成功')
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

async function loadData() {
  try {
    const res = await request.get('/trips')
    trips.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) { /* ignore */ }
}

onMounted(loadData)
</script>
