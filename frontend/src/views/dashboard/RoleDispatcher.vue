<template>
  <div>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="待调度" :value="pendingCount">
            <template #suffix><span style="font-size:14px;color:#fa8c16">条</span></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="进行中" :value="activeCount">
            <template #suffix><span style="font-size:14px;color:#1a73e8">条</span></template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <el-statistic title="今日归库" :value="completedCount">
            <template #suffix><span style="font-size:14px;color:#52c41a">条</span></template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>
    <h3 style="margin-bottom:12px;color:#303133">待调度任务</h3>
    <el-card v-for="item in pendingList" :key="item.id" style="margin-bottom:10px" shadow="hover">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:15px;font-weight:600">{{ item.purpose }}</span>
            <el-tag v-if="item.urgent" type="danger" size="small">加急</el-tag>
            <el-tag v-else type="info" size="small">普通</el-tag>
          </div>
          <div style="font-size:13px;color:#999">
            <span>{{ item.applicant_name || '申请人' }}</span>
            <span style="margin-left:12px">{{ item.depart_time?.slice(0,16) || '-' }}</span>
          </div>
          <div style="font-size:12px;color:#999;margin-top:2px">
            {{ item.origin || '-' }} → {{ item.destination || '-' }}
          </div>
        </div>
        <el-button type="primary" size="small" @click="$router.push(`/dispatch/list?id=${item.id}`)">派车</el-button>
      </div>
    </el-card>
    <el-empty v-if="!pendingList.length" description="暂无待调度任务" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '@/api/request'

const dispatchList = ref([])

const pendingList = computed(() => dispatchList.value.filter(d => d.status === 'pending' || d.status === 'approved'))
const pendingCount = computed(() => pendingList.value.length)
const activeCount = computed(() => dispatchList.value.filter(d => d.status === 'active').length)
const completedCount = computed(() => dispatchList.value.filter(d => d.status === 'completed').length)

onMounted(async () => {
  try {
    const res = await request.get('/dispatch/pending')
    dispatchList.value = Array.isArray(res) ? res : (res.data || [])

    const trips = await request.get('/trips')
    const tripData = Array.isArray(trips) ? trips : (trips?.data || [])
    activeCount._raw = tripData.filter(t => t.status === 'active').length
    completedCount._raw = tripData.filter(t => t.status === 'completed').length
  } catch (e) { /* ignore */ }
})
</script>
