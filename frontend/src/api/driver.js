import request from './request'

export function getDrivers(params) {
  return request.get('/drivers', { params })
}

export function getDriver(id) {
  return request.get(`/drivers/${id}`)
}

export function createDriver(data) {
  return request.post('/drivers', data)
}

export function updateDriver(id, data) {
  return request.put(`/drivers/${id}`, data)
}

export function addTraining(driverId, data) {
  return request.post(`/drivers/${driverId}/training`, data)
}

export function getTrainings(driverId) {
  return request.get(`/drivers/${driverId}/training`)
}

export function addViolation(driverId, data) {
  return request.post(`/drivers/${driverId}/violation`, data)
}

export function getViolations(driverId) {
  return request.get(`/drivers/${driverId}/violation`)
}

export function addHealthCheck(driverId, data) {
  return request.post(`/drivers/${driverId}/health-check`, data)
}

export function getHealthChecks(driverId) {
  return request.get(`/drivers/${driverId}/health-check`)
}
