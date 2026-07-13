<script setup>
import { ref, computed, onMounted } from 'vue'
import { getVehicleStatusGrid } from '@/api/mobile'

const vehicles = ref([])
const stats = ref({ idle: 0, in_use: 0, maintenance: 0 })
const loading = ref(false)

const apiStatusMap = {
  '空闲': { label: '空闲', color: '#52c41a', bg: '#f6ffed' },
  '出车中': { label: '占用', color: '#1a73e8', bg: '#e8f0fe' },
  '维修中': { label: '维修', color: '#fa8c16', bg: '#fff7e6' }
}

const defaultStatus = { label: '停用', color: '#ccc', bg: '#f5f5f5' }

function getStatusInfo(s) {
  return apiStatusMap[s] || defaultStatus
}

onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getVehicleStatusGrid()
    vehicles.value = res.data?.vehicles || []
    stats.value = res.data?.stats || { idle: 0, in_use: 0, maintenance: 0 }
  } catch {}
  loading.value = false
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="车辆状态看板" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="stat-row">
      <span class="stat-item"><b class="green">{{ stats.idle }}</b> 空闲</span>
      <span class="stat-item"><b class="blue">{{ stats.in_use }}</b> 占用</span>
      <span class="stat-item"><b class="orange">{{ stats.maintenance }}</b> 维修</span>
    </div>

    <div class="page-content">
      <van-cell-group inset>
        <van-cell v-for="v in vehicles" :key="v.id" :title="`${v.plate_number} ${v.brand_model}`">
          <template #value>
            <span class="status-tag" :style="{ color: getStatusInfo(v.status).color, background: getStatusInfo(v.status).bg }">
              {{ getStatusInfo(v.status).label }}
            </span>
          </template>
          <template #icon>
            <span class="icon-dot" :style="{ background: getStatusInfo(v.status).color }"></span>
          </template>
        </van-cell>
      </van-cell-group>
      <van-empty v-if="!loading && vehicles.length === 0" description="暂无车辆数据" />
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.stat-row {
  display: flex; gap: 0; background: #fff;
  padding: 16px;
}

.stat-item {
  flex: 1; text-align: center; font-size: 12px; color: #666;
}

.stat-item b { font-size: 22px; display: block; margin-bottom: 2px; }
.stat-item b.green { color: #52c41a; }
.stat-item b.blue { color: #1a73e8; }
.stat-item b.orange { color: #fa8c16; }

.page-content { padding: 12px 16px; }

.status-tag {
  font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: 500;
}

.icon-dot {
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  margin-right: 8px; vertical-align: middle;
}
</style>
