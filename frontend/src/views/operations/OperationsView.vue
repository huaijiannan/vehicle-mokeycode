<template>
  <div class="ops-page">
    <div class="ops-header">
      <span class="ops-title">车辆运营管理</span>
      <el-divider direction="vertical" />
      <span class="ops-desc">点击车辆查看详情，进行加油、维修、保险、年检等管理操作</span>
    </div>

    <div class="ops-toolbar">
      <el-input
        v-model="store.searchKeyword"
        placeholder="搜索车牌号 / 品牌型号..."
        style="width:300px"
        size="default"
        clearable
        @input="debounceSearch"
      />
      <el-select
        v-model="store.filterStatus"
        placeholder="全部状态"
        size="default"
        style="width:140px"
        clearable
        @change="store.fetchVehicles()"
      >
        <el-option v-for="s in statusFilters" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <span style="font-size:13px;color:#909399;margin-left:auto">共 {{ store.totalVehicles }} 辆车</span>
    </div>

    <div class="ops-table-wrap">
      <el-table
        :data="store.vehicles"
        v-loading="store.loading"
        stripe
        style="width:100%"
        size="default"
      >
        <el-table-column prop="plate" label="车牌号" width="140">
          <template #default="{ row }">
            <span class="plate-cell">{{ formatPlate(row.plate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="model" label="品牌型号" min-width="170" show-overflow-tooltip />
        <el-table-column prop="vin" label="车架号" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="font-family:monospace;font-size:12px">{{ row.vin || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dept" label="所属部门" width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-badge', statusBadgeClass(row.status)]">{{ displayStatus(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前里程(km)" width="130" align="right">
          <template #default="{ row }">
            <span v-if="row.mileage">{{ row.mileage.toLocaleString() }}</span>
            <span v-else style="color:#c0c4cc">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="store.openVehicleDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="ops-pager">
      <el-pagination
        v-model:current-page="store.currentPage"
        :page-size="store.pageSize"
        :total="store.totalVehicles"
        layout="prev, pager, next, total"
        background
        @current-change="store.goPage"
      />
    </div>

    <VehicleDetailModal v-if="store.modalVisible" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useOperationsStore } from '@/stores/operations'
import VehicleDetailModal from './VehicleDetailModal.vue'

const store = useOperationsStore()

const statusFilters = [
  { label: '运营中', value: '运营中' },
  { label: '维修中', value: '维修中' },
  { label: '已停运', value: '已停运' }
]

const statusMap = {
  '空闲': '运营中',
  '出车中': '运营中',
  '维修中': '维修中',
  '报废': '已停运'
}

function displayStatus(status) {
  return statusMap[status] || status
}

function statusBadgeClass(status) {
  const mapped = statusMap[status] || status
  const map = { '运营中': 'badge-active', '维修中': 'badge-repair', '已停运': 'badge-stopped' }
  return map[mapped] || ''
}

function formatPlate(plate) {
  if (plate && plate.length >= 2) {
    return plate.slice(0, 2) + '\u00b7' + plate.slice(2)
  }
  return plate
}

let searchTimer = null
function debounceSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.fetchVehicles(), 300)
}

onMounted(() => {
  store.selectOrg('all')
})
</script>

<style scoped>
.ops-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 110px);
  background: #f0f2f5;
  overflow: hidden;
}

.ops-header {
  background: #1677ff;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.ops-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.ops-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
}

.ops-toolbar {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: #fff;
  align-items: center;
  flex-shrink: 0;
  border-bottom: 1px solid #ebeef5;
}

.ops-table-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #f0f2f5;
}

.ops-pager {
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
}

.plate-cell {
  font-weight: 600;
  letter-spacing: 1px;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.badge-active {
  background: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.badge-repair {
  background: #fffbe6;
  color: #d48806;
  border: 1px solid #ffe58f;
}

.badge-stopped {
  background: #fff2f0;
  color: #cf1322;
  border: 1px solid #ffccc7;
}
</style>
