<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTaskDetail, startTrip, uploadOcrImage } from '@/api/mobile'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const id = ref(route.params.id)

const mileage = ref('')
const photoTaken = ref(false)
const submitting = ref(false)

const taskInfo = ref(null)

onMounted(async () => {
  try {
    const res = await getTaskDetail(id.value)
    taskInfo.value = res.data
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
    }
  }).catch(() => {
    showToast('OCR识别失败，请手动输入')
  })
}

async function confirmStart() {
  if (!mileage.value) {
    showToast('请先拍摄或输入里程表读数')
    return
  }
  submitting.value = true
  try {
    await startTrip(id.value, { mileage: mileage.value })
    showToast('出车确认成功')
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
    <van-nav-bar title="出车确认" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <van-notice-bar v-if="taskInfo" color="#1a73e8" background="#e8f0fe" left-icon="info-o">
        {{ taskInfo.plate_number }} {{ taskInfo.brand_model }} · {{ taskInfo.origin || '-' }} → {{ taskInfo.destination || '-' }}
      </van-notice-bar>

      <div class="photo-section">
        <div class="section-title">拍摄里程表</div>
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
        <van-field
          v-model="mileage"
          label="起始里程"
          placeholder="请输入里程表读数 (km)"
          type="digit"
          required
        >
          <template #extra>
            <span class="ocr-hint" v-if="photoTaken">OCR识别</span>
          </template>
        </van-field>
      </van-cell-group>

      <div class="submit-wrap">
        <van-button round block type="primary" @click="confirmStart" :loading="submitting" loading-text="确认中...">确认出车</van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 12px 16px; }

.section-title {
  font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px;
}

.photo-section { margin: 16px 0; }

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
  border-radius: 12px; padding: 16px;
  text-align: center;
}

.preview-box {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; color: #52c41a; font-size: 14px; font-weight: 500;
}

.ocr-hint {
  font-size: 11px; color: #52c41a; font-weight: 500;
}

.submit-wrap { margin-top: 24px; }
</style>
