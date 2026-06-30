const express = require('express')
const db = require('../db/db')
const { authMiddleware } = require('../middleware/auth')
const { requireRole } = require('../middleware/rbac')
const multer = require('multer')
const path = require('path')

const router = express.Router()
router.use(authMiddleware)

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.pdf'].includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持 JPG/PNG/PDF 格式'))
    }
  }
})

router.get('/', (req, res) => {
  const { department_id, type, status, keyword } = req.query
  let sql = `SELECT v.*, d.name as department_name FROM vehicles v LEFT JOIN departments d ON v.department_id = d.id WHERE 1=1`
  const params = []

  if (department_id) { sql += ' AND v.department_id = ?'; params.push(department_id) }
  if (type) { sql += ' AND v.vehicle_type = ?'; params.push(type) }
  if (status) { sql += ' AND v.status = ?'; params.push(status) }
  if (keyword) { sql += ' AND (v.plate_number LIKE ? OR v.brand_model LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`) }

  sql += ' ORDER BY v.id DESC'
  const vehicles = db.prepare(sql).all(...params)
  res.json(vehicles)
})

router.get('/:id', (req, res) => {
  const vehicle = db.prepare(`
    SELECT v.*, d.name as department_name
    FROM vehicles v LEFT JOIN departments d ON v.department_id = d.id
    WHERE v.id = ?
  `).get(req.params.id)

  if (!vehicle) return res.status(404).json({ error: '车辆不存在' })
  res.json(vehicle)
})

router.post('/', requireRole('admin', 'dispatcher'), (req, res) => {
  const { plate_number, brand_model, vehicle_type, fuel_type, engine_displacement, seat_count,
    purchase_date, purchase_price, color, department_id, emission_standard, service_life,
    quota_type, vin } = req.body

  if (!plate_number || !brand_model) {
    return res.status(422).json({ error: '参数错误', details: ['车牌号和品牌型号为必填'] })
  }

  const existing = db.prepare('SELECT id FROM vehicles WHERE plate_number = ?').get(plate_number)
  if (existing) return res.status(409).json({ error: '该车牌号已存在' })

  const result = db.prepare(`
    INSERT INTO vehicles (plate_number, vin, brand_model, vehicle_type, fuel_type, engine_displacement,
      seat_count, purchase_date, purchase_price, color, department_id, emission_standard, service_life, quota_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(plate_number, vin || null, brand_model, vehicle_type || '轿车', fuel_type || '汽油',
    engine_displacement || null, seat_count || 5, purchase_date || null, purchase_price || null,
    color || null, department_id || null, emission_standard || null, service_life || null, quota_type || '一般公务用车')

  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(vehicle)
})

router.put('/:id', requireRole('admin', 'dispatcher'), (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id)
  if (!vehicle) return res.status(404).json({ error: '车辆不存在' })

  const fields = ['plate_number', 'vin', 'brand_model', 'vehicle_type', 'fuel_type', 'engine_displacement',
    'seat_count', 'purchase_date', 'purchase_price', 'color', 'emission_standard', 'service_life',
    'department_id', 'status', 'mileage', 'inspection_due', 'insurance_due', 'insurance_type',
    'insurance_company', 'quota_type', 'remark']

  const sets = []
  const params = []
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`)
      params.push(req.body[f])
    }
  }

  if (sets.length === 0) return res.status(422).json({ error: '无更新字段' })

  sets.push('updated_at = CURRENT_TIMESTAMP')
  params.push(req.params.id)

  db.prepare(`UPDATE vehicles SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  const updated = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id)
  res.json(updated)
})

router.delete('/:id', requireRole('admin'), (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id)
  if (!vehicle) return res.status(404).json({ error: '车辆不存在' })

  const hasTrips = db.prepare('SELECT COUNT(*) as count FROM trips WHERE vehicle_id = ?').get(req.params.id)
  if (hasTrips.count > 0) return res.status(409).json({ error: '该车辆有关联的行程记录，无法删除' })

  db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id)
  res.json({ message: '删除成功' })
})

router.post('/:id/upload', requireRole('admin', 'dispatcher'), upload.single('file'), (req, res) => {
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id)
  if (!vehicle) return res.status(404).json({ error: '车辆不存在' })

  const filePath = '/uploads/' + req.file.filename
  const field = req.body.field || 'image_url'
  db.prepare(`UPDATE vehicles SET ${field} = ? WHERE id = ?`).run(filePath, req.params.id)

  res.json({ url: filePath })
})

module.exports = router
