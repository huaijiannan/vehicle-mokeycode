<template>
  <div>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="24">
        <el-button type="primary" size="large" style="width:100%;height:60px;font-size:18px;font-weight:bold" @click="$router.push('/apply/create')">
          + 申请用车
        </el-button>
      </el-col>
    </el-row>
    <h3 style="margin-bottom:12px;color:#303133">我的申请</h3>
    <el-card v-for="item in applications" :key="item.id" style="margin-bottom:10px" shadow="hover">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:15px;font-weight:600">{{ item.purpose }}</span>
        <el-tag :type="statusType(item.status)" size="small">{{ statusLabel(item.status) }}</el-tag>
      </div>
      <div style="margin-top:6px;font-size:13px;color:#999">
        <span>{{ item.depart_time?.slice(0,16) }}</span>
        <span style="margin-left:12px">{{ item.passenger_count }}人</span>
      </div>
      <div style="margin-top:4px;font-size:12px;color:#999">
        {{ item.origin }} → {{ item.destination }}
      </div>
    </el-card>
    <el-empty v-if="!applications.length" description="暂无申请记录" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const applications = ref([])

const statusType = (s) => {
  const map = { pending: 'warning', approved: 'success', rejected: 'danger', dispatched: '', completed: 'info' }
  return map[s] || 'info'
}
const statusLabel = (s) => {
  const map = { pending: '审批中', approved: '已通过', rejected: '已驳回', dispatched: '已派车', completed: '已完成' }
  return map[s] || s
}

onMounted(async () => {
  try {
    const res = await request.get('/applications')
    applications.value = Array.isArray(res) ? res.slice(0, 10) : (res.data || []).slice(0, 10)
  } catch (e) { /* ignore */ }
})
</script>
