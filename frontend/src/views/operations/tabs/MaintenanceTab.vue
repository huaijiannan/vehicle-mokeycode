<template>
  <div style="max-height:50vh;overflow-y:auto">
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <el-button type="primary" size="small" @click="openRepairForm">+ 新增维修申请</el-button>
      <el-button size="small" @click="openMaintenanceForm">+ 保养记录</el-button>
    </div>

    <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:#555">维修记录</div>
    <el-table :data="repairs" size="small" stripe v-if="repairs.length">
      <el-table-column prop="date" label="日期" width="100" />
      <el-table-column prop="repair_type" label="类型" width="100" />
      <el-table-column prop="items" label="项目" min-width="160" />
      <el-table-column prop="cost" label="费用" width="80"><template #default="{ row }">{{ row.cost?.toLocaleString() }}</template></el-table-column>
      <el-table-column prop="shop_name" label="维修厂" width="140" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '已完工' ? 'success' : row.status === '维修中' ? 'warning' : 'info'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button v-if="row.status !== '已完工'" type="success" size="small" @click="markDone(row.id)">完工</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else style="text-align:center;padding:16px;color:#bbb;font-size:13px">暂无维修记录</div>

    <div style="font-size:13px;font-weight:600;margin:12px 0 8px;color:#555">保养记录</div>
    <el-table :data="maintenances" size="small" stripe v-if="maintenances.length">
      <el-table-column prop="date" label="日期" width="100" />
      <el-table-column prop="maintenance_type" label="类型" width="100" />
      <el-table-column prop="items" label="项目" min-width="160" />
      <el-table-column prop="cost" label="费用" width="80"><template #default="{ row }">{{ row.cost?.toLocaleString() }}</template></el-table-column>
      <el-table-column prop="current_odometer" label="保养里程" width="90" />
      <el-table-column label="下次保养" width="150">
        <template #default="{ row }">{{ row.next_maintenance_odometer }}km / {{ row.next_maintenance_date }}</template>
      </el-table-column>
    </el-table>
    <div v-else style="text-align:center;padding:16px;color:#bbb;font-size:13px">暂无保养记录</div>

    <!-- 维修申请表单 -->
    <el-dialog v-model="repairVisible" title="新增维修申请" width="500px" append-to-body>
      <el-form :model="repairForm" label-width="90px" size="small">
        <el-form-item label="日期" required><el-date-picker v-model="repairForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="维修类型" required>
          <el-select v-model="repairForm.repair_type" style="width:100%">
            <el-option label="事故维修" value="事故维修" /><el-option label="故障维修" value="故障维修" /><el-option label="常规维修" value="常规维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目描述" required><el-input v-model="repairForm.items" type="textarea" /></el-form-item>
        <el-form-item label="费用"><el-input-number v-model="repairForm.cost" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="维修厂"><el-input v-model="repairForm.shop_name" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="repairVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitRepair">确定</el-button></template>
    </el-dialog>

    <!-- 保养记录表单 -->
    <el-dialog v-model="maintVisible" title="保养记录" width="500px" append-to-body>
      <el-form :model="maintForm" label-width="100px" size="small">
        <el-form-item label="日期" required><el-date-picker v-model="maintForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="保养类型" required>
          <el-select v-model="maintForm.maintenance_type" style="width:100%">
            <el-option label="小保养" value="小保养" /><el-option label="大保养" value="大保养" /><el-option label="专项保养" value="专项保养" />
          </el-select>
        </el-form-item>
        <el-form-item label="保养项目" required><el-input v-model="maintForm.items" type="textarea" /></el-form-item>
        <el-form-item label="费用"><el-input-number v-model="maintForm.cost" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="保养里程" required><el-input-number v-model="maintForm.current_odometer" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="下次保养里程" required><el-input-number v-model="maintForm.next_maintenance_odometer" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="下次保养日期"><el-date-picker v-model="maintForm.next_maintenance_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="maintVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitMaintenance">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMaintenanceRecords, addMaintenanceRecord, updateMaintenanceStatus } from '@/api/operations'

const props = defineProps({ vehicleId: { type: Number, required: true } })

const repairs = ref([])
const maintenances = ref([])
const submitting = ref(false)

const repairVisible = ref(false)
const repairForm = reactive({ date: '', repair_type: '常规维修', items: '', cost: 0, shop_name: '' })

const maintVisible = ref(false)
const maintForm = reactive({ date: '', maintenance_type: '小保养', items: '', cost: 0, current_odometer: 0, next_maintenance_odometer: 0, next_maintenance_date: '' })

async function loadData() {
  try {
    const data = await getMaintenanceRecords(props.vehicleId)
    repairs.value = data.repairs || []
    maintenances.value = data.maintenances || []
  } catch (e) {
    ElMessage.error('加载维修保养记录失败')
  }
}

function openRepairForm() {
  repairForm.date = new Date().toISOString().split('T')[0]
  repairForm.repair_type = '常规维修'
  repairForm.items = ''
  repairForm.cost = 0
  repairForm.shop_name = ''
  repairVisible.value = true
}

function openMaintenanceForm() {
  maintForm.date = new Date().toISOString().split('T')[0]
  maintForm.maintenance_type = '小保养'
  maintForm.items = ''
  maintForm.cost = 0
  maintForm.current_odometer = 0
  maintForm.next_maintenance_odometer = 0
  maintForm.next_maintenance_date = ''
  maintVisible.value = true
}

async function submitRepair() {
  if (!repairForm.date || !repairForm.items) return ElMessage.warning('请填写必填项')
  submitting.value = true
  try {
    await addMaintenanceRecord(props.vehicleId, { record_type: 'repair', date: repairForm.date, repair_type: repairForm.repair_type, items: repairForm.items, cost: repairForm.cost || null, status: '待维修' })
    ElMessage.success('提交成功')
    repairVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '提交失败')
  } finally { submitting.value = false }
}

async function submitMaintenance() {
  if (!maintForm.date || !maintForm.items || !maintForm.current_odometer || !maintForm.next_maintenance_odometer) return ElMessage.warning('请填写必填项')
  submitting.value = true
  try {
    await addMaintenanceRecord(props.vehicleId, { record_type: 'maintenance', ...maintForm })
    ElMessage.success('提交成功')
    maintVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '提交失败')
  } finally { submitting.value = false }
}

async function markDone(recordId) {
  try {
    await updateMaintenanceStatus(props.vehicleId, recordId, { status: '已完工' })
    ElMessage.success('已标记为完工')
    loadData()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(loadData)
</script>
