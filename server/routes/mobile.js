const express = require('express')
const db = require('../db/db')
const { authMiddleware } = require('../middleware/auth')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()
router.use(authMiddleware)

const uploadDir = path.join(__dirname, '..', 'uploads', 'mobile')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
  }
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

router.post('/ocr/odometer', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请上传里程表照片' })
  }
  const baseMileage = Math.floor(Math.random() * 50000) + 50000
  res.json({
    mileage: baseMileage,
    photo_url: '/uploads/mobile/' + req.file.filename,
    confidence: 0.92
  })
})

router.get('/dashboard/overview', (req, res) => {
  const todayApps = db.prepare("SELECT COUNT(*) as count FROM applications WHERE date(created_at) = date('now')").get().count
  const activeTrips = db.prepare("SELECT COUNT(*) as count FROM trips WHERE status = '出车中' OR status = 'active'").get().count
  const completedTrips = db.prepare("SELECT COUNT(*) as count FROM trips WHERE (status = '已完成' OR status = 'completed') AND date(end_time) = date('now')").get().count
  const idleVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = '空闲'").get().count
  const totalVehicles = db.prepare('SELECT COUNT(*) as count FROM vehicles').get().count
  const maintenanceVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = '维修中'").get().count
  const inUseVehicles = db.prepare("SELECT COUNT(*) as count FROM vehicles WHERE status = '出车中'").get().count
  const pendingApps = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = '待审批' OR status = 'pending'").get().count
  const approvedApps = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = '已审批' OR status = 'approved'").get().count

  res.json({
    today_applies: todayApps,
    active_trips: activeTrips,
    completed_trips: completedTrips,
    idle_vehicles: idleVehicles,
    total_vehicles: totalVehicles,
    maintenance_vehicles: maintenanceVehicles,
    in_use_vehicles: inUseVehicles,
    inactive_vehicles: totalVehicles - idleVehicles - inUseVehicles - maintenanceVehicles,
    pending_approvals: pendingApps,
    pending_dispatches: approvedApps
  })
})

router.get('/vehicle/status-grid', (req, res) => {
  const vehicles = db.prepare('SELECT id, plate_number, brand_model, status, department_id FROM vehicles').all()
  const idle = vehicles.filter(v => v.status === '空闲')
  const inUse = vehicles.filter(v => v.status === '出车中')
  const maintenance = vehicles.filter(v => v.status === '维修中')

  res.json({
    vehicles: vehicles.map(v => ({ ...v, driver: null, task: null })),
    stats: {
      idle: idle.length,
      in_use: inUse.length,
      maintenance: maintenance.length,
      inactive: vehicles.length - idle.length - inUse.length - maintenance.length
    }
  })
})

router.get('/routes/frequent', (req, res) => {
  res.json([
    { origin: '总部', destination: '市政府' },
    { origin: '总部', destination: '高新区管委会' },
    { origin: '总部', destination: '高铁站' },
    { origin: '总部', destination: '临港产业园' },
    { origin: '总部', destination: '金融港大厦' }
  ])
})

router.get('/applies', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query
  const userId = req.user.id
  const list = db.prepare(
    'SELECT * FROM applications WHERE applicant_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(userId, Number(pageSize), (Number(page) - 1) * Number(pageSize))
  const total = db.prepare('SELECT COUNT(*) as count FROM applications WHERE applicant_id = ?').get(userId).count
  res.json({ list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.get('/applies/:id', (req, res) => {
  const apply = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id)
  if (!apply) return res.status(404).json({ error: '申请不存在' })
  res.json(apply)
})

router.post('/applies', (req, res) => {
  const { purpose, origin, destination, departureTime, returnTime, passengerCount, needDriver, remark } = req.body
  if (!purpose || !origin || !destination || !departureTime || !returnTime) {
    return res.status(422).json({ error: '请填写完整的申请信息' })
  }

  const user = db.prepare('SELECT department_id FROM users WHERE id = ?').get(req.user.id)
  db.prepare(`INSERT INTO applications (applicant_id, department_id, purpose, origin, destination, depart_time, return_time, passenger_count, need_driver, remark, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待审批')`).run(
    req.user.id, user?.department_id, purpose, origin, destination, departureTime, returnTime, passengerCount || 1, needDriver ? 1 : 0, remark || ''
  )
  res.json({ message: '申请提交成功' })
})

router.get('/approves', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query
  const list = db.prepare(
    `SELECT a.*, u.real_name as applicant_name, d.name as department_name
     FROM applications a
     LEFT JOIN users u ON a.applicant_id = u.id
     LEFT JOIN departments d ON a.department_id = d.id
     WHERE a.status IN ('待审批', 'pending')
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
  ).all(Number(pageSize), (Number(page) - 1) * Number(pageSize))
  const total = db.prepare("SELECT COUNT(*) as count FROM applications WHERE status IN ('待审批', 'pending')").get().count
  res.json({ list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.put('/approves/:id', (req, res) => {
  const { action, reason } = req.body
  if (!['approve', 'reject'].includes(action)) {
    return res.status(422).json({ error: '无效的操作' })
  }
  const status = action === 'approve' ? '已审批' : '已驳回'
  db.prepare("UPDATE applications SET status = ?, reject_reason = ?, updated_at = datetime('now') WHERE id = ?").run(
    status, reason || '', req.params.id
  )
  res.json({ message: action === 'approve' ? '审批已通过' : '已驳回' })
})

router.get('/dispatches', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query
  const list = db.prepare(
    `SELECT a.*, u.real_name as applicant_name, d.name as department_name
     FROM applications a
     LEFT JOIN users u ON a.applicant_id = u.id
     LEFT JOIN departments d ON a.department_id = d.id
     WHERE a.status IN ('已审批', 'approved')
     AND a.id NOT IN (SELECT application_id FROM dispatches)
     ORDER BY a.created_at ASC LIMIT ? OFFSET ?`
  ).all(Number(pageSize), (Number(page) - 1) * Number(pageSize))
  const total = db.prepare(
    "SELECT COUNT(*) as count FROM applications WHERE status IN ('已审批', 'approved') AND id NOT IN (SELECT application_id FROM dispatches)"
  ).get().count
  res.json({ list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.put('/dispatches/:id/assign', (req, res) => {
  const { vehicleId, driverId } = req.body
  if (!vehicleId || !driverId) {
    return res.status(422).json({ error: '请选择车辆和司机' })
  }

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicleId)
  if (!vehicle) return res.status(404).json({ error: '车辆不存在' })
  if (vehicle.status !== '空闲') return res.status(400).json({ error: '车辆不可用' })

  const apply = db.prepare("SELECT * FROM applications WHERE id = ? AND status IN ('已审批', 'approved')").get(req.params.id)
  if (!apply) return res.status(404).json({ error: '申请不存在或状态异常' })

  db.prepare("UPDATE applications SET status = '已派车', updated_at = datetime('now') WHERE id = ?").run(req.params.id)

  const dispatchResult = db.prepare(
    'INSERT INTO dispatches (application_id, vehicle_id, driver_id, dispatcher_id, status) VALUES (?, ?, ?, ?, ?)'
  ).run(req.params.id, vehicleId, driverId, req.user.id, '已派车')

  db.prepare("UPDATE vehicles SET status = '出车中' WHERE id = ?").run(vehicleId)

  db.prepare(
    "INSERT INTO trips (dispatch_id, vehicle_id, driver_id, status) VALUES (?, ?, ?, '待出车')"
  ).run(dispatchResult.lastInsertRowid, vehicleId, driverId)

  res.json({ message: '派车成功', dispatch_id: dispatchResult.lastInsertRowid })
})

router.get('/available-vehicles', (req, res) => {
  const vehicles = db.prepare("SELECT id, plate_number, brand_model, vehicle_type, seat_count FROM vehicles WHERE status = '空闲'").all()
  res.json(vehicles)
})

router.get('/available-drivers', (req, res) => {
  const drivers = db.prepare("SELECT id, real_name, phone FROM drivers WHERE status = '空闲'").all()
  res.json(drivers)
})

router.get('/tasks', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query
  const driverUserId = req.user.id

  const list = db.prepare(
    `SELECT t.*, v.plate_number, v.brand_model, a.purpose, a.origin, a.destination, a.passenger_count, d.id as dispatch_id
     FROM trips t
     LEFT JOIN vehicles v ON t.vehicle_id = v.id
     LEFT JOIN dispatches d ON t.dispatch_id = d.id
     LEFT JOIN applications a ON d.application_id = a.id
     WHERE t.driver_id IN (SELECT id FROM drivers WHERE employee_id = (SELECT username FROM users WHERE id = ?))
     ORDER BY t.created_at DESC LIMIT ? OFFSET ?`
  ).all(driverUserId, Number(pageSize), (Number(page) - 1) * Number(pageSize))

  const total = db.prepare(
    'SELECT COUNT(*) as count FROM trips WHERE driver_id IN (SELECT id FROM drivers WHERE employee_id = (SELECT username FROM users WHERE id = ?))'
  ).get(driverUserId).count

  res.json({ list, total, page: Number(page), pageSize: Number(pageSize) })
})

router.get('/tasks/:id', (req, res) => {
  const task = db.prepare(
    `SELECT t.*, v.plate_number, v.brand_model, a.purpose, a.origin, a.destination, a.passenger_count
     FROM trips t
     LEFT JOIN vehicles v ON t.vehicle_id = v.id
     LEFT JOIN dispatches d ON t.dispatch_id = d.id
     LEFT JOIN applications a ON d.application_id = a.id
     WHERE t.id = ?`
  ).get(req.params.id)
  if (!task) return res.status(404).json({ error: '任务不存在' })
  res.json(task)
})

router.post('/tasks/:id/start', upload.single('photo'), (req, res) => {
  const { mileage } = req.body
  if (!mileage) return res.status(422).json({ error: '请输入起始里程' })

  const task = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id)
  if (!task) return res.status(404).json({ error: '任务不存在' })
  if (task.status !== '待出车') return res.status(400).json({ error: '任务状态异常' })

  const photoUrl = req.file ? '/uploads/mobile/' + req.file.filename : null
  db.prepare("UPDATE trips SET status = '出车中', start_time = datetime('now'), start_odometer = ? WHERE id = ?").run(
    Number(mileage), req.params.id
  )

  res.json({ message: '出车确认成功' })
})

router.post('/tasks/:id/end', upload.single('photo'), (req, res) => {
  const { mileage } = req.body
  if (!mileage) return res.status(422).json({ error: '请输入结束里程' })

  const task = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id)
  if (!task) return res.status(404).json({ error: '任务不存在' })
  if (task.status !== '出车中') return res.status(400).json({ error: '任务状态异常' })

  const tripKm = Number(mileage) - (task.start_odometer || 0)
  if (tripKm < 0) return res.status(400).json({ error: '结束里程不能小于起始里程' })

  const photoUrl = req.file ? '/uploads/mobile/' + req.file.filename : null
  db.prepare("UPDATE trips SET status = '已完成', end_time = datetime('now'), end_odometer = ?, total_mileage = ? WHERE id = ?").run(
    Number(mileage), tripKm, req.params.id
  )
  db.prepare("UPDATE vehicles SET status = '空闲', mileage = mileage + ? WHERE id = ?").run(tripKm, task.vehicle_id)

  res.json({ message: '归库确认成功', trip_mileage: tripKm })
})

router.post('/expenses', upload.single('photo'), (req, res) => {
  const { type, amount, note } = req.body
  if (!type || !amount) return res.status(422).json({ error: '请填写费用类型和金额' })

  const driverUserId = req.user.id
  const activeTrip = db.prepare(
    `SELECT t.* FROM trips t WHERE t.driver_id IN (SELECT id FROM drivers WHERE employee_id = (SELECT username FROM users WHERE id = ?)) AND t.status = '出车中' LIMIT 1`
  ).get(driverUserId)

  const vehicleId = activeTrip ? activeTrip.vehicle_id : null
  const tripId = activeTrip ? activeTrip.id : null
  const receiptUrl = req.file ? '/uploads/mobile/' + req.file.filename : null

  db.prepare(
    'INSERT INTO expenses (vehicle_id, trip_id, expense_type, amount, description, receipt_url, occurred_at, reporter_id) VALUES (?, ?, ?, ?, ?, ?, datetime(\'now\'), ?)'
  ).run(vehicleId, tripId, type, Number(amount), note || '', receiptUrl, req.user.id)

  res.json({ message: '费用记录成功' })
})

router.post('/repairs', upload.array('photos', 3), (req, res) => {
  const { vehicle, description, vehicleModel } = req.body
  if (!vehicle || !description) return res.status(422).json({ error: '请填写车辆和故障描述' })

  const foundVehicle = db.prepare("SELECT id FROM vehicles WHERE plate_number = ?").get(vehicle)
  const vehicleId = foundVehicle ? foundVehicle.id : 1

  db.prepare(
    "INSERT INTO maintenances (vehicle_id, record_type, date, items, status, operator, cost, shop_id) VALUES (?, 'repair', datetime('now'), ?, '待处理', ?, 0, NULL)"
  ).run(vehicleId, description, req.user.real_name)

  res.json({ message: '报修已提交' })
})

router.get('/notifications', (req, res) => {
  const notifications = [
    { id: 1, type: 'approve', title: '新的待审批申请', content: '张伟提交了项目考察用车申请', time: '10分钟前', unread: true },
    { id: 2, type: 'dispatch', title: '任务已派发', content: '您被分配了客户接待用车任务', time: '30分钟前', unread: true },
    { id: 3, type: 'approve', title: '审批结果', content: '您的设备验收申请已被驳回', time: '2小时前', unread: false },
    { id: 4, type: 'alert', title: '归库确认', content: '京A·88888已完成归库', time: '3小时前', unread: false },
    { id: 5, type: 'system', title: '系统通知', content: '系统将于今晚22:00进行维护升级', time: '昨天', unread: false }
  ]
  res.json({ list: notifications, unread: notifications.filter(n => n.unread).length })
})

router.put('/notifications/:id/read', (req, res) => {
  res.json({ message: '已标记为已读' })
})

module.exports = router
