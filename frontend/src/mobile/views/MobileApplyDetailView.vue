<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getApplyDetail } from '@/api/mobile'
import { showToast } from 'vant'

const route = useRoute()
const id = ref(route.params.id)

const detail = ref(null)
const loading = ref(true)

const statusTags = { '待审批': 'warning', '已审批': 'success', '已派车': 'primary', '已驳回': 'danger' }
const statusLabels = { '待审批': '待审批', '已审批': '已通过', '已派车': '已派车', '已驳回': '已驳回' }

onMounted(async () => {
  try {
    const res = await getApplyDetail(id.value)
    detail.value = res.data
  } catch (e) {
    showToast('加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="申请详情" left-text="返回" left-arrow @click-left="$router.back()" />
    <div class="page-content">
      <van-loading v-if="loading" class="loading" />
      <template v-else-if="detail">
        <van-cell-group inset>
          <van-cell title="用车事由" :value="detail.purpose" />
          <van-cell title="当前状态">
            <template #value>
              <van-tag :type="statusTags[detail.status] || 'default'" size="small">{{ statusLabels[detail.status] || detail.status }}</van-tag>
            </template>
          </van-cell>
          <van-cell title="出发地" :value="detail.origin" />
          <van-cell title="目的地" :value="detail.destination" />
          <van-cell title="预计出发" :value="detail.depart_time || ''" />
          <van-cell title="预计返回" :value="detail.return_time || ''" />
          <van-cell title="乘车人数" :value="`${detail.passenger_count}人`" />
          <van-cell title="是否需司机" :value="detail.need_driver ? '需要' : '不需要'" />
          <van-cell title="备注" :value="detail.remark || '无'" />
          <van-cell title="提交时间" :value="detail.created_at || ''" />
        </van-cell-group>
      </template>
      <van-empty v-else description="申请不存在" />
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }
.page-content { padding: 12px 16px; }
</style>
