<script setup>
import { ref, onMounted } from 'vue'
import { getNotifications, markNotificationRead } from '@/api/mobile'

const notifications = ref([])
const activeTab = ref(0)
const loading = ref(false)

onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getNotifications()
    notifications.value = res.data?.list || res.data || []
  } catch {}
  loading.value = false
}

async function markRead(item) {
  item.unread = false
  try {
    await markNotificationRead(item.id)
  } catch {}
}
</script>

<template>
  <div class="mobile-page">
    <van-nav-bar title="消息通知" left-text="返回" left-arrow @click-left="$router.back()" />

    <van-tabs v-model:active="activeTab">
      <van-tab title="全部" />
      <van-tab title="未读" />
    </van-tabs>

    <div class="page-content">
      <template v-if="activeTab === 0">
        <div v-for="item in notifications" :key="item.id" class="notify-item" :class="{ unread: item.unread }" @click="markRead(item)">
          <div class="notify-icon" :class="item.type">
            <van-icon v-if="item.type === 'approve'" name="records-o" size="18" />
            <van-icon v-else-if="item.type === 'dispatch'" name="logistics" size="18" />
            <van-icon v-else-if="item.type === 'alert'" name="warning-o" size="18" />
            <van-icon v-else name="info-o" size="18" />
          </div>
          <div class="notify-info">
            <div class="notify-title">{{ item.title }}</div>
            <div class="notify-content">{{ item.content }}</div>
            <div class="notify-time">{{ item.time }}</div>
          </div>
          <div class="unread-dot" v-if="item.unread"></div>
        </div>
      </template>
      <template v-if="activeTab === 1">
        <div v-for="item in notifications.filter(n => n.unread)" :key="item.id" class="notify-item unread" @click="markRead(item)">
          <div class="notify-icon" :class="item.type">
            <van-icon v-if="item.type === 'approve'" name="records-o" size="18" />
            <van-icon v-else-if="item.type === 'dispatch'" name="logistics" size="18" />
            <van-icon v-else name="info-o" size="18" />
          </div>
          <div class="notify-info">
            <div class="notify-title">{{ item.title }}</div>
            <div class="notify-content">{{ item.content }}</div>
            <div class="notify-time">{{ item.time }}</div>
          </div>
          <div class="unread-dot"></div>
        </div>
        <van-empty v-if="notifications.filter(n => n.unread).length === 0" description="暂无未读消息" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.mobile-page { min-height: 100vh; background: #f5f6f8; }

.page-content { padding: 8px 16px; }

.notify-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 0; border-bottom: 1px solid #f0f0f0; cursor: pointer;
  position: relative;
}

.notify-item.unread { background: #fafafa; margin: 0 -16px; padding: 14px 16px; }

.notify-icon {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; background: #f5f5f5;
}

.notify-icon.approve { background: #e8f0fe; color: #1a73e8; }
.notify-icon.dispatch { background: #f6ffed; color: #52c41a; }
.notify-icon.alert { background: #fff1f0; color: #f5222d; }
.notify-icon.system { background: #f5f5f5; color: #999; }

.notify-info { flex: 1; min-width: 0; }

.notify-title { font-size: 14px; font-weight: 600; color: #333; margin-bottom: 2px; }
.notify-content { font-size: 13px; color: #666; line-height: 1.4; }
.notify-time { font-size: 11px; color: #bbb; margin-top: 4px; }

.unread-dot {
  position: absolute; top: 18px; right: 4px;
  width: 8px; height: 8px; border-radius: 50%; background: #ee0a24;
}
</style>
