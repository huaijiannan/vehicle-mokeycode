<template>
  <div>
    <el-row :gutter="16" style="margin-bottom:20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <el-statistic title="待审批" :value="pendingCount">
            <template #suffix>
              <span style="font-size:14px;color:#fa8c16">条</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <el-statistic title="今日已批" :value="approvedToday">
            <template #suffix>
              <span style="font-size:14px;color:#52c41a">条</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>
    <h3 style="margin-bottom:12px;color:#303133">待审批</h3>
    <el-card v-for="item in pendingList" :key="item.id" style="margin-bottom:10px" shadow="hover">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:15px;font-weight:600">{{ item.purpose }}</span>
            <el-tag v-if="item.urgent" type="danger" size="small">加急</el-tag>
          </div>
          <div style="font-size:13px;color:#999">
            <span>{{ item.applicant_name || '申请人' }}</span>
            <span style="margin-left:12px">{{ item.depart_time?.slice(0,16) || '-' }}</span>
          </div>
          <div style="font-size:12px;color:#999;margin-top:2px">
            {{ item.origin || '-' }} → {{ item.destination || '-' }} · {{ item.passenger_count || 0 }}人
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-left:16px;flex-shrink:0">
          <el-button size="small" @click="handleReject(item)">驳回</el-button>
          <el-button type="primary" size="small" @click="handleApprove(item)">通过</el-button>
        </div>
      </div>
    </el-card>
    <el-empty v-if="!pendingList.length" description="暂无待审批申请" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const approvals = ref([])

const pendingList = computed(() => approvals.value.filter(a => a.status === 'pending'))
const pendingCount = computed(() => pendingList.value.length)
const approvedToday = computed(() => approvals.value.filter(a => a.status === 'approved').length)

async function handleApprove(item) {
  try {
    await request.post(`/approvals/${item.id}/approve`, { comment: '同意' })
    ElMessage.success('已通过')
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

async function handleReject(item) {
  try {
    await request.post(`/approvals/${item.id}/reject`, { comment: '不同意' })
    ElMessage.success('已驳回')
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  }
}

async function loadData() {
  try {
    const res = await request.get('/approvals/pending')
    approvals.value = Array.isArray(res) ? res : (res.data || [])
  } catch (e) { /* ignore */ }
}

onMounted(loadData)
</script>
