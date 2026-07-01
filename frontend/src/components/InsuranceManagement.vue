<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { InsuranceClaim } from '../types/vehicle'

const emit = defineEmits<{
  submit: [record: Omit<InsuranceClaim, 'id' | 'vehicleId'>]
}>()

const formRef = ref<FormInstance>()
const form = reactive<Omit<InsuranceClaim, 'id' | 'vehicleId'>>({
  insuranceId: '',
  claimNumber: '',
  accidentTime: '',
  accidentType: '',
  accidentLocation: '',
  description: '',
  claimedAmount: 0,
  settledAmount: 0,
  status: 'reported',
})

const rules: FormRules = {
  insuranceId: [{ required: true, message: '请选择关联保单', trigger: 'change' }],
  accidentTime: [{ required: true, message: '请选择出险时间', trigger: 'change' }],
  accidentType: [{ required: true, message: '请选择事故类型', trigger: 'change' }],
  accidentLocation: [{ required: true, message: '请输入事故地点', trigger: 'blur' }],
  description: [{ required: true, message: '请描述事故情况', trigger: 'blur' }],
  claimedAmount: [
    { required: true, message: '请输入理赔金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额必须大于等于0', trigger: 'blur' },
  ],
}

const mockPolicies = [
  { id: 'BX-20240001', label: 'BX-20240001 交强险 (2024.01-2024.12)' },
  { id: 'BX-20240002', label: 'BX-20240002 商业险 (2024.01-2024.12)' },
  { id: 'BX-20240003', label: 'BX-20240003 车损险 (2024.03-2025.03)' },
]

const accidentTypes = [
  '追尾事故',
  '剐蹭事故',
  '单方事故',
  '碰撞固定物',
  '涉水事故',
  '自燃事故',
  '盗抢事故',
  '玻璃单独破碎',
  '自然灾害',
]

function resetForm() {
  formRef.value?.resetFields()
  form.insuranceId = ''
  form.claimNumber = ''
  form.accidentTime = ''
  form.accidentType = ''
  form.accidentLocation = ''
  form.description = ''
  form.claimedAmount = 0
  form.settledAmount = 0
  form.status = 'reported'
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
      ElMessage.success('保险理赔记录录入成功')
      resetForm()
    }
  })
}

defineExpose({ resetForm })
</script>

<template>
  <div class="insurance-management">
    <el-alert
      title="保险理赔记录录入"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      status-icon
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="关联保单" prop="insuranceId">
            <el-select v-model="form.insuranceId" placeholder="请选择关联保单" style="width: 100%">
              <el-option
                v-for="p in mockPolicies"
                :key="p.id"
                :label="p.label"
                :value="p.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="报案号" prop="claimNumber">
            <el-input v-model="form.claimNumber" placeholder="保险公司报案号（选填）" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="出险时间" prop="accidentTime">
            <el-date-picker
              v-model="form.accidentTime"
              type="datetime"
              placeholder="选择出险时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="事故类型" prop="accidentType">
            <el-select v-model="form.accidentType" placeholder="请选择事故类型" style="width: 100%">
              <el-option
                v-for="t in accidentTypes"
                :key="t"
                :label="t"
                :value="t"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="理赔状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <el-option label="已报案" value="reported" />
              <el-option label="定损中" value="assessing" />
              <el-option label="已结案" value="settled" />
              <el-option label="已关闭" value="closed" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="事故地点" prop="accidentLocation">
        <el-input v-model="form.accidentLocation" placeholder="请输入事故发生地点" />
      </el-form-item>

      <el-form-item label="事故描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请描述事故发生经过及车辆受损情况"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="申请理赔额(元)" prop="claimedAmount">
            <el-input-number v-model="form.claimedAmount" :precision="2" :min="0" :step="1000" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="实际赔付额(元)" prop="settledAmount">
            <el-input-number v-model="form.settledAmount" :precision="2" :min="0" :step="1000" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交理赔记录</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.insurance-management {
  padding: 4px 0;
}
</style>
