<template>
  <div style="max-height:50vh;overflow-y:auto">
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div v-for="s in statsCards" :key="s.label" style="flex:1;background:#fafafa;border-radius:6px;padding:10px 14px;border:1px solid #f0f0f0">
        <div :class="['stat-val', s.warn ? 'stat-warn' : '']">{{ s.value }}</div>
        <div style="font-size:11px;color:#999">{{ s.label }}</div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-bottom:12px;align-items:center">
      <el-button type="primary" size="small" @click="openForm">+ 添加加油</el-button>
      <el-date-picker v-model="currentMonth" type="month" placeholder="选择月份" size="small" format="YYYY-MM" value-format="YYYY-MM" @change="loadData" />
    </div>

    <el-table :data="records" size="small" stripe>
      <el-table-column prop="refuel_date" label="日期" width="100" />
      <el-table-column prop="station_name" label="加油站" min-width="140" />
      <el-table-column prop="fuel_type" label="油品" width="70" />
      <el-table-column prop="fuel_amount" label="加油量(L)" width="90" />
      <el-table-column prop="unit_price" label="单价" width="70" />
      <el-table-column prop="total_amount" label="金额" width="80" />
      <el-table-column prop="current_odometer" label="里程(km)" width="90" />
      <el-table-column prop="fuel_card_number" label="加油卡" width="90" />
      <el-table-column prop="operator" label="操作人" width="70" />
    </el-table>
    <div v-if="records.length === 0" style="text-align:center;padding:32px;color:#bbb;font-size:13px">暂无加油记录</div>

    <el-dialog v-model="formVisible" title="添加加油记录" width="500px" append-to-body>
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="加油日期" required><el-date-picker v-model="form.refuel_date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="加油站" required><el-input v-model="form.station_name" placeholder="如中石化朝阳站" /></el-form-item>
        <el-form-item label="油品标号" required>
          <el-select v-model="form.fuel_type" style="width:100%">
            <el-option label="92#" value="92#" /><el-option label="95#" value="95#" /><el-option label="98#" value="98#" /><el-option label="0#柴油" value="0#柴油" />
          </el-select>
        </el-form-item>
        <el-form-item label="加油量(L)" required><el-input-number v-model="form.fuel_amount" :min="0" :precision="1" style="width:100%" /></el-form-item>
        <el-form-item label="单价(元/L)" required><el-input-number v-model="form.unit_price" :min="0" :precision="2" style="width:100%" /></el-form-item>
        <el-form-item label="里程数(km)" required><el-input-number v-model="form.current_odometer" :min="0" :precision="1" style="width:100%" /></el-form-item>
        <el-form-item label="加油卡号"><el-input v-model="form.fuel_card_number" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRefuelRecords, addRefuelRecord } from '@/api/operations'

const props = defineProps({ vehicleId: { type: Number, required: true } })

const records = ref([])
const stats = ref({ totalAmount: 0, totalCost: 0, avgConsumption: 0, isAbnormal: false })
const currentMonth = ref('2026-06')
const formVisible = ref(false)
const submitting = ref(false)

const form = reactive({
  refuel_date: '', station_name: '', fuel_type: '95#', fuel_amount: 0, unit_price: 8.5, current_odometer: 0, fuel_card_number: ''
})

const statsCards = computed(() => [
  { label: '本月累计加油量', value: stats.value.totalAmount + ' L', warn: false },
  { label: '本月累计金额', value: stats.value.totalCost + ' 元', warn: false },
  { label: '平均油耗(L/100km)', value: stats.value.isAbnormal ? stats.value.avgConsumption + ' (超标)' : stats.value.avgConsumption || '-', warn: stats.value.isAbnormal }
])

async function loadData() {
  try {
    const data = await getRefuelRecords(props.vehicleId, { month: currentMonth.value })
    records.value = data.records || []
    stats.value = data.stats || { totalAmount: 0, totalCost: 0, avgConsumption: 0 }
  } catch (e) {
    ElMessage.error('加载加油记录失败')
  }
}

function openForm() {
  form.refuel_date = new Date().toISOString().split('T')[0]
  form.station_name = ''
  form.fuel_type = '95#'
  form.fuel_amount = 0
  form.unit_price = 8.5
  form.current_odometer = 0
  form.fuel_card_number = ''
  formVisible.value = true
}

async function submitForm() {
  if (!form.refuel_date || !form.station_name || !form.fuel_amount || !form.unit_price || !form.current_odometer) {
    return ElMessage.warning('请填写所有必填项')
  }
  submitting.value = true
  try {
    await addRefuelRecord(props.vehicleId, { ...form })
    ElMessage.success('添加成功')
    formVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '添加失败')
  } finally {
    submitting.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.stat-val { font-size:18px;font-weight:700; }
.stat-val.stat-warn { color:#d48806; }
</style>
