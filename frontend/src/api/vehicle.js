import request from './request'

export function getVehicles(params) {
  return request.get('/vehicles', { params })
}

export function getVehicle(id) {
  return request.get(`/vehicles/${id}`)
}

export function createVehicle(data) {
  return request.post('/vehicles', data)
}

export function updateVehicle(id, data) {
  return request.put(`/vehicles/${id}`, data)
}

export function deleteVehicle(id) {
  return request.delete(`/vehicles/${id}`)
}
