<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTaskDetail, endTrip, uploadOcrImage } from '@/api/mobile'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const id = ref(route.params.id)

const mileage = ref('')
const photoTaken = ref(false)
const startMileage = ref(0)
const tripKm = ref(0)
const submitting = ref(false)

const taskInfo = ref(null)

onMounted(async () => {
  try {
    const res = await getTaskDetail(id.value)
    taskInfo.value = res.data
    startMileage.value = res.data?.start_odometer || 0
  } catch (e) {
    showToast('加载任务失败')
  }
})

function onPhoto(e) {
  const file = e.target?.files?.[0] || e.file
  if (!file) return
  photoTaken.value = true
  uploadOcrImage(file).then(res => {
    if (res.data?.mileage) {
      mileage.value = String(res.data.mileage)
      if (startMileage.value > 0) {
        tripKm.value = parseInt(mileage.value) - startMileage.value
      }
    }
  }).catch(() => {
    showToast('OCR识别失败，请手动输入')
  })
}

async function confirmEnd() {
  if (!mileage.value) {
    showToast('请先拍摄或输入里程表读数')
    return
  }
  if (parseInt(mileage.value) < startMileage.value) {
    showToast('里程数异常，结束里程不能小于起始里程')
    return
  }
  submitting.value = true
  try {
    await endTrip(id.value, { mileage: mileage.value })
    showToast('归库确认成功')
    setTimeout(() => router.push('/m/home'), 1000)
  } catch (e) {
    showToast(e.response?.data?.error || '确认失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="归库确认" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <van-notice-bar v-if="taskInfo" color="#52c41a" background="#f6ffed" left-icon="info-o">
        {{ taskInfo.plate_number }} {{ taskInfo.brand_model }} · 出车里程：{{ taskInfo.start_odometer || 0 }}km
      </van-notice-bar>

      <div class="photo-section">
        <div class="section-title">拍摄归库里程表</div>
        <div class="photo-area" v-if="!photoTaken">
          <label class="photo-label">
            <van-icon name="photograph" size="32" color="#ccc" />
            <span class="photo-hint">点击拍摄仪表盘里程表</span>
            <input type="file" accept="image/*" capture="environment" @change="onPhoto" style="display:none" />
          </label>
        </div>
        <div class="photo-preview" v-else>
          <div class="preview-box">
            <van-icon name="photograph" size="24" color="#52c41a" />
            <span>照片已拍摄</span>
          </div>
        </div>
      </div>

      <van-cell-group inset>
        <van-field v-model="mileage" label="结束里程" placeholder="请输入里程表读数 (km)" type="digit" required />
        <van-cell v-if="tripKm > 0" title="本次行程">
          <template #value>
            <span class="trip-km">{{ tripKm }} km</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="expense-section" v-if="false">
        <div class="section-title">行程费用汇总</div>
        <van-cell-group inset>
          <van-cell title="暂无费用记录" />
        </van-cell-group>
      </div>

      <div class="submit-wrap">
        <van-button round block type="primary" @click="confirmEnd" :loading="submitting" loading-text="确认中...">确认归库</van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 12px 16px; }

.section-title {
  font-size: 14px; font-weight: 600; color: #333; margin: 16px 0 10px;
}

.photo-section { margin: 0 0 12px; }

.photo-area {
  background: #fff; border: 2px dashed #ddd; border-radius: 14px;
  height: 160px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px; cursor: pointer;
}

.photo-label {
  display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
}

.photo-hint { font-size: 13px; color: #bbb; }

.photo-preview {
  background: #f6ffed; border: 1px solid #b7eb8f;
  border-radius: 12px; padding: 16px; text-align: center;
}

.preview-box {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; color: #52c41a; font-size: 14px; font-weight: 500;
}

.trip-km {
  font-size: 20px; font-weight: 700; color: #1a73e8;
}

.expense-section { margin-top: 8px; }

.submit-wrap { margin-top: 32px; }
</style>
