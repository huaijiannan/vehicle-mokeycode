import request from './request'

export function getOperationVehicles(params) {
  return request.get('/operations/vehicles', { params })
}

export function getOperationSummary(params) {
  return request.get('/operations/summary', { params })
}

export function getRefuelRecords(vehicleId, params) {
  return request.get(`/operations/vehicles/${vehicleId}/refuel`, { params })
}

export function addRefuelRecord(vehicleId, data) {
  return request.post(`/operations/vehicles/${vehicleId}/refuel`, data)
}

export function getMaintenanceRecords(vehicleId) {
  return request.get(`/operations/vehicles/${vehicleId}/maintenance`)
}

export function addMaintenanceRecord(vehicleId, data) {
  return request.post(`/operations/vehicles/${vehicleId}/maintenance`, data)
}

export function updateMaintenanceStatus(vehicleId, recordId, data) {
  return request.put(`/operations/vehicles/${vehicleId}/maintenance/${recordId}`, data)
}

export function getRepairShops() {
  return request.get('/operations/repair-shops')
}

export function addRepairShop(data) {
  return request.post('/operations/repair-shops', data)
}

export function getInsuranceRecords(vehicleId) {
  return request.get(`/operations/vehicles/${vehicleId}/insurance`)
}

export function addInsuranceRecord(vehicleId, data) {
  return request.post(`/operations/vehicles/${vehicleId}/insurance`, data)
}

export function updateInsuranceRecord(vehicleId, recordId, data) {
  return request.put(`/operations/vehicles/${vehicleId}/insurance/${recordId}`, data)
}

export function renewInsurance(vehicleId, data) {
  return request.post(`/operations/vehicles/${vehicleId}/insurance/renew`, data)
}

export function getInspectionRecords(vehicleId) {
  return request.get(`/operations/vehicles/${vehicleId}/inspection`)
}

export function addInspectionRecord(vehicleId, data) {
  return request.post(`/operations/vehicles/${vehicleId}/inspection`, data)
}

export function getViolationRecords(vehicleId) {
  return request.get(`/operations/vehicles/${vehicleId}/violations`)
}

export function addViolationRecord(vehicleId, data) {
  return request.post(`/operations/vehicles/${vehicleId}/violations`, data)
}

export function updateViolationStatus(vehicleId, recordId, data) {
  return request.put(`/operations/vehicles/${vehicleId}/violations/${recordId}`, data)
}
