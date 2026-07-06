<template>
  <div style="max-height:50vh;overflow-y:auto">
    <div style="display:flex;gap:10px;margin-bottom:14px">
      <div style="flex:1;background:#fafafa;border-radius:6px;padding:10px 14px;border:1px solid #f0f0f0;text-align:center">
        <div style="font-size:18px;font-weight:700">{{ stats.totalCount }}</div>
        <div style="font-size:11px;color:#999">累计违章</div>
      </div>
      <div style="flex:1;background:#fafafa;border-radius:6px;padding:10px 14px;border:1px solid #f0f0f0;text-align:center">
        <div style="font-size:18px;font-weight:700">{{ stats.totalPoints }}</div>
        <div style="font-size:11px;color:#999">累计扣分</div>
      </div>
      <div style="flex:1;background:#fafafa;border-radius:6px;padding:10px 14px;border:1px solid #f0f0f0;text-align:center">
        <div style="font-size:18px;font-weight:700;color:#d48806">{{ stats.totalPenalty }}</div>
        <div style="font-size:11px;color:#999">累计罚款(元)</div>
      </div>
    </div>

    <el-button type="primary" size="small" style="margin-bottom:12px" @click="openForm">+ 录入违章</el-button>

    <el-table :data="records" size="small" stripe v-if="records.length">
      <el-table-column prop="violation_date" label="日期" width="100" />
      <el-table-column prop="location" label="地点" min-width="150" />
      <el-table-column prop="behavior" label="违章行为" min-width="160" />
      <el-table-column prop="points_deducted" label="扣分" width="70" />
      <el-table-column prop="penalty_amount" label="罚款" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === '已处理' ? 'success' : row.status === '申诉中' ? 'warning' : 'danger'" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110">
        <template #default="{ row }">
          <el-button v-if="row.status === '待处理'" type="success" size="small" @click="markProcessed(row)">标记已处理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else style="text-align:center;padding:32px;color:#bbb;font-size:13px">暂无违章记录</div>

    <el-dialog v-model="formVisible" title="录入违章记录" width="500px" append-to-body>
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="违章日期" required><el-date-picker v-model="form.violation_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="违章地点" required><el-input v-model="form.location" /></el-form-item>
        <el-form-item label="违章行为" required><el-input v-model="form.behavior" /></el-form-item>
        <el-form-item label="扣分"><el-input-number v-model="form.points_deducted" :min="0" :max="12" style="width:100%" /></el-form-item>
        <el-form-item label="罚款金额"><el-input-number v-model="form.penalty_amount" :min="0" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="processVisible" title="标记违章已处理" width="450px" append-to-body>
      <el-form :model="processForm" label-width="80px" size="small">
        <el-form-item label="处理日期"><el-date-picker v-model="processForm.processed_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="处理结果"><el-input v-model="processForm.processed_result" type="textarea" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="processVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitProcess">确认</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getViolationRecords, addViolationRecord, updateViolationStatus } from '@/api/operations'

const props = defineProps({ vehicleId: { type: Number, required: true } })

const records = ref([])
const stats = ref({ totalCount: 0, totalPoints: 0, totalPenalty: 0 })
const formVisible = ref(false)
const processVisible = ref(false)
const submitting = ref(false)
const processingId = ref(null)

const form = reactive({ violation_date: '', location: '', behavior: '', points_deducted: 0, penalty_amount: 0 })
const processForm = reactive({ processed_date: '', processed_result: '' })

async function loadData() {
  try {
    const data = await getViolationRecords(props.vehicleId)
    records.value = data.records || []
    stats.value = data.stats || { totalCount: 0, totalPoints: 0, totalPenalty: 0 }
  } catch (e) { ElMessage.error('加载违章记录失败') }
}

function openForm() {
  Object.assign(form, { violation_date: '', location: '', behavior: '', points_deducted: 0, penalty_amount: 0 })
  formVisible.value = true
}

async function submitForm() {
  if (!form.violation_date || !form.location || !form.behavior) return ElMessage.warning('请填写必填项')
  submitting.value = true
  try {
    await addViolationRecord(props.vehicleId, { ...form })
    ElMessage.success('录入成功')
    formVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.response?.data?.error || '录入失败') }
  finally { submitting.value = false }
}

function markProcessed(row) {
  processingId.value = row.id
  processForm.processed_date = new Date().toISOString().split('T')[0]
  processForm.processed_result = ''
  processVisible.value = true
}

async function submitProcess() {
  submitting.value = true
  try {
    await updateViolationStatus(props.vehicleId, processingId.value, { status: '已处理', ...processForm })
    ElMessage.success('已标记为已处理')
    processVisible.value = false
    loadData()
  } catch (e) { ElMessage.error('操作失败') }
  finally { submitting.value = false }
}

onMounted(loadData)
</script>
