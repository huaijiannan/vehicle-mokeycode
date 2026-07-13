<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTaskList } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()

const tabs = ['待执行', '进行中', '已完成']
const activeTab = ref(0)
const loading = ref(false)
const tasks = ref([])

const pendingTasks = computed(() => tasks.value.filter(t => t.status === '待出车'))
const activeTasks = computed(() => tasks.value.filter(t => t.status === '出车中'))
const completedTasks = computed(() => tasks.value.filter(t => t.status === '已完成'))

onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getTaskList()
    tasks.value = res.data?.list || res.data || []
  } catch {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function goStart(id) {
  router.push(`/m/task/${id}/start`)
}

function goEnd(id) {
  router.push(`/m/task/${id}/end`)
}

function goExpense() {
  router.push('/m/expense/create')
}

function goRepair() {
  router.push('/m/repair/create')
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="我的任务" left-text="返回" left-arrow @click-left="$router.back()" />

    <van-tabs v-model:active="activeTab">
      <van-tab v-for="t in tabs" :key="t" :title="t" />
    </van-tabs>

    <van-pull-refresh v-model="loading" @refresh="fetchList">
      <div class="page-content">
        <template v-if="activeTab === 0">
          <div v-for="item in pendingTasks" :key="item.id" class="card">
            <div class="card-row">
              <span class="card-title">{{ item.purpose }}</span>
              <van-tag type="primary" size="small">待执行</van-tag>
            </div>
            <div class="card-meta">{{ formatTime(item.depart_time || item.created_at) }} · {{ item.plate_number }}</div>
            <div class="card-route">{{ item.origin || '-' }} → {{ item.destination || '-' }} · {{ item.passenger_count || 0 }}人</div>
            <div class="card-actions">
              <span class="card-hint">车辆：{{ item.brand_model || '-' }}</span>
              <van-button size="small" type="primary" @click="goStart(item.id)">确认出车</van-button>
            </div>
          </div>
          <van-empty v-if="pendingTasks.length === 0" description="暂无待执行任务" />
        </template>

        <template v-if="activeTab === 1">
          <div v-for="item in activeTasks" :key="item.id" class="active-card">
            <div class="task-time-label">出车时间</div>
            <div class="task-time">{{ formatTime(item.start_time) }}</div>
            <div class="task-route">{{ item.origin || '-' }} → {{ item.destination || '-' }}</div>
            <div class="task-vehicle">{{ item.plate_number }} {{ item.brand_model }} · 乘员{{ item.passenger_count || 0 }}人</div>
            <div class="task-btns">
              <van-button size="small" plain @click="goExpense">费用记入</van-button>
              <van-button size="small" type="primary" @click="goEnd(item.id)">确认归库</van-button>
            </div>
          </div>
          <van-empty v-if="activeTasks.length === 0" description="暂无进行中任务" />
        </template>

        <template v-if="activeTab === 2">
          <div v-for="item in completedTasks" :key="item.id" class="card">
            <div class="card-row">
              <span class="card-title">{{ item.purpose }}</span>
              <van-tag type="success" size="small">已完成</van-tag>
            </div>
            <div class="card-meta">{{ formatTime(item.end_time) }} · {{ item.total_mileage || 0 }}km</div>
            <div class="card-route">{{ item.origin || '-' }} → {{ item.destination || '-' }}</div>
          </div>
          <van-empty v-if="completedTasks.length === 0" description="暂无已完成任务" />
        </template>
      </div>
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 12px 16px; }

.card {
  background: #fff; border-radius: 12px; padding: 14px;
  margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.card-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.card-meta { font-size: 12px; color: #999; margin-top: 4px; }
.card-route { font-size: 12px; color: #666; margin-top: 2px; }

.card-actions {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5f5f5;
}

.card-hint { font-size: 11px; color: #999; }

.active-card {
  background: linear-gradient(135deg, #1a73e8, #4080ff); color: #fff;
  border-radius: 14px; padding: 20px;
}

.task-time-label { font-size: 11px; opacity: .8; }
.task-time { font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.task-route { font-size: 17px; font-weight: 700; margin-bottom: 2px; }
.task-vehicle { font-size: 13px; opacity: .9; }

.task-btns {
  display: flex; gap: 10px; margin-top: 16px;
}

.task-btns .van-button--plain {
  background: rgba(255,255,255,.2); border-color: rgba(255,255,255,.4); color: #fff;
}
</style>
