<template>
  <div style="max-height:50vh;overflow-y:auto">
    <div :class="['countdown', countdownClass]">
      <div style="font-size:28px;font-weight:700">{{ Math.abs(countdownDays) }}</div>
      <div style="font-size:12px;margin-top:2px">{{ countdownDays > 0 ? '天后到期' : '已逾期' }} &middot; 下次年检: {{ latestDate || '-' }}</div>
    </div>

    <el-button type="primary" size="small" style="margin-bottom:12px" @click="openForm">+ 录入年检</el-button>

    <el-table :data="records" size="small" stripe v-if="records.length">
      <el-table-column prop="inspection_date" label="年检日期" width="110" />
      <el-table-column prop="next_inspection_date" label="下次年检" width="110" />
      <el-table-column prop="inspection_org" label="年检单位" min-width="150" />
      <el-table-column prop="result" label="结果" width="110">
        <template #default="{ row }">
          <el-tag :type="row.result === '合格' ? 'success' : row.result === '限期整改' ? 'warning' : 'danger'" size="small">{{ row.result }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cost" label="费用" width="80" />
    </el-table>
    <div v-else style="text-align:center;padding:32px;color:#bbb;font-size:13px">暂无年检记录</div>

    <el-dialog v-model="formVisible" title="录入年检记录" width="500px" append-to-body>
      <el-form :model="form" label-width="100px" size="small">
        <el-form-item label="年检日期" required><el-date-picker v-model="form.inspection_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="下次年检日期" required><el-date-picker v-model="form.next_inspection_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="年检单位" required><el-input v-model="form.inspection_org" /></el-form-item>
        <el-form-item label="年检结果" required>
          <el-select v-model="form.result" style="width:100%">
            <el-option label="合格" value="合格" /><el-option label="不合格" value="不合格" /><el-option label="限期整改" value="限期整改" />
          </el-select>
        </el-form-item>
        <el-form-item label="年检费用"><el-input-number v-model="form.cost" :min="0" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getInspectionRecords, addInspectionRecord } from '@/api/operations'

const props = defineProps({ vehicleId: { type: Number, required: true } })

const records = ref([])
const formVisible = ref(false)
const submitting = ref(false)
const form = reactive({ inspection_date: '', next_inspection_date: '', inspection_org: '', result: '合格', cost: null })

const latestDate = computed(() => records.value[0]?.next_inspection_date || '')
const countdownDays = computed(() => {
  if (!latestDate.value) return 999
  return Math.ceil((new Date(latestDate.value) - new Date()) / (1000 * 60 * 60 * 24))
})
const countdownClass = computed(() => {
  if (countdownDays.value < 0) return 'red'
  if (countdownDays.value <= 30) return 'orange'
  if (countdownDays.value <= 60) return 'orange'
  return 'green'
})

async function loadData() {
  try {
    const data = await getInspectionRecords(props.vehicleId)
    records.value = data.records || []
  } catch (e) { ElMessage.error('加载年检记录失败') }
}

function openForm() {
  Object.assign(form, { inspection_date: '', next_inspection_date: '', inspection_org: '', result: '合格', cost: null })
  formVisible.value = true
}

async function submitForm() {
  if (!form.inspection_date || !form.next_inspection_date || !form.inspection_org || !form.result) return ElMessage.warning('请填写必填项')
  submitting.value = true
  try {
    await addInspectionRecord(props.vehicleId, { ...form })
    ElMessage.success('录入成功')
    formVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.response?.data?.error || '录入失败') }
  finally { submitting.value = false }
}

onMounted(loadData)
</script>

<style scoped>
.countdown { text-align:center;padding:14px;border-radius:8px;margin-bottom:14px; }
.countdown.green { background:#f6ffed;color:#52c41a;border:1px solid #b7eb8f; }
.countdown.orange { background:#fffbe6;color:#d48806;border:1px solid #ffe58f; }
.countdown.red { background:#fff2f0;color:#cf1322;border:1px solid #ffccc7; }
</style>
