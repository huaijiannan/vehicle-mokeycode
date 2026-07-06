<template>
  <el-dialog v-model="visible" :title="null" width="780px" top="5vh" destroy-on-close @close="store.closeVehicleDetail" class="ops-modal">
    <template #header>
      <div style="display:flex;align-items:center;gap:10px;font-size:15px">
        <strong>{{ store.selectedVehicle?.plate }}</strong>
        <span style="color:#666;font-size:13px">{{ store.selectedVehicle?.model }} &middot; {{ store.selectedVehicle?.type }} &middot; {{ store.selectedVehicle?.fuel }}</span>
        <span :class="['status-badge', statusBadgeClass(store.selectedVehicle?.status)]">{{ displayStatus(store.selectedVehicle?.status) }}</span>
        <span style="color:#999;font-size:12px">{{ store.selectedVehicle?.dept }}</span>
        <span v-if="store.selectedVehicle?.mileage" style="color:#999;font-size:12px">| {{ store.selectedVehicle.mileage.toLocaleString() }} km</span>
      </div>
    </template>

    <el-tabs v-model="store.detailTab" @tab-change="handleTabChange" style="margin-top:-10px">
      <el-tab-pane label="加油管理" name="refuel">
        <RefuelTab :vehicle-id="store.selectedVehicleId" :mileage="store.selectedVehicle?.mileage" />
      </el-tab-pane>
      <el-tab-pane label="维修保养" name="maintenance">
        <MaintenanceTab :vehicle-id="store.selectedVehicleId" />
      </el-tab-pane>
      <el-tab-pane label="保险管理" name="insurance">
        <InsuranceTab :vehicle-id="store.selectedVehicleId" />
      </el-tab-pane>
      <el-tab-pane label="年检管理" name="inspection">
        <InspectionTab :vehicle-id="store.selectedVehicleId" />
      </el-tab-pane>
      <el-tab-pane label="违章处理" name="violation">
        <ViolationTab :vehicle-id="store.selectedVehicleId" />
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="store.closeVehicleDetail">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useOperationsStore } from '@/stores/operations'
import RefuelTab from './tabs/RefuelTab.vue'
import MaintenanceTab from './tabs/MaintenanceTab.vue'
import InsuranceTab from './tabs/InsuranceTab.vue'
import InspectionTab from './tabs/InspectionTab.vue'
import ViolationTab from './tabs/ViolationTab.vue'

const store = useOperationsStore()
const visible = computed({
  get: () => store.modalVisible,
  set: (val) => { if (!val) store.closeVehicleDetail() }
})

function handleTabChange() {}

const statusMap = { '空闲': '运营中', '出车中': '运营中', '维修中': '维修中', '报废': '已停运' }

function displayStatus(status) {
  return statusMap[status] || status
}

function statusBadgeClass(status) {
  const mapped = statusMap[status] || status
  const map = { '运营中': 'badge-active', '维修中': 'badge-repair', '已停运': 'badge-stopped' }
  return map[mapped] || ''
}
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.badge-active { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.badge-repair { background: #fffbe6; color: #d48806; border: 1px solid #ffe58f; }
.badge-stopped { background: #fff2f0; color: #cf1322; border: 1px solid #ffccc7; }
</style>

<style>
.ops-modal .el-dialog__body { padding:10px 20px 0; }
.ops-modal .el-dialog__header { padding-bottom:8px; }
</style>
