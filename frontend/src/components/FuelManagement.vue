<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FuelRecord } from '../types/vehicle'

const emit = defineEmits<{
  submit: [record: Omit<FuelRecord, 'id' | 'vehicleId'>]
}>()

const formRef = ref<FormInstance>()
const form = reactive<Omit<FuelRecord, 'id' | 'vehicleId'>>({
  cardNumber: '',
  fuelType: '92#',
  amount: 0,
  pricePerLiter: 0,
  liters: 0,
  odometer: 0,
  station: '',
  driverName: '',
  refuelTime: '',
})

const rules: FormRules = {
  cardNumber: [{ required: true, message: '请选择加油卡号', trigger: 'change' }],
  fuelType: [{ required: true, message: '请选择油品类型', trigger: 'change' }],
  amount: [
    { required: true, message: '请输入加油金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '金额必须大于0', trigger: 'blur' },
  ],
  pricePerLiter: [
    { required: true, message: '请输入当日油价', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '油价必须大于0', trigger: 'blur' },
  ],
  liters: [
    { required: true, message: '请输入加油升数', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '升数必须大于0', trigger: 'blur' },
  ],
  odometer: [
    { required: true, message: '请输入当前里程表读数', trigger: 'blur' },
    { type: 'number', min: 0, message: '里程必须大于等于0', trigger: 'blur' },
  ],
  station: [{ required: true, message: '请输入加油站名称', trigger: 'blur' }],
  driverName: [{ required: true, message: '请选择驾驶员', trigger: 'change' }],
  refuelTime: [{ required: true, message: '请选择加油时间', trigger: 'change' }],
}

const mockCards = ['ZYK-20240001', 'ZYK-20240002', 'ZYK-20240003']
const mockDrivers = ['张三', '李四', '王五']

function handlePriceAmountChange() {
  if (form.pricePerLiter > 0 && form.amount > 0) {
    form.liters = Math.round((form.amount / form.pricePerLiter) * 100) / 100
  }
}

interface Exposure extends Record<string, unknown> {
  cardNumber: string
  fuelType: string
  amount: string
  pricePerLiter: string
  liters: string
  odometer: string
  station: string
  driverName: string
  refuelTime: string
}

function resetForm() {
  formRef.value?.resetFields()
  form.cardNumber = ''
  form.fuelType = '92#'
  form.amount = 0
  form.pricePerLiter = 0
  form.liters = 0
  form.odometer = 0
  form.station = ''
  form.driverName = ''
  form.refuelTime = ''
}

function handleSubmit(exposure: Exposure) {
  formRef.value?.validate((valid) => {
    if (valid) {
      emit('submit', {
        ...form,
        refuelTime: exposure.refuelTime || form.refuelTime
      })
      ElMessage.success('加油记录录入成功')
      resetForm()
    }
  })
}

defineExpose({ resetForm })
</script>

<template>
  <div class="fuel-management">
    <el-alert
      title="加油记录录入"
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
          <el-form-item label="加油卡号" prop="cardNumber">
            <el-select v-model="form.cardNumber" placeholder="请选择加油卡号" style="width: 100%">
              <el-option
                v-for="card in mockCards"
                :key="card"
                :label="card"
                :value="card"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="油品类型" prop="fuelType">
            <el-select v-model="form.fuelType" placeholder="请选择油品" style="width: 100%">
              <el-option label="92# 汽油" value="92#" />
              <el-option label="95# 汽油" value="95#" />
              <el-option label="98# 汽油" value="98#" />
              <el-option label="0# 柴油" value="0#柴油" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="驾驶员" prop="driverName">
            <el-select v-model="form.driverName" placeholder="请选择驾驶员" style="width: 100%">
              <el-option
                v-for="driver in mockDrivers"
                :key="driver"
                :label="driver"
                :value="driver"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="加油金额(元)" prop="amount">
            <el-input-number
              v-model="form.amount"
              :precision="2"
              :min="0"
              :step="100"
              placeholder="加油金额"
              style="width: 100%"
              @change="handlePriceAmountChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="当日油价(元/L)" prop="pricePerLiter">
            <el-input-number
              v-model="form.pricePerLiter"
              :precision="2"
              :min="0"
              :step="0.1"
              placeholder="当日油价"
              style="width: 100%"
              @change="handlePriceAmountChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="加油升数(L)" prop="liters">
            <el-input-number
              v-model="form.liters"
              :precision="2"
              :min="0"
              placeholder="自动计算"
              style="width: 100%"
              readonly
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="当前里程(km)" prop="odometer">
            <el-input-number
              v-model="form.odometer"
              :min="0"
              :step="100"
              placeholder="里程表读数"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="加油站" prop="station">
            <el-input v-model="form.station" placeholder="请输入加油站名称" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="加油时间" prop="refuelTime">
            <el-date-picker
              v-model="form.refuelTime"
              type="datetime"
              placeholder="选择加油时间"
              style="width: 100%"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交加油记录</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.fuel-management {
  padding: 4px 0;
}
</style>
