<template>
  <div v-loading="loading">
    <el-page-header @back="router.back()" title="返回">
      <template #content>
        <span style="font-size:16px;font-weight:bold">驾驶员详情 - {{ driver?.real_name }}</span>
      </template>
    </el-page-header>

    <el-tabs v-model="activeTab" style="margin-top:16px" v-if="driver">
      <el-tab-pane label="基本信息" name="info">
        <el-card>
          <el-descriptions title="基础档案" :column="3" border>
            <el-descriptions-item label="工号">{{ driver.employee_id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ driver.real_name }}</el-descriptions-item>
            <el-descriptions-item label="性别">{{ driver.gender }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ driver.phone }}</el-descriptions-item>
            <el-descriptions-item label="出生日期">{{ driver.birth_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="政治面貌">{{ driver.political_status || '-' }}</el-descriptions-item>
            <el-descriptions-item label="编制类型">{{ driver.quota_type || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入职日期">{{ driver.hire_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="所属部门">{{ driver.department_name || '-' }}</el-descriptions-item>
            <el-descriptions-item label="驾龄">
              <el-tag size="small" type="info">{{ driver.driving_age || '-' }}年</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="工龄">
              <el-tag size="small">{{ driver.work_age || '-' }}年</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="年龄">
              <el-tag size="small" type="warning">{{ driver.age || '-' }}岁</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="保密岗位">{{ driver.is_secret_post ? '是' : '否' }}</el-descriptions-item>
            <el-descriptions-item label="保密等级">{{ driver.secret_level || '-' }}</el-descriptions-item>
            <el-descriptions-item label="出车状态">
              <el-tag :type="statusTagType(driver.status)">{{ driver.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="关注等级">
              <el-tag v-if="driver.focus_level === '重点关注'" type="danger">{{ driver.focus_level }}</el-tag>
              <el-tag v-else-if="driver.focus_level === '退休预警'" type="warning">{{ driver.focus_level }}</el-tag>
              <span v-else style="color:#67c23a">正常</span>
            </el-descriptions-item>
            <el-descriptions-item label="当前提醒">
              <el-tag v-if="driver.training_overdue" type="warning" size="small" style="margin-right:4px">培训逾期</el-tag>
              <el-tag v-if="driver.health_overdue" type="warning" size="small" style="margin-right:4px">体检逾期</el-tag>
              <el-tag v-if="driver.license_overdue" type="danger" size="small">证照到期</el-tag>
              <span v-if="!driver.training_overdue && !driver.health_overdue && !driver.license_overdue" style="color:#67c23a">无</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="证照信息" name="certs">
        <el-card style="margin-bottom:16px">
          <template #header><span style="font-weight:bold">驾驶证</span></template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="驾驶证号">{{ driver.license_number || '-' }}</el-descriptions-item>
            <el-descriptions-item label="准驾车型">{{ driver.license_class || '-' }}</el-descriptions-item>
            <el-descriptions-item label="初次领证日期">{{ driver.license_first_date || '-' }}</el-descriptions-item>
            <el-descriptions-item label="有效期起">{{ driver.license_valid_from || '-' }}</el-descriptions-item>
            <el-descriptions-item label="有效期止">{{ driver.license_valid_to || '-' }}</el-descriptions-item>
            <el-descriptions-item label="发证机关">{{ driver.license_authority || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <el-card>
          <template #header><span style="font-weight:bold">从业资格证</span></template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="资格证号">{{ driver.qualification_number || '-' }}</el-descriptions-item>
            <el-descriptions-item label="资格类型">{{ driver.qualification_type || '-' }}</el-descriptions-item>
            <el-descriptions-item label="有效期起">{{ driver.qualification_valid_from || '-' }}</el-descriptions-item>
            <el-descriptions-item label="有效期止">{{ driver.qualification_valid_to || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="培训履历" name="trainings">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:bold">培训记录</span>
              <el-button type="primary" size="small" @click="showTrainingDialog = true">录入培训</el-button>
            </div>
          </template>
          <el-timeline v-if="driver.trainings && driver.trainings.length > 0">
            <el-timeline-item
              v-for="t in driver.trainings" :key="t.id"
              :timestamp="t.training_date"
              :color="t.assessment_result === '不合格' ? '#f56c6c' : '#409eff'"
            >
              <p><strong>{{ t.training_type }}</strong> | {{ t.duration }}小时 | 讲师: {{ t.trainer || '-' }}</p>
              <p>考核结果: <el-tag :type="t.assessment_result === '合格' ? 'success' : 'danger'" size="small">{{ t.assessment_result || '-' }}</el-tag></p>
              <p v-if="t.content" style="color:#666;font-size:13px">{{ t.content }}</p>
            </el-timeline-item>
          </el-timeline>
          <div v-else style="text-align:center;color:#999;padding:40px">暂无培训记录</div>
        </el-card>

        <el-dialog v-model="showTrainingDialog" title="录入培训记录" width="500px">
          <el-form ref="trainingFormRef" :model="trainingForm" :rules="trainingRules" label-width="90px">
            <el-form-item label="培训日期" prop="training_date">
              <el-date-picker v-model="trainingForm.training_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="培训类型" prop="training_type">
              <el-select v-model="trainingForm.training_type" style="width:100%">
                <el-option label="安全驾驶" value="安全驾驶" />
                <el-option label="礼仪规范" value="礼仪规范" />
                <el-option label="保密教育" value="保密教育" />
                <el-option label="车辆维护" value="车辆维护" />
                <el-option label="法规政策" value="法规政策" />
              </el-select>
            </el-form-item>
            <el-form-item label="培训时长(小时)">
              <el-input-number v-model="trainingForm.duration" :min="0" :precision="1" style="width:100%" />
            </el-form-item>
            <el-form-item label="考核结果">
              <el-select v-model="trainingForm.assessment_result" style="width:100%">
                <el-option label="合格" value="合格" />
                <el-option label="不合格" value="不合格" />
              </el-select>
            </el-form-item>
            <el-form-item label="培训内容">
              <el-input v-model="trainingForm.content" type="textarea" :rows="3" />
            </el-form-item>
            <el-form-item label="讲师">
              <el-input v-model="trainingForm.trainer" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showTrainingDialog = false">取消</el-button>
            <el-button type="primary" :loading="submittingTraining" @click="submitTraining">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="违章记录" name="violations">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:bold">违章记录</span>
              <div>
                <el-tag v-if="violationStats.count >= 3" type="danger" style="margin-right:8px">
                  12个月内{{ violationStats.count }}次违章 - 重点关注
                </el-tag>
                <el-button type="primary" size="small" @click="showViolationDialog = true">录入违章</el-button>
              </div>
            </div>
          </template>
          <el-table :data="driver.violations || []" border v-if="driver.violations && driver.violations.length > 0">
            <el-table-column prop="violation_date" label="日期" width="110" />
            <el-table-column prop="violation_type" label="违章类型" width="120" />
            <el-table-column prop="location" label="地点" width="150" />
            <el-table-column prop="description" label="行为描述" min-width="180" />
            <el-table-column prop="penalty" label="处罚结果" width="140" />
            <el-table-column prop="points_deducted" label="扣分" width="70" />
            <el-table-column label="是否处理" width="90">
              <template #default="{ row }">
                <el-tag :type="row.is_processed ? 'success' : 'warning'" size="small">
                  {{ row.is_processed ? '已处理' : '未处理' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-else style="text-align:center;color:#999;padding:40px">暂无违章记录</div>
        </el-card>

        <el-dialog v-model="showViolationDialog" title="录入违章记录" width="500px">
          <el-form ref="violationFormRef" :model="violationForm" :rules="violationRules" label-width="90px">
            <el-form-item label="违章日期" prop="violation_date">
              <el-date-picker v-model="violationForm.violation_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="违章类型" prop="violation_type">
              <el-select v-model="violationForm.violation_type" style="width:100%">
                <el-option label="超速行驶" value="超速行驶" />
                <el-option label="闯红灯" value="闯红灯" />
                <el-option label="违停" value="违停" />
                <el-option label="逆行" value="逆行" />
                <el-option label="未系安全带" value="未系安全带" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="地点">
              <el-input v-model="violationForm.location" />
            </el-form-item>
            <el-form-item label="行为描述">
              <el-input v-model="violationForm.description" type="textarea" :rows="2" />
            </el-form-item>
            <el-form-item label="处罚结果">
              <el-input v-model="violationForm.penalty" />
            </el-form-item>
            <el-form-item label="扣分">
              <el-input-number v-model="violationForm.points_deducted" :min="0" :max="12" style="width:100%" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showViolationDialog = false">取消</el-button>
            <el-button type="primary" :loading="submittingViolation" @click="submitViolation">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>

      <el-tab-pane label="体检记录" name="health">
        <el-card>
          <template #header>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:bold">体检记录</span>
              <el-button type="primary" size="small" @click="showHealthDialog = true">录入体检</el-button>
            </div>
          </template>
          <el-table :data="driver.healthChecks || []" border v-if="driver.healthChecks && driver.healthChecks.length > 0">
            <el-table-column prop="check_date" label="体检日期" width="110" />
            <el-table-column prop="institution" label="体检机构" width="180" />
            <el-table-column prop="conclusion" label="体检结论" width="120">
              <template #default="{ row }">
                <el-tag :type="row.is_qualified ? 'success' : 'danger'" size="small">{{ row.conclusion }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="follow_up" label="复查要求" min-width="160" />
            <el-table-column label="是否闭环" width="90">
              <template #default="{ row }">
                <el-tag :type="row.follow_up_done ? 'success' : 'warning'" size="small">
                  {{ row.follow_up_done ? '已闭环' : row.follow_up ? '未闭环' : '-' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div v-else style="text-align:center;color:#999;padding:40px">暂无体检记录</div>
        </el-card>

        <el-dialog v-model="showHealthDialog" title="录入体检记录" width="500px">
          <el-form ref="healthFormRef" :model="healthForm" :rules="healthRules" label-width="90px">
            <el-form-item label="体检日期" prop="check_date">
              <el-date-picker v-model="healthForm.check_date" type="date" style="width:100%" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="体检机构">
              <el-input v-model="healthForm.institution" />
            </el-form-item>
            <el-form-item label="体检结论" prop="conclusion">
              <el-select v-model="healthForm.conclusion" style="width:100%" @change="onConclusionChange">
                <el-option label="合格" value="合格" />
                <el-option label="不合格" value="不合格" />
                <el-option label="需复查" value="需复查" />
              </el-select>
            </el-form-item>
            <el-form-item label="复查要求" v-if="healthForm.conclusion !== '合格'">
              <el-input v-model="healthForm.follow_up" type="textarea" :rows="2" placeholder="请填写复查具体要求" />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="showHealthDialog = false">取消</el-button>
            <el-button type="primary" :loading="submittingHealth" @click="submitHealth">确定</el-button>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDriver, addTraining, addViolation, addHealthCheck } from '@/api/driver'

const route = useRoute()
const router = useRouter()
const driver = ref(null)
const loading = ref(false)
const activeTab = ref('info')

const showTrainingDialog = ref(false)
const showViolationDialog = ref(false)
const showHealthDialog = ref(false)

const submittingTraining = ref(false)
const submittingViolation = ref(false)
const submittingHealth = ref(false)

const trainingFormRef = ref()
const violationFormRef = ref()
const healthFormRef = ref()

const trainingForm = reactive({ training_date: '', training_type: '', duration: null, content: '', assessment_result: '', trainer: '' })
const violationForm = reactive({ violation_date: '', violation_type: '', location: '', description: '', penalty: '', points_deducted: 0 })
const healthForm = reactive({ check_date: '', institution: '', conclusion: '', follow_up: '' })

const trainingRules = {
  training_date: [{ required: true, message: '请选择培训日期' }],
  training_type: [{ required: true, message: '请选择培训类型' }]
}
const violationRules = {
  violation_date: [{ required: true, message: '请选择违章日期' }],
  violation_type: [{ required: true, message: '请选择违章类型' }]
}
const healthRules = {
  check_date: [{ required: true, message: '请选择体检日期' }],
  conclusion: [{ required: true, message: '请选择体检结论' }]
}

const violationStats = computed(() => {
  const violations = driver.value?.violations || []
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const count = violations.filter(v => new Date(v.violation_date) >= twelveMonthsAgo).length
  return { count }
})

const statusTagType = (s) => ({ '空闲': 'success', '出车中': 'primary', '暂停出车': 'danger' }[s] || 'info')

onMounted(async () => {
  loading.value = true
  try {
    driver.value = await getDriver(route.params.id)
  } catch (e) {
    ElMessage.error('加载驾驶员详情失败')
  } finally {
    loading.value = false
  }
})

function onConclusionChange(val) {
  if (val === '合格') healthForm.follow_up = ''
}

async function submitTraining() {
  const valid = await trainingFormRef.value.validate().catch(() => false)
  if (!valid) return
  submittingTraining.value = true
  try {
    const data = { ...trainingForm }
    const payload = { ...data }
    if (!payload.duration || payload.duration === '') payload.duration = null
    await addTraining(route.params.id, payload)
    ElMessage.success('培训记录已添加')
    showTrainingDialog.value = false
    driver.value = await getDriver(route.params.id)
    Object.assign(trainingForm, { training_date: '', training_type: '', duration: null, content: '', assessment_result: '', trainer: '' })
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  } finally {
    submittingTraining.value = false
  }
}

async function submitViolation() {
  const valid = await violationFormRef.value.validate().catch(() => false)
  if (!valid) return
  submittingViolation.value = true
  try {
    await addViolation(route.params.id, { ...violationForm })
    ElMessage.success('违章记录已添加')
    showViolationDialog.value = false
    driver.value = await getDriver(route.params.id)
    Object.assign(violationForm, { violation_date: '', violation_type: '', location: '', description: '', penalty: '', points_deducted: 0 })
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  } finally {
    submittingViolation.value = false
  }
}

async function submitHealth() {
  const valid = await healthFormRef.value.validate().catch(() => false)
  if (!valid) return
  submittingHealth.value = true
  try {
    const payload = {
      ...healthForm,
      is_qualified: healthForm.conclusion === '合格' ? 1 : 0
    }
    await addHealthCheck(route.params.id, payload)
    ElMessage.success('体检记录已添加')
    showHealthDialog.value = false
    driver.value = await getDriver(route.params.id)
    Object.assign(healthForm, { check_date: '', institution: '', conclusion: '', follow_up: '' })
  } catch (e) {
    ElMessage.error(e.response?.data?.error || '操作失败')
  } finally {
    submittingHealth.value = false
  }
}
</script>
