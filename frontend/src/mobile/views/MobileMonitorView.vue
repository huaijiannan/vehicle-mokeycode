<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardOverview } from '@/api/mobile'

const router = useRouter()

const stats = ref([
  { label: '今日申请', value: 0, color: '#1a73e8', key: 'today_applies' },
  { label: '在途车辆', value: 0, color: '#fa8c16', key: 'active_trips' },
  { label: '已完成', value: 0, color: '#52c41a', key: 'completed_trips' },
  { label: '空闲车辆', value: 0, color: '#1a73e8', key: 'idle_vehicles' }
])

const statusDistribution = ref([
  { label: '空闲', count: 0, color: '#52c41a', key: 'idle_vehicles' },
  { label: '在途', count: 0, color: '#1a73e8', key: 'in_use_vehicles' },
  { label: '维修', count: 0, color: '#fa8c16', key: 'maintenance_vehicles' },
  { label: '停用', count: 0, color: '#e8e8e8', key: 'inactive_vehicles' }
])

const alerts = ref([])
const total = computed(() => statusDistribution.value.reduce((s, i) => s + i.count, 0))

onMounted(async () => {
  try {
    const res = await getDashboardOverview()
    const data = res.data
    stats.value.forEach(s => { s.value = data[s.key] || 0 })
    statusDistribution.value.forEach(d => { d.count = data[d.key] || 0 })
  } catch {}
})

function goVehicleStatus() {
  router.push('/m/vehicle/status')
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="运营监控看板" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="section-title">今日运营概览</div>
      <div class="stat-grid">
        <div v-for="s in stats" :key="s.label" class="stat-card">
          <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
          <div class="stat-label">{{ s.label }}</div>
        </div>
      </div>

      <div class="section-title">
        车辆状态分布
        <span class="title-link" @click="goVehicleStatus">详情 &gt;</span>
      </div>
      <div class="status-bar">
        <div v-for="d in statusDistribution" :key="d.label"
          class="bar-seg" :style="{ width: (d.count / total * 100) + '%', background: d.color }">
          {{ d.label }} {{ d.count }}辆
        </div>
      </div>

      <van-cell-group inset class="detail-group">
        <van-cell v-for="d in statusDistribution" :key="d.label" :title="d.label">
          <template #value>
            <span class="detail-value">{{ d.count }}辆</span>
          </template>
          <template #icon>
            <span class="color-dot" :style="{ background: d.color }"></span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="section-title">异常告警</div>
      <div class="alert-card">
        <van-empty v-if="alerts.length === 0" description="暂无异常告警" />
        <div v-for="a in alerts" :key="a.title" class="alert-item">
          <span class="alert-dot" :class="a.level"></span>
          <div class="alert-info">
            <div class="alert-title">{{ a.title }}</div>
            <div class="alert-desc">{{ a.desc }}</div>
          </div>
          <span class="alert-time">{{ a.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 12px 16px; }

.section-title {
  font-size: 15px; font-weight: 700; color: #333;
  margin: 8px 0 10px; display: flex; justify-content: space-between; align-items: center;
}

.title-link { font-size: 12px; color: #1a73e8; font-weight: 400; cursor: pointer; }

.stat-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px;
  margin-bottom: 12px;
}

.stat-card {
  background: #fff; border-radius: 12px; padding: 14px 8px;
  text-align: center; box-shadow: 0 1px 2px rgba(0,0,0,.04);
}

.stat-value { font-size: 26px; font-weight: 800; }
.stat-label { font-size: 11px; color: #999; margin-top: 2px; }

.status-bar {
  display: flex; height: 30px; border-radius: 8px; overflow: hidden;
  margin-bottom: 12px;
}

.bar-seg {
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 600; min-width: 0;
  white-space: nowrap; overflow: hidden;
}

.detail-group { margin-bottom: 16px; }

.color-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  margin-right: 8px; vertical-align: middle;
}

.detail-value { font-weight: 600; color: #333; }

.alert-card {
  background: #fff; border-radius: 12px; padding: 8px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.05);
}

.alert-item {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 0; border-bottom: 1px solid #f5f5f5;
}

.alert-item:last-child { border-bottom: none; }

.alert-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}

.alert-dot.danger { background: #f5222d; }
.alert-dot.warning { background: #fa8c16; }

.alert-info { flex: 1; }

.alert-title { font-size: 13px; font-weight: 600; color: #333; }
.alert-desc { font-size: 11px; color: #999; margin-top: 2px; }

.alert-time { font-size: 11px; color: #ccc; }
</style>
