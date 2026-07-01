<script setup lang="ts">
import { ref } from 'vue'
import type { Vehicle, FuelRecord, MaintenanceRecord, InsuranceClaim, InspectionRecord } from '../types/vehicle'
import FuelManagement from './FuelManagement.vue'
import MaintenanceManagement from './MaintenanceManagement.vue'
import InsuranceManagement from './InsuranceManagement.vue'
import InspectionManagement from './InspectionManagement.vue'

const props = defineProps<{
  visible: boolean
  vehicle: Vehicle | null
}>()

const emit = defineEmits<{
  close: []
}>()

const activeTab = ref('info')

function handleClose() {
  emit('close')
}

function handleFuelSubmit(record: Omit<FuelRecord, 'id' | 'vehicleId'>) {
  console.log('加油记录:', { vehicleId: props.vehicle?.id, ...record })
}

function handleMaintenanceSubmit(record: Omit<MaintenanceRecord, 'id' | 'vehicleId'>) {
  console.log('维保记录:', { vehicleId: props.vehicle?.id, ...record })
}

function handleInsuranceSubmit(record: Omit<InsuranceClaim, 'id' | 'vehicleId'>) {
  console.log('理赔记录:', { vehicleId: props.vehicle?.id, ...record })
}

function handleInspectionSubmit(record: Omit<InspectionRecord, 'id' | 'vehicleId'>) {
  console.log('年检记录:', { vehicleId: props.vehicle?.id, ...record })
}

const statusMap: Record<string, { label: string; type: string }> = {
  normal: { label: '运营中', type: 'success' },
  maintenance: { label: '维修中', type: 'warning' },
  offline: { label: '已停运', type: 'danger' },
}
</script>

<template>
  <el-dialog
    :model-value="props.visible"
    :title="vehicle ? `${vehicle.plateNumber} - 车辆详情` : '车辆详情'"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    @close="handleClose"
  >
    <template v-if="vehicle">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 Tab -->
        <el-tab-pane label="基本信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="车牌号">{{ vehicle.plateNumber }}</el-descriptions-item>
            <el-descriptions-item label="品牌型号">{{ vehicle.brand }} {{ vehicle.model }}</el-descriptions-item>
            <el-descriptions-item label="车架号(VIN)">{{ vehicle.vin }}</el-descriptions-item>
            <el-descriptions-item label="所属部门">{{ vehicle.department }}</el-descriptions-item>
            <el-descriptions-item label="购置日期">{{ vehicle.purchaseDate }}</el-descriptions-item>
            <el-descriptions-item label="购置价格">{{ vehicle.purchasePrice.toLocaleString() }} 元</el-descriptions-item>
            <el-descriptions-item label="当前里程">{{ vehicle.currentMileage.toLocaleString() }} km</el-descriptions-item>
            <el-descriptions-item label="车辆状态">
              <el-tag
                v-if="statusMap[vehicle.status]"
                :type="statusMap[vehicle.status].type as 'success' | 'warning' | 'danger'"
              >
                {{ statusMap[vehicle.status].label }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <!-- 加油管理 Tab -->
        <el-tab-pane label="加油管理" name="fuel">
          <FuelManagement @submit="handleFuelSubmit" />
        </el-tab-pane>

        <!-- 维修保养 Tab -->
        <el-tab-pane label="维修保养" name="maintenance">
          <MaintenanceManagement @submit="handleMaintenanceSubmit" />
        </el-tab-pane>

        <!-- 保险管理 Tab -->
        <el-tab-pane label="保险管理" name="insurance">
          <InsuranceManagement @submit="handleInsuranceSubmit" />
        </el-tab-pane>

        <!-- 年检管理 Tab -->
        <el-tab-pane label="年检管理" name="inspection">
          <InspectionManagement @submit="handleInspectionSubmit" />
        </el-tab-pane>
      </el-tabs>
    </template>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
