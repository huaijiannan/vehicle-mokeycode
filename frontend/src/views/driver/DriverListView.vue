<template>
  <div>
    <el-card>
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:16px;font-weight:bold">驾驶员信息管理</span>
          <el-button type="primary" @click="handleAdd">新增驾驶员</el-button>
        </div>
      </template>
      <el-form :inline="true" :model="filters" style="margin-bottom:16px">
        <el-form-item label="关键字">
          <el-input v-model="filters.keyword" placeholder="姓名/工号/驾驶证号" clearable @clear="fetchData" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable @change="fetchData">
            <el-option label="空闲" value="空闲" />
            <el-option label="出车中" value="出车中" />
            <el-option label="暂停出车" value="暂停出车" />
          </el-select>
        </el-form-item>
        <el-form-item label="准驾车型">
          <el-select v-model="filters.license_class" placeholder="全部" clearable @change="fetchData">
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
            <el-option label="B1" value="B1" />
            <el-option label="B2" value="B2" />
            <el-option label="C1" value="C1" />
            <el-option label="C2" value="C2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">搜索</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="employee_id" label="工号" width="130" />
        <el-table-column prop="real_name" label="姓名" width="100" />
        <el-table-column label="三龄" width="200">
          <template #default="{ row }">
            <el-tag size="small" type="info" style="margin-right:4px">驾龄{{ row.driving_age || '-' }}</el-tag>
            <el-tag size="small" style="margin-right:4px">工龄{{ row.work_age || '-' }}</el-tag>
            <el-tag size="small" type="warning">年龄{{ row.age || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="license_class" label="准驾车型" width="90" />
        <el-table-column prop="license_valid_to" label="驾驶证有效期" width="120" />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="department_name" label="所属部门" width="140" />
        <el-table-column prop="quota_type" label="编制类型" width="90" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="focus_level" label="关注等级" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.focus_level === '重点关注'" type="danger" size="small">重点关注</el-tag>
            <el-tag v-else-if="row.focus_level === '退休预警'" type="warning" size="small">退休预警</el-tag>
            <span v-else style="color:#67c23a">正常</span>
          </template>
        </el-table-column>
        <el-table-column label="提醒" width="160">
          <template #default="{ row }">
            <el-tag v-if="row.training_overdue" type="warning" size="small" style="margin-right:4px">培训逾期</el-tag>
            <el-tag v-if="row.health_overdue" type="warning" size="small" style="margin-right:4px">体检逾期</el-tag>
            <el-tag v-if="row.license_overdue" type="danger" size="small">证照到期</el-tag>
            <span v-if="!row.training_overdue && !row.health_overdue && !row.license_overdue" style="color:#67c23a">无</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleDetail(row)">详情</el-button>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑驾驶员' : '新增驾驶员'" width="700px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-tabs>
          <el-tab-pane label="基本信息">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名" prop="real_name">
                  <el-input v-model="form.real_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别">
                  <el-select v-model="form.gender" style="width:100%">
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="出生日期">
                  <el-date-picker v-model="form.birth_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="电话" prop="phone">
                  <el-input v-model="form.phone" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="政治面貌">
                  <el-select v-model="form.political_status" style="width:100%">
                    <el-option label="中共党员" value="中共党员" />
                    <el-option label="群众" value="群众" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="编制类型">
                  <el-select v-model="form.quota_type" style="width:100%">
                    <el-option label="在编" value="在编" />
                    <el-option label="聘用" value="聘用" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="入职日期">
                  <el-date-picker v-model="form.hire_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属部门">
                  <el-input v-model="form.department_id" placeholder="部门ID" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="保密岗位">
                  <el-switch v-model="form.is_secret_post" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="保密等级" v-if="form.is_secret_post">
                  <el-select v-model="form.secret_level" style="width:100%">
                    <el-option label="秘密" value="秘密" />
                    <el-option label="机密" value="机密" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="驾驶证信息">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="驾驶证号">
                  <el-input v-model="form.license_number" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="准驾车型">
                  <el-select v-model="form.license_class" style="width:100%">
                    <el-option label="A1" value="A1" /><el-option label="A2" value="A2" />
                    <el-option label="B1" value="B1" /><el-option label="B2" value="B2" />
                    <el-option label="C1" value="C1" /><el-option label="C2" value="C2" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="初次领证日期">
                  <el-date-picker v-model="form.license_first_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发证机关">
                  <el-input v-model="form.license_authority" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="有效期起">
                  <el-date-picker v-model="form.license_valid_from" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="有效期止">
                  <el-date-picker v-model="form.license_valid_to" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
          <el-tab-pane label="从业资格证">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="资格证号">
                  <el-input v-model="form.qualification_number" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="资格类型">
                  <el-input v-model="form.qualification_type" placeholder="如：道路旅客运输" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="有效期起">
                  <el-date-picker v-model="form.qualification_valid_from" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="有效期止">
                  <el-date-picker v-model="form.qualification_valid_to" type="date" style="width:100%" value-format="YYYY-MM-DD" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
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
import { ElMessage } from 'element-plus'
import { getDrivers, createDriver, updateDriver } from '@/api/driver'

const router = useRouter()
const list = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)
const formRef = ref()

const filters = reactive({ keyword: '', status: '', license_class: '' })

const defaultForm = {
  real_name: '', gender: '男', birth_date: '', phone: '', political_status: '群众',
  quota_type: '在编', hire_date: '', department_id: null, is_secret_post: 0, secret_level: '',
  license_number: '', license_class: 'C1', license_first_date: '', license_valid_from: '',
  license_valid_to: '', license_authority: '', qualification_number: '', qualification_type: '',
  qualification_valid_from: '', qualification_valid_to: ''
}
const form = reactive({ ...defaultForm })

const rules = {
  real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话', trigger: 'blur' }]
}

const statusTagType = (s) => ({ '空闲': 'success', '出车中': 'primary', '暂停出车': 'danger' }[s] || 'info')

onMounted(() => fetchData())

async function fetchData() {
  loading.value = true
  try {
    const data = await getDrivers(filters)
    list.value = Array.isArray(data) ? data : []
  } catch (e) {
    ElMessage.error('加载驾驶员列表失败')
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  editId.value = null
  Object.assign(form, JSON.parse(JSON.stringify(defaultForm)))
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    real_name: row.real_name || '', gender: row.gender || '男', birth_date: row.birth_date || '',
    phone: row.phone || '', political_status: row.political_status || '群众',
    quota_type: row.quota_type || '在编', hire_date: row.hire_date || '',
    department_id: row.department_id, is_secret_post: row.is_secret_post || 0,
    secret_level: row.secret_level || '', license_number: row.license_number || '',
    license_class: row.license_class || 'C1', license_first_date: row.license_first_date || '',
    license_valid_from: row.license_valid_from || '', license_valid_to: row.license_valid_to || '',
    license_authority: row.license_authority || '', qualification_number: row.qualification_number || '',
    qualification_type: row.qualification_type || '', qualification_valid_from: row.qualification_valid_from || '',
    qualification_valid_to: row.qualification_valid_to || ''
  })
  dialogVisible.value = true
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const data = { ...form }
    Object.keys(data).forEach(k => { if (data[k] === '' || data[k] === null) delete data[k] })
    if (isEdit.value) {
      await updateDriver(editId.value, data)
      ElMessage.success('更新成功')
    } else {
      await createDriver(data)
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
  router.push(`/driver/detail/${row.id}`)
}
</script>
