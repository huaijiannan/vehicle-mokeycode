import MobileLayout from '@/mobile/components/MobileLayout.vue'

export default [
  { path: '/m/login', name: 'MobileLogin', component: () => import('@/mobile/views/MobileLoginView.vue'), meta: { guest: true } },
  {
    path: '/m',
    component: MobileLayout,
    children: [
      { path: '', redirect: '/m/home' },
      { path: 'home', name: 'MobileHome', component: () => import('@/mobile/views/MobileHomeView.vue') },
      { path: 'apply/create', name: 'MobileApplyCreate', component: () => import('@/mobile/views/MobileApplyCreateView.vue') },
      { path: 'apply/list', name: 'MobileApplyList', component: () => import('@/mobile/views/MobileApplyListView.vue') },
      { path: 'apply/:id', name: 'MobileApplyDetail', component: () => import('@/mobile/views/MobileApplyDetailView.vue') },
      { path: 'approve/list', name: 'MobileApproveList', component: () => import('@/mobile/views/MobileApproveListView.vue') },
      { path: 'dispatch/list', name: 'MobileDispatchList', component: () => import('@/mobile/views/MobileDispatchListView.vue') },
      { path: 'dispatch/assign/:id', name: 'MobileDispatchAssign', component: () => import('@/mobile/views/MobileDispatchAssignView.vue') },
      { path: 'task/list', name: 'MobileTaskList', component: () => import('@/mobile/views/MobileTaskListView.vue') },
      { path: 'task/:id/start', name: 'MobileTripStart', component: () => import('@/mobile/views/MobileTripStartView.vue') },
      { path: 'task/:id/end', name: 'MobileTripEnd', component: () => import('@/mobile/views/MobileTripEndView.vue') },
      { path: 'expense/create', name: 'MobileExpenseCreate', component: () => import('@/mobile/views/MobileExpenseCreateView.vue') },
      { path: 'repair/create', name: 'MobileRepairCreate', component: () => import('@/mobile/views/MobileRepairCreateView.vue') },
      { path: 'monitor', name: 'MobileMonitor', component: () => import('@/mobile/views/MobileMonitorView.vue') },
      { path: 'vehicle/status', name: 'MobileVehicleStatus', component: () => import('@/mobile/views/MobileVehicleStatusView.vue') },
      { path: 'notifications', name: 'MobileNotifications', component: () => import('@/mobile/views/MobileNotificationView.vue') }
    ]
  }
]
