<script setup lang="ts">
import { ref } from 'vue'
import type { Vehicle } from '../types/vehicle'
import VehicleDetail from '../components/VehicleDetail.vue'

const vehicles = ref<Vehicle[]>([
  {
    id: 'V001',
    plateNumber: '京A·88888',
    brand: '奥迪',
    model: 'A6L 45TFSI',
    year: 2023,
    vin: 'LFV3A24K9P3000001',
    status: 'normal',
    department: '总公司/行政部/商务车队',
    purchaseDate: '2023-01-15',
    purchasePrice: 428800,
    currentMileage: 52340,
  },
  {
    id: 'V002',
    plateNumber: '京B·66666',
    brand: '别克',
    model: 'GL8 ES陆尊',
    year: 2023,
    vin: 'LSGUL83L0PA000002',
    status: 'normal',
    department: '总公司/行政部/行政车队',
    purchaseDate: '2023-03-20',
    purchasePrice: 319900,
    currentMileage: 68200,
  },
  {
    id: 'V003',
    plateNumber: '京C·12345',
    brand: '丰田',
    model: '凯美瑞 2.5G',
    year: 2024,
    vin: 'LVGBE40K0RG000003',
    status: 'maintenance',
    department: '北京分公司/销售部/业务车队',
    purchaseDate: '2024-02-10',
    purchasePrice: 219800,
    currentMileage: 35100,
  },
  {
    id: 'V004',
    plateNumber: '沪A·99999',
    brand: '奔驰',
    model: 'E300L 豪华型',
    year: 2022,
    vin: 'LE4ZG8DB7NL000004',
    status: 'normal',
    department: '上海分公司/行政部',
    purchaseDate: '2022-06-05',
    purchasePrice: 498800,
    currentMileage: 89300,
  },
  {
    id: 'V005',
    plateNumber: '粤B·55555',
    brand: '比亚迪',
    model: '汉 EV 创世版',
    year: 2024,
    vin: 'LC0CE6CD0R0000005',
    status: 'normal',
    department: '深圳分公司/研发部',
    purchaseDate: '2024-01-08',
    purchasePrice: 289800,
    currentMileage: 18700,
  },
  {
    id: 'V006',
    plateNumber: '京D·00001',
    brand: '福田',
    model: '欧马可 S5',
    year: 2021,
    vin: 'LVBV5PBB1ME000006',
    status: 'offline',
    department: '北京分公司/物流部/货运车队',
    purchaseDate: '2021-09-12',
    purchasePrice: 185000,
    currentMileage: 156200,
  },
])

const detailVisible = ref(false)
const selectedVehicle = ref<Vehicle | null>(null)

const statusMap = {
  normal: { label: '运营中', type: 'success' as const },
  maintenance: { label: '维修中', type: 'warning' as const },
  offline: { label: '已停运', type: 'danger' as const },
}

function showDetail(vehicle: Vehicle) {
  selectedVehicle.value = vehicle
  detailVisible.value = true
}

function handleClose() {
  detailVisible.value = false
  selectedVehicle.value = null
}
</script>

<template>
  <div class="vehicle-list">
    <div class="page-header">
      <h2>车辆运营管理</h2>
      <p class="subtitle">点击车辆查看详情，进行加油、维修、保险、年检等运营管理操作</p>
    </div>

    <el-table
      :data="vehicles"
      stripe
      style="width: 100%"
      highlight-current-row
      @row-click="showDetail"
    >
      <el-table-column prop="plateNumber" label="车牌号" width="120" sortable />
      <el-table-column label="品牌型号" width="180">
        <template #default="{ row }">
          {{ row.brand }} {{ row.model }}
        </template>
      </el-table-column>
      <el-table-column prop="vin" label="车架号" width="200" show-overflow-tooltip />
      <el-table-column prop="department" label="所属部门" min-width="220" show-overflow-tooltip />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status as keyof typeof statusMap].type">
            {{ statusMap[row.status as keyof typeof statusMap].label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="currentMileage" label="当前里程(km)" width="130" sortable align="right">
        <template #default="{ row }">
          {{ row.currentMileage.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" link @click.stop="showDetail(row)">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <VehicleDetail
      :visible="detailVisible"
      :vehicle="selectedVehicle"
      @close="handleClose"
    />
  </div>
</template>

<style scoped>
.vehicle-list {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
}

.el-table {
  cursor: pointer;
}
</style>
