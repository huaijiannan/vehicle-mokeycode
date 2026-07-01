<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { InspectionRecord } from '../types/vehicle'

const emit = defineEmits<{
  submit: [record: Omit<InspectionRecord, 'id' | 'vehicleId'>]
}>()

const formRef = ref<FormInstance>()
const form = reactive<Omit<InspectionRecord, 'id' | 'vehicleId'>>({
  nextDueDate: '',
  lastInspectionDate: '',
  inspectionStation: '',
  result: undefined,
  cost: undefined,
  bookingDate: '',
  status: 'pending',
})

const rules: FormRules = {
  nextDueDate: [{ required: true, message: '请选择下次年检到期日', trigger: 'change' }],
  status: [{ required: true, message: '请选择年检状态', trigger: 'change' }],
}

const mockStations = [
  '北京市朝阳区机动车检测场',
  '上海市浦东新区车辆检测站',
  '广州市天河区机动车检测中心',
  '深圳市南山区车辆检测站',
  '成都市武侯区机动车检测站',
]

function resetForm() {
  formRef.value?.resetFields()
  form.nextDueDate = ''
  form.lastInspectionDate = ''
  form.inspectionStation = ''
  form.result = undefined
  form.cost = undefined
  form.bookingDate = ''
  form.status = 'pending'
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
      ElMessage.success('年检管理记录录入成功')
      resetForm()
    }
  })
}

defineExpose({ resetForm })
</script>

<template>
  <div class="inspection-management">
    <el-alert
      title="年检管理"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 20px"
    />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="140px"
      status-icon
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="年检状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio-button value="pending">待年检</el-radio-button>
              <el-radio-button value="booked">已预约</el-radio-button>
              <el-radio-button value="completed">已完成</el-radio-button>
              <el-radio-button value="overdue">已过期</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="下次年检到期日" prop="nextDueDate">
            <el-date-picker
              v-model="form.nextDueDate"
              type="date"
              placeholder="选择下次年检到期日"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="检测站" prop="inspectionStation">
            <el-select
              v-model="form.inspectionStation"
              placeholder="请选择检测站"
              style="width: 100%"
              filterable
              clearable
            >
              <el-option
                v-for="s in mockStations"
                :key="s"
                :label="s"
                :value="s"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预约检测日期" prop="bookingDate">
            <el-date-picker
              v-model="form.bookingDate"
              type="date"
              placeholder="选择预约检测日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="上次年检日期">
            <el-date-picker
              v-model="form.lastInspectionDate"
              type="date"
              placeholder="选择上次年检日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="检测结果" prop="result">
            <el-select v-model="form.result" placeholder="选择检测结果" style="width: 100%" clearable>
              <el-option label="合格" value="pass" />
              <el-option label="不合格" value="fail" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="检测费用(元)" prop="cost">
            <el-input-number v-model="form.cost" :precision="2" :min="0" :step="50" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交年检记录</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.inspection-management {
  padding: 4px 0;
}
</style>
