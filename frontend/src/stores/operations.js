import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import * as opsApi from '@/api/operations'

export const useOperationsStore = defineStore('operations', () => {
  const selectedOrgId = ref('all')
  const expandedOrgNodes = ref(new Set())

  const vehicles = ref([])
  const totalVehicles = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(15)
  const totalPages = computed(() => Math.ceil(totalVehicles.value / pageSize.value))

  const searchKeyword = ref('')
  const filterStatus = ref('')
  const filterType = ref('')

  const summary = reactive({
    totalVehicles: 0,
    totalFuel: 0,
    totalRepair: 0,
    inspectionWarning: 0,
    insuranceWarning: 0,
    violationVehicles: 0
  })

  const selectedVehicleId = ref(null)
  const selectedVehicle = ref(null)
  const modalVisible = ref(false)
  const detailTab = ref('refuel')
  const cachedTabData = ref({})

  const loading = ref(false)

  async function fetchVehicles() {
    loading.value = true
    try {
      const params = {
        page: currentPage.value,
        size: pageSize.value
      }
      if (selectedOrgId.value !== 'all') params.orgId = selectedOrgId.value
      if (searchKeyword.value) params.search = searchKeyword.value
      if (filterStatus.value) params.status = filterStatus.value
      if (filterType.value) params.type = filterType.value

      const data = await opsApi.getOperationVehicles(params)
      vehicles.value = data.list || []
      totalVehicles.value = data.total || 0
    } catch (e) {
      console.error('获取车辆列表失败', e)
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary() {
    try {
      const params = {}
      if (selectedOrgId.value !== 'all') params.orgId = selectedOrgId.value
      const data = await opsApi.getOperationSummary(params)
      Object.assign(summary, data)
    } catch (e) {
      console.error('获取汇总数据失败', e)
    }
  }

  async function selectOrg(orgId) {
    selectedOrgId.value = orgId
    currentPage.value = 1
    await fetchVehicles()
  }

  function openVehicleDetail(row) {
    selectedVehicleId.value = row.id
    selectedVehicle.value = row
    modalVisible.value = true
    detailTab.value = 'refuel'
    cachedTabData.value = {}
  }

  function closeVehicleDetail() {
    modalVisible.value = false
    selectedVehicleId.value = null
    selectedVehicle.value = null
    cachedTabData.value = {}
  }

  function switchTab(tab) {
    detailTab.value = tab
  }

  function goPage(page) {
    currentPage.value = page
    fetchVehicles()
  }

  return {
    selectedOrgId, expandedOrgNodes, vehicles, totalVehicles, currentPage, pageSize, totalPages,
    searchKeyword, filterStatus, filterType, summary, loading,
    selectedVehicleId, selectedVehicle, modalVisible, detailTab, cachedTabData,
    fetchVehicles, fetchSummary, selectOrg, openVehicleDetail, closeVehicleDetail, switchTab, goPage
  }
})
