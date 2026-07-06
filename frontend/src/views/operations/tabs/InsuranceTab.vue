<template>
  <div style="max-height:50vh;overflow-y:auto">
    <el-button type="primary" size="small" style="margin-bottom:12px" @click="openForm">+ 新增保险</el-button>

    <el-table :data="records" size="small" stripe v-if="records.length">
      <el-table-column prop="insurance_company" label="保险公司" width="140" />
      <el-table-column prop="insurance_type" label="险种" width="100" />
      <el-table-column prop="policy_number" label="保单号" min-width="160" />
      <el-table-column prop="coverage_amount" label="保额" width="100"><template #default="{ row }">{{ row.coverage_amount?.toLocaleString() }}</template></el-table-column>
      <el-table-column prop="premium" label="保费" width="80" />
      <el-table-column prop="effective_date" label="生效日" width="100" />
      <el-table-column prop="expiry_date" label="到期日" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : row.status === 'expiring' ? 'warning' : 'danger'" size="small">{{ row.status === 'active' ? '生效中' : row.status === 'expiring' ? '即将到期' : '已过期' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button v-if="row.status !== 'active'" type="success" size="small" @click="handleRenew(row)">续保</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-else style="text-align:center;padding:32px;color:#bbb;font-size:13px">暂无保险记录</div>

    <el-dialog v-model="formVisible" title="新增保险记录" width="500px" append-to-body>
      <el-form :model="form" label-width="90px" size="small">
        <el-form-item label="保险公司" required><el-input v-model="form.insurance_company" /></el-form-item>
        <el-form-item label="险种" required>
          <el-select v-model="form.insurance_type" style="width:100%">
            <el-option label="交强险" value="交强险" /><el-option label="商业险" value="商业险" />
          </el-select>
        </el-form-item>
        <el-form-item label="保单号" required><el-input v-model="form.policy_number" /></el-form-item>
        <el-form-item label="保险金额"><el-input-number v-model="form.coverage_amount" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="保费"><el-input-number v-model="form.premium" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="生效日期" required><el-date-picker v-model="form.effective_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="到期日期" required><el-date-picker v-model="form.expiry_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="formVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button></template>
    </el-dialog>

    <el-dialog v-model="renewVisible" title="续保登记" width="500px" append-to-body>
      <el-form :model="renewForm" label-width="90px" size="small">
        <el-form-item label="保险公司" required><el-input v-model="renewForm.insurance_company" /></el-form-item>
        <el-form-item label="险种" required><el-select v-model="renewForm.insurance_type" style="width:100%"><el-option label="交强险" value="交强险" /><el-option label="商业险" value="商业险" /></el-select></el-form-item>
        <el-form-item label="保单号" required><el-input v-model="renewForm.policy_number" /></el-form-item>
        <el-form-item label="保险金额"><el-input-number v-model="renewForm.coverage_amount" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="保费"><el-input-number v-model="renewForm.premium" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="生效日期" required><el-date-picker v-model="renewForm.effective_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="到期日期" required><el-date-picker v-model="renewForm.expiry_date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="renewVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitRenew">确定续保</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getInsuranceRecords, addInsuranceRecord, renewInsurance } from '@/api/operations'

const props = defineProps({ vehicleId: { type: Number, required: true } })

const records = ref([])
const formVisible = ref(false)
const renewVisible = ref(false)
const submitting = ref(false)

const form = reactive({ insurance_company: '', insurance_type: '交强险', policy_number: '', coverage_amount: null, premium: null, effective_date: '', expiry_date: '' })
const renewForm = reactive({ insurance_company: '', insurance_type: '交强险', policy_number: '', coverage_amount: null, premium: null, effective_date: '', expiry_date: '' })

async function loadData() {
  try {
    const data = await getInsuranceRecords(props.vehicleId)
    records.value = data.records || []
  } catch (e) { ElMessage.error('加载保险记录失败') }
}

function openForm() {
  Object.assign(form, { insurance_company: '', insurance_type: '交强险', policy_number: '', coverage_amount: null, premium: null, effective_date: '', expiry_date: '' })
  formVisible.value = true
}

async function submitForm() {
  if (!form.insurance_company || !form.insurance_type || !form.policy_number || !form.effective_date || !form.expiry_date) return ElMessage.warning('请填写必填项')
  submitting.value = true
  try {
    await addInsuranceRecord(props.vehicleId, { ...form })
    ElMessage.success('添加成功')
    formVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.response?.data?.error || '添加失败') }
  finally { submitting.value = false }
}

function handleRenew(row) {
  Object.assign(renewForm, { insurance_company: row.insurance_company, insurance_type: row.insurance_type, policy_number: '', coverage_amount: row.coverage_amount, premium: row.premium, effective_date: row.expiry_date, expiry_date: '' })
  renewVisible.value = true
}

async function submitRenew() {
  if (!renewForm.policy_number || !renewForm.effective_date || !renewForm.expiry_date) return ElMessage.warning('请填写必填项')
  submitting.value = true
  try {
    await renewInsurance(props.vehicleId, { ...renewForm })
    ElMessage.success('续保成功')
    renewVisible.value = false
    loadData()
  } catch (e) { ElMessage.error(e.response?.data?.error || '续保失败') }
  finally { submitting.value = false }
}

onMounted(loadData)
</script>
