import request from './request'

export function mobileLogin(data) {
  return request.post('/auth/login', data)
}

export function getDashboardOverview() {
  return request.get('/mobile/dashboard/overview')
}

export function getVehicleStatusGrid() {
  return request.get('/mobile/vehicle/status-grid')
}

export function getFrequentRoutes() {
  return request.get('/mobile/routes/frequent')
}

export function getApplyList(params) {
  return request.get('/mobile/applies', { params })
}

export function getApplyDetail(id) {
  return request.get(`/mobile/applies/${id}`)
}

export function createApply(data) {
  return request.post('/mobile/applies', data)
}

export function getApproveList(params) {
  return request.get('/mobile/approves', { params })
}

export function approveApplication(id, data) {
  return request.put(`/mobile/approves/${id}`, data)
}

export function getDispatchList(params) {
  return request.get('/mobile/dispatches', { params })
}

export function assignDispatch(id, data) {
  return request.put(`/mobile/dispatches/${id}/assign`, data)
}

export function getAvailableVehicles(params) {
  return request.get('/mobile/available-vehicles', { params })
}

export function getAvailableDrivers(params) {
  return request.get('/mobile/available-drivers', { params })
}

export function getTaskList(params) {
  return request.get('/mobile/tasks', { params })
}

export function getTaskDetail(id) {
  return request.get(`/mobile/tasks/${id}`)
}

export function startTrip(id, data) {
  return request.post(`/mobile/tasks/${id}/start`, data)
}

export function endTrip(id, data) {
  return request.post(`/mobile/tasks/${id}/end`, data)
}

export function createExpense(data) {
  return request.post('/mobile/expenses', data)
}

export function createRepair(data) {
  return request.post('/mobile/repairs', data)
}

export function getNotifications(params) {
  return request.get('/mobile/notifications', { params })
}

export function markNotificationRead(id) {
  return request.put(`/mobile/notifications/${id}/read`)
}

export function uploadOcrImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/mobile/ocr/odometer', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
