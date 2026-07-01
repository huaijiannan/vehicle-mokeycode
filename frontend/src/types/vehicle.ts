export interface Vehicle {
  id: string
  plateNumber: string
  brand: string
  model: string
  year: number
  vin: string
  status: 'normal' | 'maintenance' | 'offline'
  department: string
  purchaseDate: string
  purchasePrice: number
  currentMileage: number
}

export interface FuelRecord {
  id: string
  vehicleId: string
  cardNumber: string
  fuelType: '92#' | '95#' | '98#' | '0#柴油'
  amount: number
  pricePerLiter: number
  liters: number
  odometer: number
  station: string
  driverName: string
  refuelTime: string
}

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  workshopName: string
  type: 'routine' | 'repair' | 'overhaul' | 'emergency'
  description: string
  items: string[]
  cost: number
  odometer: number
  startTime: string
  endTime: string
  status: 'pending' | 'in_progress' | 'completed'
  rating?: number
}

export interface InsuranceRecord {
  id: string
  vehicleId: string
  insuranceCompany: string
  policyNumber: string
  type: '交强险' | '商业险' | '车损险' | '三者险'
  coverageAmount: number
  premium: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'claimed'
}

export interface InsuranceClaim {
  id: string
  vehicleId: string
  insuranceId: string
  claimNumber: string
  accidentTime: string
  accidentType: string
  accidentLocation: string
  description: string
  claimedAmount: number
  settledAmount: number
  status: 'reported' | 'assessing' | 'settled' | 'closed'
}

export interface InspectionRecord {
  id: string
  vehicleId: string
  nextDueDate: string
  lastInspectionDate?: string
  inspectionStation?: string
  result?: 'pass' | 'fail'
  cost?: number
  bookingDate?: string
  status: 'pending' | 'booked' | 'completed' | 'overdue'
  reportFile?: string
}
