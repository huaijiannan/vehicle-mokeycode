<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:16px;font-weight:bold">车辆档案管理</span>
          <el-button type="primary" @click="handleAdd">新增车辆</el-button>
        </div>
      </template>
      <el-form :inline="true" :model="filters" style="margin-bottom:16px">
        <el-form-item label="车牌号">
          <el-input v-model="filters.keyword" placeholder="车牌号/品牌" clearable @clear="fetchData" />
        </el-form-item>
        <el-form-item label="车辆类型">
          <el-select v-model="filters.type" placeholder="全部" clearable @change="fetchData">
            <el-option label="轿车" value="轿车" />
            <el-option label="SUV" value="SUV" />
            <el-option label="商务车" value="商务车" />
            <el-option label="中型客车" value="中型客车" />
            <el-option label="大型客车" value="大型客车" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable @change="fetchData">
            <el-option label="空闲" value="空闲" />
            <el-option label="出车中" value="出车中" />
            <el-option label="维修中" value="维修中" />
            <el-option label="报废" value="报废" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="plate_number" label="车牌号" width="120" />
        <el-table-column prop="brand_model" label="品牌型号" min-width="180" />
        <el-table-column prop="vehicle_type" label="车辆类型" width="100" />
        <el-table-column prop="fuel_type" label="燃油类型" width="90" />
        <el-table-column prop="seat_count" label="座位数" width="80" />
        <el-table-column prop="mileage" label="里程(km)" width="100" />
        <el-table-column prop="status" label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department_name" label="所属部门" width="140" />
        <el-table-column prop="inspection_due" label="年检到期" width="110" />
        <el-table-column prop="insurance_due" label="保险到期" width="110" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑车辆' : '新增车辆'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车牌号" prop="plate_number">
              <el-input v-model="form.plate_number" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌型号" prop="brand_model">
              <el-input v-model="form.brand_model" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="车辆类型" prop="vehicle_type">
              <el-select v-model="form.vehicle_type" style="width:100%">
                <el-option label="轿车" value="轿车" />
                <el-option label="SUV" value="SUV" />
                <el-option label="商务车" value="商务车" />
                <el-option label="中型客车" value="中型客车" />
                <el-option label="大型客车" value="大型客车" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="燃油类型">
              <el-select v-model="form.fuel_type" style="width:100%">
                <el-option label="汽油" value="汽油" />
                <el-option label="柴油" value="柴油" />
                <el-option label="电动" value="电动" />
                <el-option label="混合动力" value="混合动力" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排量(L)">
              <el-input-number v-model="form.engine_displacement" :min="0" :precision="1" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="座位数">
              <el-input-number v-model="form.seat_count" :min="1" :max="60" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="购置日期">
              <el-date-picker v-model="form.purchase_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="购置价格">
              <el-input-number v-model="form.purchase_price" :min="0" :precision="2" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="颜色">
              <el-input v-model="form.color" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排放标准">
              <el-select v-model="form.emission_standard" style="width:100%">
                <el-option label="国VI" value="国VI" />
                <el-option label="国V" value="国V" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="编制类型">
              <el-select v-model="form.quota_type" style="width:100%">
                <el-option label="一般公务用车" value="一般公务用车" />
                <el-option label="机要通信用车" value="机要通信用车" />
                <el-option label="应急保障用车" value="应急保障用车" />
                <el-option label="特种专业技术用车" value="特种专业技术用车" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用年限">
              <el-input-number v-model="form.service_life" :min="1" :max="15" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/api/vehicle'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref()

const filters = reactive({ keyword: '', type: '', status: '' })

const form = reactive({
  plate_number: '', brand_model: '', vehicle_type: '轿车', fuel_type: '汽油',
  engine_displacement: null, seat_count: 5, purchase_date: '', purchase_price: null,
  color: '', emission_standard: '国VI', service_life: 10, quota_type: '一般公务用车', remark: ''
})

const rules = {
  plate_number: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  brand_model: [{ required: true, message: '请输入品牌型号', trigger: 'blur' }],
  vehicle_type: [{ required: true, message: '请选择车辆类型', trigger: 'change' }]
}

const statusType = (s) => ({ '空闲': 'success', '出车中': 'primary', '维修中': 'warning', '报废': 'info' }[s] || 'info')

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const data = await getVehicles(filters)
    list.value = Array.isArray(data) ? data : []
  } catch (e) {
    ElMessage.error('加载车辆列表失败')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    plate_number: '', brand_model: '', vehicle_type: '轿车', fuel_type: '汽油',
    engine_displacement: null, seat_count: 5, purchase_date: '', purchase_price: null,
    color: '', emission_standard: '国VI', service_life: 10, quota_type: '一般公务用车', remark: ''
  })
}

function handleAdd() {
  isEdit.value = false
  editId.value = null
  resetForm()
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    plate_number: row.plate_number, brand_model: row.brand_model, vehicle_type: row.vehicle_type,
    fuel_type: row.fuel_type, engine_displacement: row.engine_displacement, seat_count: row.seat_count,
    purchase_date: row.purchase_date, purchase_price: row.purchase_price, color: row.color,
    emission_standard: row.emission_standard, service_life: row.service_life,
    quota_type: row.quota_type, remark: row.remark || ''
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const data = { ...form }
    if (!data.purchase_date) delete data.purchase_date
    if (isEdit.value) {
      await updateVehicle(editId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createVehicle(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  } finally {
    submitting.value = false
  }
}

function handleDetail(row) {
  router.push(`/vehicle/detail/${row.id}`)
}

async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确认删除车辆 ${row.plate_number}？`, '确认', { type: 'warning' })
    await deleteVehicle(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (e) { /* cancel */ }
}
</script>
