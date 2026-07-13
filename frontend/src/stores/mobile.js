import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDashboardOverview, getVehicleStatusGrid, getTaskList,
  getDispatchList, getNotifications, getApplyList, getApproveList
} from '@/api/mobile'

export const useMobileStore = defineStore('mobile', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const dashboardData = ref(null)
  const vehicleStatus = ref(null)
  const tasks = ref([])
  const dispatches = ref([])
  const notifications = ref([])
  const unreadCount = ref(0)
  const applies = ref([])
  const approves = ref([])

  const role = computed(() => user.value?.role || 'employee')

  const isLoggedIn = computed(() => !!token.value)

  function setToken(val) {
    token.value = val
    if (val) {
      localStorage.setItem('token', val)
    } else {
      localStorage.removeItem('token')
    }
  }

  function setUser(val) {
    user.value = val
  }

  function logout() {
    setToken('')
    user.value = null
  }

  async function fetchDashboard() {
    try {
      const res = await getDashboardOverview()
      dashboardData.value = res.data
    } catch {
      dashboardData.value = null
    }
  }

  async function fetchVehicleStatus() {
    try {
      const res = await getVehicleStatusGrid()
      vehicleStatus.value = res.data
    } catch {
      vehicleStatus.value = null
    }
  }

  async function fetchTasks(params) {
    try {
      const res = await getTaskList(params)
      tasks.value = res.data?.list || res.data || []
      return tasks.value
    } catch {
      return []
    }
  }

  async function fetchDispatches(params) {
    try {
      const res = await getDispatchList(params)
      dispatches.value = res.data?.list || res.data || []
      return dispatches.value
    } catch {
      return []
    }
  }

  async function fetchNotifications(params) {
    try {
      const res = await getNotifications(params)
      notifications.value = res.data?.list || res.data || []
      unreadCount.value = res.data?.unread || 0
      return notifications.value
    } catch {
      return []
    }
  }

  async function fetchApplies(params) {
    try {
      const res = await getApplyList(params)
      applies.value = res.data?.list || res.data || []
      return applies.value
    } catch {
      return []
    }
  }

  async function fetchApproves(params) {
    try {
      const res = await getApproveList(params)
      approves.value = res.data?.list || res.data || []
      return approves.value
    } catch {
      return []
    }
  }

  return {
    user, token, dashboardData, vehicleStatus, tasks, dispatches,
    notifications, unreadCount, applies, approves, role, isLoggedIn,
    setToken, setUser, logout, fetchDashboard, fetchVehicleStatus,
    fetchTasks, fetchDispatches, fetchNotifications, fetchApplies, fetchApproves
  }
})
