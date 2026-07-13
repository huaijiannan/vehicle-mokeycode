<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDispatchList, getAvailableVehicles, getAvailableDrivers } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()

const tabs = ['调度台', '进行中', '已完成']
const activeTab = ref(0)
const loading = ref(false)

const dispatchList = ref([])
const freeVehicles = ref(0)
const freeDrivers = ref(0)

onMounted(() => {
  fetchList()
  fetchResources()
})

async function fetchList() {
  try {
    const res = await getDispatchList()
    dispatchList.value = res.data?.list || res.data || []
  } catch {}
}

async function fetchResources() {
  try {
    const [vRes, dRes] = await Promise.all([getAvailableVehicles(), getAvailableDrivers()])
    freeVehicles.value = (vRes.data || []).length
    freeDrivers.value = (dRes.data || []).length
  } catch {}
}

async function onRefresh() {
  loading.value = true
  await fetchList()
  await fetchResources()
  loading.value = false
}

function goAssign(id) {
  router.push(`/m/dispatch/assign/${id}`)
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="车辆调度" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="stat-row">
      <span class="stat-item"><b class="warn">{{ dispatchList.length }}</b> 待调度</span>
      <span class="stat-item"><b class="blue">0</b> 进行中</span>
      <span class="stat-item"><b class="success">0</b> 今日归库</span>
    </div>

    <van-tabs v-model:active="activeTab">
      <van-tab v-for="t in tabs" :key="t" :title="t" />
    </van-tabs>

    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <div class="page-content">
        <template v-if="activeTab === 0">
          <div class="urgent-alert" v-if="dispatchList.length > 0">
            <van-icon name="warning-o" size="18" color="#f5222d" />
            <span>{{ dispatchList.length }}条任务待处理</span>
          </div>
          <div class="card" v-for="item in dispatchList" :key="item.id">
            <div class="card-row">
              <span class="card-title">{{ item.purpose }}</span>
              <van-tag type="primary" size="small">待调度</van-tag>
            </div>
            <div class="card-meta">{{ item.applicant_name || '' }} · {{ item.department_name || '' }}</div>
            <div class="card-meta">出发：{{ formatTime(item.depart_time) }}</div>
            <div class="card-route">{{ item.origin }} → {{ item.destination }} · {{ item.passenger_count }}人</div>
            <div class="card-actions">
              <span class="hint">空闲车{{ freeVehicles }}辆 · 空闲司机{{ freeDrivers }}人</span>
              <van-button size="small" type="primary" @click="goAssign(item.id)">派车</van-button>
            </div>
          </div>
          <van-empty v-if="!loading && dispatchList.length === 0" description="暂无待调度任务" />
        </template>
        <van-empty v-if="activeTab !== 0" description="暂无数据" />
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.stat-row {
  display: flex; gap: 0; background: #fff;
  padding: 12px 16px;
}

.stat-item {
  flex: 1; text-align: center; font-size: 12px; color: #666;
}

.stat-item b { font-size: 20px; display: block; margin-bottom: 2px; }
.stat-item b.warn { color: #fa8c16; }
.stat-item b.blue { color: #1a73e8; }
.stat-item b.success { color: #52c41a; }

.urgent-alert {
  background: #fff1f0; border: 1px solid #ffccc7;
  border-radius: 10px; padding: 10px 14px; margin: 10px 16px;
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: #cf1322;
}

.page-content { padding: 0 16px 16px; }

.card {
  background: #fff; border-radius: 12px; padding: 14px;
  margin-top: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.card.urgent { border-left: 4px solid #f5222d; }

.card-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.card-meta { font-size: 12px; color: #999; margin-top: 2px; }
.card-route { font-size: 12px; color: #666; margin-top: 2px; }

.card-actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5;
}

.hint { font-size: 11px; color: #52c41a; }
</style>
