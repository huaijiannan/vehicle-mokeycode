import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import LoginView from '@/views/LoginView.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginView },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
