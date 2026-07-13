<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createApply, getFrequentRoutes } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()

const step = ref(0)
const showRoutePicker = ref(false)
const showDatetimePicker = ref(false)
const currentDateField = ref('')
const currentDateValue = ref([2026, 7, 9, 14, 0])

const form = reactive({
  purpose: '',
  origin: '',
  destination: '',
  departureTime: '',
  returnTime: '',
  passengerCount: 1,
  needDriver: 1,
  remark: ''
})

const frequentRoutes = ref([])

onMounted(async () => {
  try {
    const res = await getFrequentRoutes()
    frequentRoutes.value = res.data || []
  } catch {}
})

const stepLabels = ['基本信息', '行程信息', '确认提交']

function nextStep() {
  if (step.value === 0) {
    if (!form.purpose) { showToast('请填写用车事由'); return }
    if (!form.passengerCount) { showToast('请填写乘车人数'); return }
  }
  if (step.value === 1) {
    if (!form.origin || !form.destination) { showToast('请填写出发地和目的地'); return }
    if (!form.departureTime || !form.returnTime) { showToast('请选择时间'); return }
  }
  if (step.value < 2) {
    step.value++
  }
}

function prevStep() {
  if (step.value > 0) step.value--
}

function selectRoute(route) {
  form.origin = route.origin
  form.destination = route.destination
  showRoutePicker.value = false
}

function showDatePick(field) {
  currentDateField.value = field
  showDatetimePicker.value = true
}

function onDateConfirm({ selectedValues }) {
  const [y, m, d, h, min] = selectedValues
  const val = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')} ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`
  form[currentDateField.value] = val
  showDatetimePicker.value = false
}

function onDateCancel() {
  showDatetimePicker.value = false
}

async function onSubmit() {
  try {
    await createApply(form)
    showToast('申请提交成功')
    router.push('/m/home')
  } catch (e) {
    showToast(e.response?.data?.error || '提交失败')
  }
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="用车申请" left-text="返回" left-arrow @click-left="$router.back()" />
    <van-steps :active="step" class="steps">
      <van-step v-for="l in stepLabels" :key="l">{{ l }}</van-step>
    </van-steps>

    <div class="page-content">
      <van-form v-if="step === 0">
        <van-cell-group inset>
          <van-field v-model="form.purpose" label="用车事由" placeholder="请输入用车事由" required />
          <van-field v-model="form.passengerCount" label="乘车人数" placeholder="请输入人数" type="digit" required />
          <van-field name="needDriver" label="是否需要司机">
            <template #input>
              <van-radio-group v-model="form.needDriver" direction="horizontal">
                <van-radio :name="1">需要</van-radio>
                <van-radio :name="0">不需要</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field v-model="form.remark" label="备注" placeholder="选填" type="textarea" rows="2" autosize />
        </van-cell-group>
      </van-form>

      <van-form v-if="step === 1">
        <van-cell-group inset>
          <van-field v-model="form.origin" label="出发地" placeholder="请输入出发地" required readonly is-link @click="showRoutePicker = true" />
          <van-field v-model="form.destination" label="目的地" placeholder="请输入目的地" required readonly is-link @click="showRoutePicker = true" />
          <van-field v-model="form.departureTime" label="预计出发" placeholder="选择时间" required readonly is-link @click="showDatePick('departureTime')" />
          <van-field v-model="form.returnTime" label="预计返回" placeholder="选择时间" required readonly is-link @click="showDatePick('returnTime')" />
        </van-cell-group>
        <div class="route-quick">
          <div class="quick-title">常用路线</div>
          <div class="quick-list">
            <span v-for="r in frequentRoutes" :key="r.origin+r.destination" class="quick-tag" @click="selectRoute(r)">{{ r.origin }} - {{ r.destination }}</span>
          </div>
        </div>
      </van-form>

      <div v-if="step === 2" class="confirm-wrap">
        <van-cell-group inset>
          <van-cell title="用车事由" :value="form.purpose" />
          <van-cell title="乘车人数" :value="`${form.passengerCount}人`" />
          <van-cell title="是否需司机" :value="form.needDriver ? '需要' : '不需要'" />
          <van-cell title="出发地" :value="form.origin" />
          <van-cell title="目的地" :value="form.destination" />
          <van-cell title="预计出发" :value="form.departureTime" />
          <van-cell title="预计返回" :value="form.returnTime" />
          <van-cell v-if="form.remark" title="备注" :value="form.remark" />
        </van-cell-group>
        <div class="submit-wrap">
          <van-button round block type="primary" @click="onSubmit">提交申请</van-button>
        </div>
      </div>
    </div>

    <div class="step-btns" v-if="step < 2">
      <van-button v-if="step > 0" @click="prevStep" plain>上一步</van-button>
      <van-button type="primary" @click="nextStep" style="flex:1">下一步</van-button>
    </div>

    <van-popup v-model:show="showRoutePicker" position="bottom" round :style="{ height: '40%' }">
      <div class="popup-title">选择常用路线</div>
      <div class="popup-list">
        <div v-for="r in frequentRoutes" :key="r.origin+r.destination" class="popup-item" @click="selectRoute(r)">
          <span>{{ r.origin }} - {{ r.destination }}</span>
          <van-icon v-if="form.origin === r.origin && form.destination === r.destination" name="success" color="#1a73e8" />
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDatetimePicker" position="bottom" round>
      <van-date-picker
        v-model="currentDateValue"
        type="datetime"
        title="选择时间"
        :min-date="new Date(2026, 0, 1)"
        @confirm="onDateConfirm"
        @cancel="onDateCancel"
      />
    </van-popup>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; min-height: 100dvh; background: #f5f6f8; display: flex; flex-direction: column; }
.steps { background: #fff; padding: 16px; }
.page-content { flex: 1; padding: 16px; }
.route-quick { margin-top: 12px; padding: 0 8px; }
.quick-title { font-size: 13px; color: #999; margin-bottom: 8px; }
.quick-list { display: flex; flex-wrap: wrap; gap: 8px; }
.quick-tag { background: #e8f0fe; color: #1a73e8; padding: 6px 12px; border-radius: 16px; font-size: 12px; cursor: pointer; }
.confirm-wrap { padding-top: 8px; }
.submit-wrap { margin: 24px 16px; }
.step-btns { display: flex; gap: 12px; padding: 12px 16px; background: #fff; border-top: 1px solid #f0f0f0; }
.popup-title { text-align: center; font-size: 15px; font-weight: 600; padding: 16px; border-bottom: 1px solid #f0f0f0; }
.popup-list { padding: 8px 0; }
.popup-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; font-size: 14px; cursor: pointer; }
.popup-item:active { background: #f5f5f5; }
</style>
