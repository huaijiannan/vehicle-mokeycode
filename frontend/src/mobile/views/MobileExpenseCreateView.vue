<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createExpense, getTaskList } from '@/api/mobile'
import { showToast } from 'vant'

const router = useRouter()

const form = ref({
  type: 'refuel',
  amount: '',
  note: ''
})

const expenseTypes = [
  { value: 'refuel', label: '加油', icon: 'gold-coin-o' },
  { value: 'toll', label: '过路费', icon: 'logistics' },
  { value: 'parking', label: '停车费', icon: 'stop-circle-o' },
  { value: 'other', label: '其他', icon: 'more-o' }
]

const currentTask = ref(null)

onMounted(async () => {
  try {
    const res = await getTaskList()
    const tasks = res.data?.list || res.data || []
    const active = tasks.find(t => t.status === '出车中')
    if (active) {
      currentTask.value = {
        vehicle: active.plate_number,
        route: `${active.origin || '-'} → ${active.destination || '-'}`
      }
    }
  } catch {}
})

async function onSubmit() {
  if (!form.value.amount) {
    showToast('请输入金额')
    return
  }
  try {
    await createExpense({
      type: form.value.type,
      amount: form.value.amount,
      note: form.value.note
    })
    showToast('费用记录成功')
    setTimeout(() => router.back(), 800)
  } catch (e) {
    showToast(e.response?.data?.error || '提交失败')
  }
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="费用随手记" left-text="返回" left-arrow @click-left="$router.back()" />

    <div class="page-content">
      <van-notice-bar v-if="currentTask" color="#999" background="#f5f5f5" left-icon="info-o">
        当前行程：{{ currentTask.vehicle }} · {{ currentTask.route }}
      </van-notice-bar>

      <div class="type-section">
        <div class="section-title">费用类型</div>
        <div class="type-grid">
          <div v-for="t in expenseTypes" :key="t.value"
            class="type-item" :class="{ active: form.type === t.value }"
            @click="form.type = t.value">
            <van-icon :name="t.icon" size="24" :color="form.type === t.value ? '#1a73e8' : '#999'" />
            <span>{{ t.label }}</span>
          </div>
        </div>
      </div>

      <van-cell-group inset>
        <van-field v-model="form.amount" label="金额(元)" placeholder="请输入金额" type="digit" required />
        <van-field v-model="form.note" label="备注" placeholder="选填（如加油站名称）" />
      </van-cell-group>

      <div class="photo-upload">
        <van-uploader :max-count="1" :preview-size="80" />
        <span class="upload-hint">拍摄小票（可选）</span>
      </div>

      <div class="submit-wrap">
        <van-button round block type="primary" @click="onSubmit">提交费用</van-button>
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

.type-section { margin: 16px 0; }

.type-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;
}

.type-item {
  background: #fff; border-radius: 12px; padding: 14px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  cursor: pointer; font-size: 12px; color: #999;
  border: 1px solid transparent;
}

.type-item.active {
  border-color: #1a73e8; color: #1a73e8; background: #e8f0fe;
}

.photo-upload {
  display: flex; align-items: center; gap: 12px; margin-top: 16px;
}

.upload-hint { font-size: 12px; color: #bbb; }

.submit-wrap { margin-top: 24px; }
</style>
