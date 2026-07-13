<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getApplyList } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()

const applies = ref([])
const loading = ref(false)

const statusColors = { '待审批': 'warning', '已审批': 'success', '已派车': 'primary', '已驳回': 'danger' }
const statusLabels = { '待审批': '审批中', '已审批': '已通过', '已派车': '已派车', '已驳回': '已驳回' }

onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getApplyList()
    applies.value = res.data?.list || res.data || []
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
}

function goDetail(id) {
  router.push(`/m/apply/${id}`)
}

function goCreate() {
  router.push('/m/apply/create')
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="我的申请" left-text="返回" left-arrow @click-left="$router.back()">
      <template #right>
        <van-icon name="plus" size="20" @click="goCreate" />
      </template>
    </van-nav-bar>
    <div class="page-content">
      <van-pull-refresh v-model="loading" @refresh="fetchList">
        <div class="card" v-for="item in applies" :key="item.id" @click="goDetail(item.id)">
          <div class="card-row">
            <span class="card-title">{{ item.purpose }}</span>
            <van-tag :type="statusColors[item.status] || 'default'" size="small">{{ statusLabels[item.status] || item.status }}</van-tag>
          </div>
          <div class="card-meta">{{ formatTime(item.depart_time) }} · {{ item.passenger_count }}人</div>
          <div class="card-route">{{ item.origin }} → {{ item.destination }}</div>
        </div>
        <van-empty v-if="!loading && applies.length === 0" description="暂无申请记录" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }
.page-content { padding: 12px 16px; }

.card {
  background: #fff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
  cursor: pointer;
}

.card-row { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #1a1a1a; }
.card-meta { font-size: 12px; color: #999; margin-top: 4px; }
.card-route { font-size: 12px; color: #666; margin-top: 2px; }
</style>
