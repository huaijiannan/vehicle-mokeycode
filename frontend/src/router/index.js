import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import LoginView from '@/views/LoginView.vue'
import mobileRoutes from '@/mobile/router/index.js'

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  {
    path: '/',
    component: Layout,
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'vehicle/list', name: 'VehicleList', component: () => import('@/views/vehicle/VehicleListView.vue') },
      { path: 'vehicle/detail/:id', name: 'VehicleDetail', component: () => import('@/views/vehicle/VehicleDetailView.vue') },
      { path: 'driver/list', name: 'DriverList', component: () => import('@/views/driver/DriverListView.vue') },
      { path: 'driver/detail/:id', name: 'DriverDetail', component: () => import('@/views/driver/DriverDetailView.vue') },
      { path: 'apply/create', name: 'ApplyCreate', component: () => import('@/views/apply/ApplyCreateView.vue') },
      { path: 'apply/list', name: 'ApplyList', component: () => import('@/views/apply/ApplyListView.vue') },
      { path: 'approve/list', name: 'ApproveList', component: () => import('@/views/approve/ApproveListView.vue') },
      { path: 'dispatch/list', name: 'DispatchList', component: () => import('@/views/dispatch/DispatchListView.vue') },
      { path: 'trip/list', name: 'TripList', component: () => import('@/views/trip/TripListView.vue') },
      { path: 'track/monitor', name: 'TrackMonitor', component: () => import('@/views/track/TrackMonitorView.vue') },
      { path: 'expense/list', name: 'ExpenseList', component: () => import('@/views/expense/ExpenseListView.vue') },
      { path: 'report/dashboard', name: 'Report', component: () => import('@/views/report/ReportView.vue') },
      { path: 'system/users', name: 'UserManage', component: () => import('@/views/system/UserManageView.vue') },
      { path: 'system/roles', name: 'RoleManage', component: () => import('@/views/system/RoleManageView.vue') },
      { path: 'operations/vehicles', name: 'OperationsVehicles', component: () => import('@/views/operations/OperationsView.vue') }
    ]
  },
  ...mobileRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

function isMobileDevice() {
  const ua = navigator.userAgent || ''
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) return true

  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('mobile') === '1') return true
  if (urlParams.get('pc') === '1') return false

  if (window.innerWidth <= 768 && 'ontouchstart' in window) return true

  if (window.innerWidth <= 480) return true

  return false
}

function checkForceMode() {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('mobile') === '1') return 'mobile'
  if (urlParams.get('pc') === '1') return 'pc'
  return null
}

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isMobilePath = to.path.startsWith('/m/')
  const forceMode = checkForceMode()
  const mobile = forceMode === 'mobile' ? true : (forceMode === 'pc' ? false : isMobileDevice())

  if (to.path === '/' || to.path === '/login') {
    if (mobile && to.path !== '/m/login') {
      next(token ? '/m/home' : '/m/login')
      return
    }
    if (!mobile && to.path !== '/login') {
      next(token ? '/dashboard' : '/login')
      return
    }
  }

  if (isMobilePath && to.path !== '/m/login' && !token) {
    next('/m/login')
  } else if (to.path === '/m/login' && token) {
    next('/m/home')
  } else if (!isMobilePath && to.path !== '/login' && !token) {
    if (mobile) {
      next('/m/login')
    } else {
      next('/login')
    }
  } else if (!isMobilePath && to.path === '/login' && token) {
    if (mobile) {
      next('/m/home')
    } else {
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router
