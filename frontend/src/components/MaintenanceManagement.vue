<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { MaintenanceRecord } from '../types/vehicle'

const emit = defineEmits<{
  submit: [record: Omit<MaintenanceRecord, 'id' | 'vehicleId'>]
}>()

const formRef = ref<FormInstance>()
const form = reactive<Omit<MaintenanceRecord, 'id' | 'vehicleId'>>({
  workshopName: '',
  type: 'routine',
  description: '',
  items: [],
  cost: 0,
  odometer: 0,
  startTime: '',
  endTime: '',
  status: 'pending',
})

const rules: FormRules = {
  workshopName: [{ required: true, message: '请选择维修厂', trigger: 'change' }],
  type: [{ required: true, message: '请选择维保类型', trigger: 'change' }],
  cost: [
    { required: true, message: '请输入费用', trigger: 'blur' },
    { type: 'number', min: 0, message: '费用必须大于等于0', trigger: 'blur' },
  ],
  odometer: [{ required: true, message: '请输入当前里程', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
}

const mockWorkshops = [
  '顺达汽车维修中心',
  '安信4S店',
  '快捷汽修连锁',
  '宏达轮胎专修',
  '鑫源汽车养护中心',
]

const maintenanceItems = [
  '更换机油机滤',
  '更换空气滤芯',
  '更换刹车片',
  '更换轮胎',
  '四轮定位',
  '更换火花塞',
  '更换变速箱油',
  '更换冷却液',
  '更换雨刮片',
  '空调清洗',
  '车身喷漆',
  '更换电瓶',
  '底盘检修',
  '发动机检修',
]

function resetForm() {
  formRef.value?.resetFields()
  form.workshopName = ''
  form.type = 'routine'
  form.description = ''
  form.items = []
  form.cost = 0
  form.odometer = 0
  form.startTime = ''
  form.endTime = ''
  form.status = 'pending'
}

function handleSubmit() {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', { ...form })
      ElMessage.success('维修保养记录录入成功')
      resetForm()
    }
  })
}

defineExpose({ resetForm })
</script>

<template>
  <div class="maintenance-management">
    <el-alert
      title="维修保养记录录入"
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
        <el-col :span="8">
          <el-form-item label="维修厂" prop="workshopName">
            <el-select v-model="form.workshopName" placeholder="请选择维修厂" style="width: 100%" filterable>
              <el-option
                v-for="w in mockWorkshops"
                :key="w"
                :label="w"
                :value="w"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="维保类型" prop="type">
            <el-select v-model="form.type" placeholder="请选择维保类型" style="width: 100%">
              <el-option label="常规保养" value="routine" />
              <el-option label="故障维修" value="repair" />
              <el-option label="大修" value="overhaul" />
              <el-option label="紧急救援" value="emergency" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="当前里程(km)" prop="odometer">
            <el-input-number v-model="form.odometer" :min="0" :step="100" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="维保项目" prop="items">
        <el-checkbox-group v-model="form.items">
          <el-checkbox
            v-for="item in maintenanceItems"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="问题描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请描述车辆故障现象或保养需求"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="维保费用(元)" prop="cost">
            <el-input-number v-model="form.cost" :precision="2" :min="0" :step="100" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="维修开始时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="维修结束时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交维保记录</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.maintenance-management {
  padding: 4px 0;
}
</style>
