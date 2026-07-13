<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createRepair } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()

const form = ref({
  vehicle: '',
  vehicleModel: '',
  description: ''
})

const submitting = ref(false)

async function onSubmit() {
  if (!form.value.description) {
    showToast('请描述故障情况')
    return
  }
  submitting.value = true
  try {
    await createRepair({
      vehicle: form.value.vehicle,
      vehicleModel: form.value.vehicleModel,
      description: form.value.description
    })
    showToast('报修已提交，管理员将尽快处理')
    setTimeout(() => router.back(), 1000)
  } catch (e) {
    showToast(e.response?.data?.error || '提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="一键报修" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <van-notice-bar color="#f5222d" background="#fff1f0" left-icon="warning-o" scrollable>
        紧急报修通道，提交后将立即通知管理员
      </van-notice-bar>

      <van-cell-group inset class="cell-group">
        <van-field v-model="form.vehicle" label="车牌号" placeholder="请输入车牌号" />
        <van-field v-model="form.vehicleModel" label="车型" placeholder="请输入车型" />
      </van-cell-group>

      <van-cell-group inset>
        <van-field
          v-model="form.description"
          label="故障描述"
          placeholder="请描述故障情况"
          type="textarea"
          rows="3"
          autosize
          required
        />
      </van-cell-group>

      <div class="photo-section">
        <div class="section-title">故障照片</div>
        <div class="photo-upload">
          <van-uploader :max-count="3" :preview-size="80" />
          <span class="upload-hint">请上传故障部位照片</span>
        </div>
      </div>

      <div class="submit-wrap">
        <van-button round block type="danger" @click="onSubmit" :loading="submitting" loading-text="提交中...">提交报修</van-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 12px 16px; }

.cell-group { margin-bottom: 16px; }

.section-title {
  font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px;
}

.photo-section { margin-top: 16px; }

.photo-upload {
  display: flex; align-items: center; gap: 12px;
}

.upload-hint { font-size: 12px; color: #bbb; }

.submit-wrap { margin-top: 32px; }
</style>
