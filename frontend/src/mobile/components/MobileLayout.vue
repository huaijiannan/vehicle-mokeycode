<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMobileStore } from '@/stores/mobile'

const router = useRouter()
const route = useRoute()
const store = useMobileStore()

const hideTabRoutes = [
  '/m/apply/create', '/m/dispatch/assign', '/m/task/', '/m/expense/create', '/m/repair/create'
]

const showTabbar = computed(() => {
  if (route.path === '/m/apply' && route.params.id) return false
  return !hideTabRoutes.some(r => route.path.startsWith(r))
})

const tabs = {
  employee: [
    { path: '/m/home', icon: 'home-o', label: '首页' },
    { path: '/m/notifications', icon: 'bell', label: '消息', badge: 2 },
    { path: '/m/apply/list', icon: 'orders-o', label: '我的申请' }
  ],
  approver: [
    { path: '/m/home', icon: 'home-o', label: '首页' },
    { path: '/m/approve/list', icon: 'checked', label: '审批', badge: 3 },
    { path: '/m/vehicle/status', icon: 'chart-trending-o', label: '看板' }
  ],
  dispatcher: [
    { path: '/m/home', icon: 'home-o', label: '调度台' },
    { path: '/m/dispatch/list', icon: 'logistics', label: '派车' },
    { path: '/m/vehicle/status', icon: 'chart-trending-o', label: '车辆' }
  ],
  driver: [
    { path: '/m/home', icon: 'home-o', label: '首页' },
    { path: '/m/task/list', icon: 'todo-list-o', label: '任务' },
    { path: '/m/notifications', icon: 'bell', label: '消息', badge: 1 }
  ],
  admin: [
    { path: '/m/home', icon: 'home-o', label: '首页' },
    { path: '/m/monitor', icon: 'chart-trending-o', label: '看板' },
    { path: '/m/notifications', icon: 'bell', label: '告警', badge: 1 }
  ]
}

const currentTabs = computed(() => {
  return tabs[store.role] || tabs.employee
})

const activeTab = computed(() => {
  const exact = currentTabs.value.find(t => route.path === t.path)
  if (exact) return exact.path
  return currentTabs.value[0]?.path
})

function onTabClick(tab) {
  if (tab.path !== route.path) {
    router.push(tab.path)
  }
}
</script>

<template>
  <div class="mobile-layout">
    <div class="mobile-content" :class="{ 'no-tabbar': !showTabbar }">
      <router-view v-slot="{ Component }">
        <keep-alive include="MobileHomeView,MobileDispatchListView,MobileTaskListView,MobileApproveListView">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <van-tabbar
      v-if="showTabbar"
      v-model="activeTab"
      @change="onTabClick"
      :fixed="true"
      :safe-area-inset-bottom="true"
    >
      <van-tabbar-item
        v-for="tab in currentTabs"
        :key="tab.path"
        :name="tab.path"
        :icon="tab.icon"
        :badge="tab.badge || ''"
      >
        {{ tab.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f6f8;
  position: relative;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 50px;
  -webkit-overflow-scrolling: touch;
}

.mobile-content.no-tabbar {
  padding-bottom: 0;
}
</style>
