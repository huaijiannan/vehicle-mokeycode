<script setup>
import { ref, onMounted } from 'vue'
import { getApproveList, approveApplication } from '@/api/mobile'
import { showToast, showDialog } from 'vant'

const list = ref([])
const loading = ref(false)

onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getApproveList()
    list.value = (res.data?.list || res.data || []).map(item => ({
      ...item,
      _approved: false,
      _rejected: false
    }))
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

async function approve(item) {
  try {
    await showDialog({ title: '确认审批', message: `确定通过「${item.purpose}」的用车申请吗？` })
    await approveApplication(item.id, { action: 'approve' })
    item._approved = true
    showToast('审批已通过')
  } catch {}
}

async function reject(item) {
  try {
    await showDialog({
      title: '驳回申请',
      message: '请输入驳回原因',
      showCancelButton: true,
      confirmButtonText: '确认驳回'
    })
    await approveApplication(item.id, { action: 'reject', reason: '' })
    item._rejected = true
    showToast('已驳回')
  } catch {}
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="用车审批" left-text="返回" left-arrow @click-left="$router.back()" />
    <div class="page-content">
      <van-tabs>
        <van-tab :title="`待审批 (${list.filter(i => !i._approved && !i._rejected).length})`">
          <van-pull-refresh v-model="loading" @refresh="fetchList">
            <div class="card" v-for="item in list" :key="'a'+item.id" v-show="!item._approved && !item._rejected">
              <div class="card-row">
                <span class="card-title">{{ item.purpose }}</span>
                <van-tag type="primary" size="small">待审批</van-tag>
              </div>
              <div class="card-meta">{{ item.applicant_name || '' }} · {{ item.department_name || '' }} · {{ formatTime(item.depart_time) }}</div>
              <div class="card-route">{{ item.origin }} → {{ item.destination }} · {{ item.passenger_count }}人{{ item.need_driver ? '' : ' · 自驾' }}</div>
              <div class="card-actions">
                <van-button size="small" plain @click="reject(item)">驳回</van-button>
                <van-button size="small" type="primary" @click="approve(item)">通过</van-button>
              </div>
            </div>
            <van-empty v-if="!loading && list.filter(i => !i._approved && !i._rejected).length === 0" description="暂无待审批申请" />
          </van-pull-refresh>
        </van-tab>
        <van-tab title="已审批">
          <van-empty description="暂无已审批记录" />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }
.page-content { padding: 8px 0; }

.card {
  background: #fff;
  margin: 0 16px 10px;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.card.urgent { border-left: 4px solid #f5222d; }

.card-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.card-meta { font-size: 12px; color: #999; margin-top: 4px; }
.card-route { font-size: 12px; color: #666; margin-top: 2px; }

.card-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5;
}
</style>
