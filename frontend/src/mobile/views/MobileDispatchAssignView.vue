<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getApplyDetail, getAvailableVehicles, getAvailableDrivers, assignDispatch } from '@/api/mobile'
import { showToast, showSuccessToast } from 'vant'

const route = useRoute()
const router = useRouter()
const id = ref(route.params.id)

const showVehicle = ref(false)
const showDriver = ref(false)
const selectedVehicle = ref(null)
const selectedDriver = ref(null)
const submitting = ref(false)

const applyInfo = ref(null)
const vehicles = ref([])
const drivers = ref([])

onMounted(async () => {
  try {
    const [applyRes, vRes, dRes] = await Promise.all([
      getApplyDetail(id.value),
      getAvailableVehicles(),
      getAvailableDrivers()
    ])
    applyInfo.value = applyRes.data
    vehicles.value = vRes.data || []
    drivers.value = dRes.data || []
  } catch (e) {
    showToast('加载失败')
  }
})

function selectVehicle(v) {
  selectedVehicle.value = v
  showVehicle.value = false
}

function selectDriver(d) {
  selectedDriver.value = d
  showDriver.value = false
}

async function onSubmit() {
  if (!selectedVehicle.value) { showToast('请选择车辆'); return }
  if (!selectedDriver.value) { showToast('请选择司机'); return }
  submitting.value = true
  try {
    await assignDispatch(id.value, {
      vehicleId: selectedVehicle.value.id,
      driverId: selectedDriver.value.id
    })
    showSuccessToast('派车成功')
    setTimeout(() => router.push('/m/home'), 1000)
  } catch (e) {
    showToast(e.response?.data?.error || '派车失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="快速派车" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <div class="apply-card" v-if="applyInfo">
        <div class="card-title">{{ applyInfo.purpose }}</div>
        <div class="card-meta">{{ applyInfo.applicant_name || '' }} · {{ applyInfo.department_name || '' }}</div>
        <div class="card-meta">出发：{{ applyInfo.depart_time || '' }}</div>
        <div class="card-route">{{ applyInfo.origin }} → {{ applyInfo.destination }} · {{ applyInfo.passenger_count }}人</div>
      </div>

      <van-cell-group inset class="cell-group">
        <van-cell title="选择车辆" :value="selectedVehicle ? `${selectedVehicle.plate_number} ${selectedVehicle.brand_model}` : '请选择'"
          is-link @click="showVehicle = true" />
        <van-cell title="选择司机" :value="selectedDriver ? selectedDriver.real_name : '请选择'"
          is-link @click="showDriver = true" />
      </van-cell-group>

      <div class="submit-wrap">
        <van-button round block type="primary" @click="onSubmit" :loading="submitting" loading-text="派车中...">
          确认派车
        </van-button>
      </div>
    </div>

    <van-popup v-model:show="showVehicle" position="bottom" round :style="{ height: '50%' }">
      <div class="popup-title">选择车辆</div>
      <div class="popup-list">
        <div v-for="v in vehicles" :key="v.id" class="popup-item" @click="selectVehicle(v)">
          <div>
            <div class="popup-item-title">{{ v.plate_number }} · {{ v.brand_model }}</div>
            <div class="popup-item-desc">{{ v.vehicle_type || '未知' }} · {{ v.seat_count || 0 }}座</div>
          </div>
          <van-icon v-if="selectedVehicle?.id === v.id" name="success" color="#1a73e8" />
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDriver" position="bottom" round :style="{ height: '50%' }">
      <div class="popup-title">选择司机</div>
      <div class="popup-list">
        <div v-for="d in drivers" :key="d.id" class="popup-item" @click="selectDriver(d)">
          <div>
            <div class="popup-item-title">{{ d.real_name }}</div>
            <div class="popup-item-desc">{{ d.phone || '' }}</div>
          </div>
          <van-icon v-if="selectedDriver?.id === d.id" name="success" color="#1a73e8" />
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 16px; }

.apply-card {
  background: linear-gradient(135deg, #1a73e8, #4080ff); color: #fff;
  border-radius: 14px; padding: 18px; margin-bottom: 16px;
}

.card-title { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
.card-meta { font-size: 12px; opacity: .85; margin-top: 2px; }
.card-route { font-size: 13px; opacity: .9; margin-top: 4px; }

.cell-group { margin-top: 12px; }

.submit-wrap { margin-top: 32px; padding: 0 16px; }

.popup-title {
  text-align: center; font-size: 15px; font-weight: 600;
  padding: 16px; border-bottom: 1px solid #f0f0f0;
}

.popup-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 20px; cursor: pointer; border-bottom: 1px solid #f5f5f5;
}

.popup-item:active { background: #f5f5f5; }

.popup-item-title { font-size: 15px; font-weight: 600; color: #333; }
.popup-item-desc { font-size: 12px; color: #999; margin-top: 2px; }
</style>
