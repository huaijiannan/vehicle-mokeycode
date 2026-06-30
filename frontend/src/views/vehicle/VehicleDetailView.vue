<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回">
      <template #content><span style="font-size:16px;font-weight:bold">车辆详情</span></template>
    </el-page-header>
    <el-card style="margin-top:16px" v-if="vehicle">
      <el-descriptions title="基本信息" :column="3" border>
        <el-descriptions-item label="车牌号">{{ vehicle.plate_number }}</el-descriptions-item>
        <el-descriptions-item label="品牌型号">{{ vehicle.brand_model }}</el-descriptions-item>
        <el-descriptions-item label="车辆类型">{{ vehicle.vehicle_type }}</el-descriptions-item>
        <el-descriptions-item label="燃油类型">{{ vehicle.fuel_type }}</el-descriptions-item>
        <el-descriptions-item label="排量">{{ vehicle.engine_displacement }}L</el-descriptions-item>
        <el-descriptions-item label="座位数">{{ vehicle.seat_count }}</el-descriptions-item>
        <el-descriptions-item label="颜色">{{ vehicle.color || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排放标准">{{ vehicle.emission_standard || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ vehicle.department_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="购置日期">{{ vehicle.purchase_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="购置价格">{{ vehicle.purchase_price ? '¥' + vehicle.purchase_price.toLocaleString() : '-' }}</el-descriptions-item>
        <el-descriptions-item label="编制类型">{{ vehicle.quota_type || '-' }}</el-descriptions-item>
        <el-descriptions-item label="使用年限">{{ vehicle.service_life ? vehicle.service_life + '年' : '-' }}</el-descriptions-item>
        <el-descriptions-item label="当前里程">{{ vehicle.mileage }} km</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(vehicle.status)">{{ vehicle.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="年检到期">{{ vehicle.inspection_due || '-' }}</el-descriptions-item>
        <el-descriptions-item label="保险到期">{{ vehicle.insurance_due || '-' }}</el-descriptions-item>
        <el-descriptions-item label="VIN">{{ vehicle.vin || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ vehicle.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getVehicle } from '@/api/vehicle'

const route = useRoute()
const router = useRouter()
const vehicle = ref(null)
const loading = ref(false)

const statusType = (s) => ({ '空闲': 'success', '出车中': 'primary', '维修中': 'warning', '报废': 'info' }[s] || 'info')

onMounted(async () => {
  loading.value = true
  try {
    vehicle.value = await getVehicle(route.params.id)
  } catch (e) {
    ElMessage.error('加载车辆详情失败')
  } finally {
    loading.value = false
  }
})
</script>
