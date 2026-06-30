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
  limits: { fileSize: 5 * 1024 * 1024 }
})

function updateDriverStatus(driverId) {
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId)
  if (!driver) return

  let status = driver.status
  let focusLevel = '正常'
  let violations = 0

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const healthCheck = db.prepare(`
    SELECT * FROM driver_health_checks WHERE driver_id = ? AND is_qualified = 0
    ORDER BY check_date DESC LIMIT 1
  `).get(driverId)
  if (healthCheck && !healthCheck.follow_up_done) {
    status = '暂停出车'
  }

  const lastTraining = db.prepare(`
    SELECT training_date FROM driver_trainings WHERE driver_id = ? ORDER BY training_date DESC LIMIT 1
  `).get(driverId)

  const trainingOverdue = lastTraining
    ? (new Date(todayStr) - new Date(lastTraining.training_date)) / (1000 * 60 * 60 * 24) > 180
    : true

  const lastHealth = db.prepare(`
    SELECT check_date FROM driver_health_checks WHERE driver_id = ? AND is_qualified = 1
    ORDER BY check_date DESC LIMIT 1
  `).get(driverId)

  const healthOverdue = lastHealth
    ? (new Date(todayStr) - new Date(lastHealth.check_date)) / (1000 * 60 * 60 * 24) > 365
    : true

  const licenseOverdue = driver.license_valid_to
    ? new Date(driver.license_valid_to) < new Date(todayStr)
    : false

  const violations12m = db.prepare(`
    SELECT COUNT(*) as count FROM driver_violations
    WHERE driver_id = ? AND violation_date >= date(?, '-12 months')
  `).get(driverId, todayStr)

  violations = violations12m.count

  if (licenseOverdue) {
    status = '暂停出车'
  }

  if (violations >= 3) {
    focusLevel = '重点关注'
  }

  const retireAge = driver.gender === '女' ? 55 : 60
  if (driver.birth_date) {
    const age = Math.floor((new Date(todayStr) - new Date(driver.birth_date)) / (1000 * 60 * 60 * 24 * 365))
    if (age >= retireAge - 1) {
      focusLevel = '退休预警'
    }
  }

  if (status !== '出车中') {
    const activeTrip = db.prepare(`
      SELECT t.id FROM trips t WHERE t.driver_id = ? AND t.status IN ('出车中')
    `).get(driverId)
    if (!activeTrip) {
      if (status === '暂停出车') {
        // keep paused
      } else {
        status = '空闲'
      }
    }
  }

  db.prepare(`
    UPDATE drivers SET status = ?, focus_level = ?, training_overdue = ?,
    health_overdue = ?, license_overdue = ?, violation_count_12m = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(status, focusLevel, trainingOverdue ? 1 : 0, healthOverdue ? 1 : 0,
    licenseOverdue ? 1 : 0, violations, driverId)
}

router.get('/', (req, res) => {
  const { status, department_id, license_class, quota_type, keyword } = req.query
  let sql = `SELECT d.*, dp.name as department_name FROM drivers d LEFT JOIN departments dp ON d.department_id = dp.id WHERE 1=1`
  const params = []

  if (status) { sql += ' AND d.status = ?'; params.push(status) }
  if (department_id) { sql += ' AND d.department_id = ?'; params.push(department_id) }
  if (license_class) { sql += ' AND d.license_class = ?'; params.push(license_class) }
  if (quota_type) { sql += ' AND d.quota_type = ?'; params.push(quota_type) }
  if (keyword) {
    sql += ' AND (d.real_name LIKE ? OR d.employee_id LIKE ? OR d.license_number LIKE ?)'
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`)
  }

  sql += ' ORDER BY d.id DESC'
  const drivers = db.prepare(sql).all(...params)

  drivers.forEach(d => {
    updateDriverStatus(d.id)
  })

  const updated = db.prepare(sql).all(...params)
  res.json(updated)
})

router.get('/:id', (req, res) => {
  const driver = db.prepare(`
    SELECT d.*, dp.name as department_name
    FROM drivers d LEFT JOIN departments dp ON d.department_id = dp.id
    WHERE d.id = ?
  `).get(req.params.id)

  if (!driver) return res.status(404).json({ error: '驾驶员不存在' })

  updateDriverStatus(driver.id)

  const trainings = db.prepare('SELECT * FROM driver_trainings WHERE driver_id = ? ORDER BY training_date DESC').all(req.params.id)
  const violations = db.prepare('SELECT * FROM driver_violations WHERE driver_id = ? ORDER BY violation_date DESC').all(req.params.id)
  const healthChecks = db.prepare('SELECT * FROM driver_health_checks WHERE driver_id = ? ORDER BY check_date DESC').all(req.params.id)

  const updated = db.prepare(`
    SELECT d.*, dp.name as department_name
    FROM drivers d LEFT JOIN departments dp ON d.department_id = dp.id
    WHERE d.id = ?
  `).get(req.params.id)

  res.json({ ...updated, trainings, violations, healthChecks })
})

function generateEmployeeId() {
  const year = new Date().getFullYear()
  const count = db.prepare("SELECT COUNT(*) as c FROM drivers WHERE employee_id LIKE ?").get(`DRV${year}%`)
  const seq = String((count.c || 0) + 1).padStart(3, '0')
  return `DRV${year}${seq}`
}

router.post('/', requireRole('admin', 'dispatcher'), (req, res) => {
  const { real_name, gender, birth_date, phone, political_status, quota_type, hire_date,
    department_id, license_number, license_class, license_first_date, license_valid_from,
    license_valid_to, license_authority, qualification_number, qualification_type,
    qualification_valid_from, qualification_valid_to, is_secret_post, secret_level } = req.body

  if (!real_name || !phone) {
    return res.status(422).json({ error: '参数错误', details: ['姓名和电话为必填'] })
  }

  const employeeId = generateEmployeeId()

  const birth = birth_date ? new Date(birth_date) : null
  const today = new Date()
  const age = birth ? Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 365)) : null
  const drivingAge = license_first_date ? Math.floor((today - new Date(license_first_date)) / (1000 * 60 * 60 * 24 * 365)) : null
  const workAge = hire_date ? Math.floor((today - new Date(hire_date)) / (1000 * 60 * 60 * 24 * 365)) : null

  const result = db.prepare(`
    INSERT INTO drivers (employee_id, real_name, gender, birth_date, phone, political_status, quota_type,
      hire_date, department_id, age, driving_age, work_age, license_number, license_class,
      license_first_date, license_valid_from, license_valid_to, license_authority,
      qualification_number, qualification_type, qualification_valid_from, qualification_valid_to,
      is_secret_post, secret_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(employeeId, real_name, gender || '男', birth_date || null, phone,
    political_status || '群众', quota_type || '在编', hire_date || null,
    department_id || null, age, drivingAge, workAge,
    license_number || null, license_class || 'C1', license_first_date || null,
    license_valid_from || null, license_valid_to || null, license_authority || null,
    qualification_number || null, qualification_type || null,
    qualification_valid_from || null, qualification_valid_to || null,
    is_secret_post || 0, secret_level || null)

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(driver)
})

router.put('/:id', requireRole('admin', 'dispatcher'), (req, res) => {
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id)
  if (!driver) return res.status(404).json({ error: '驾驶员不存在' })

  const fields = ['real_name', 'gender', 'birth_date', 'phone', 'political_status', 'quota_type',
    'hire_date', 'department_id', 'license_number', 'license_class', 'license_first_date',
    'license_valid_from', 'license_valid_to', 'license_authority', 'license_image',
    'qualification_number', 'qualification_type', 'qualification_valid_from', 'qualification_valid_to',
    'qualification_image', 'is_secret_post', 'secret_level', 'status']

  const sets = []
  const params = []
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      sets.push(`${f} = ?`)
      params.push(req.body[f])
    }
  }

  if (req.body.birth_date) {
    const birth = new Date(req.body.birth_date)
    const age = Math.floor((new Date() - birth) / (1000 * 60 * 60 * 24 * 365))
    sets.push('age = ?')
    params.push(age)
  }
  if (req.body.license_first_date) {
    const drivingAge = Math.floor((new Date() - new Date(req.body.license_first_date)) / (1000 * 60 * 60 * 24 * 365))
    sets.push('driving_age = ?')
    params.push(drivingAge)
  }
  if (req.body.hire_date) {
    const workAge = Math.floor((new Date() - new Date(req.body.hire_date)) / (1000 * 60 * 60 * 24 * 365))
    sets.push('work_age = ?')
    params.push(workAge)
  }

  if (sets.length === 0) return res.status(422).json({ error: '无更新字段' })

  sets.push('updated_at = CURRENT_TIMESTAMP')
  params.push(req.params.id)

  db.prepare(`UPDATE drivers SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  updateDriverStatus(req.params.id)

  const updated = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id)
  res.json(updated)
})

router.post('/:id/training', requireRole('admin', 'dispatcher'), (req, res) => {
  const { training_date, training_type, duration, content, assessment_result, trainer } = req.body
  if (!training_date || !training_type) {
    return res.status(422).json({ error: '参数错误', details: ['培训日期和类型为必填'] })
  }

  const driver = db.prepare('SELECT id FROM drivers WHERE id = ?').get(req.params.id)
  if (!driver) return res.status(404).json({ error: '驾驶员不存在' })

  const result = db.prepare(`
    INSERT INTO driver_trainings (driver_id, training_date, training_type, duration, content, assessment_result, trainer)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, training_date, training_type, duration || null,
    content || null, assessment_result || null, trainer || null)

  updateDriverStatus(req.params.id)

  const training = db.prepare('SELECT * FROM driver_trainings WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(training)
})

router.get('/:id/training', (req, res) => {
  const trainings = db.prepare(
    'SELECT * FROM driver_trainings WHERE driver_id = ? ORDER BY training_date DESC'
  ).all(req.params.id)
  res.json(trainings)
})

router.post('/:id/violation', requireRole('admin', 'dispatcher', 'inspector'), (req, res) => {
  const { violation_date, violation_type, location, description, penalty, points_deducted } = req.body
  if (!violation_date || !violation_type) {
    return res.status(422).json({ error: '参数错误', details: ['违章日期和类型为必填'] })
  }

  const driver = db.prepare('SELECT id FROM drivers WHERE id = ?').get(req.params.id)
  if (!driver) return res.status(404).json({ error: '驾驶员不存在' })

  const result = db.prepare(`
    INSERT INTO driver_violations (driver_id, violation_date, violation_type, location, description, penalty, points_deducted)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, violation_date, violation_type, location || null,
    description || null, penalty || null, points_deducted || 0)

  updateDriverStatus(req.params.id)

  const violation = db.prepare('SELECT * FROM driver_violations WHERE id = ?').get(result.lastInsertRowid)

  const stats = db.prepare(`
    SELECT COUNT(*) as count FROM driver_violations
    WHERE driver_id = ? AND violation_date >= date('now', '-12 months')
  `).get(req.params.id)

  if (stats.count >= 3) {
    db.prepare("INSERT INTO notifications (user_id, title, content, type) VALUES (?, ?, ?, 'warning')")
      .run(1, '驾驶员违章预警', `${driver.real_name || '驾驶员'}近12个月累计违章${stats.count}次，已标记为重点关注`, 1)
  }

  res.status(201).json(violation)
})

router.get('/:id/violation', (req, res) => {
  const violations = db.prepare(
    'SELECT * FROM driver_violations WHERE driver_id = ? ORDER BY violation_date DESC'
  ).all(req.params.id)
  res.json(violations)
})

router.post('/:id/health-check', requireRole('admin', 'dispatcher'), (req, res) => {
  const { check_date, institution, conclusion, is_qualified, follow_up } = req.body
  if (!check_date || !conclusion) {
    return res.status(422).json({ error: '参数错误', details: ['体检日期和结论为必填'] })
  }

  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id)
  if (!driver) return res.status(404).json({ error: '驾驶员不存在' })

  const result = db.prepare(`
    INSERT INTO driver_health_checks (driver_id, check_date, institution, conclusion, is_qualified, follow_up)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, check_date, institution || null, conclusion,
    is_qualified !== undefined ? is_qualified : 1, follow_up || null)

  if (is_qualified === 0 || conclusion === '不合格' || conclusion === '需复查') {
    db.prepare('UPDATE drivers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run('暂停出车', req.params.id)
    db.prepare("INSERT INTO notifications (user_id, title, content, type) VALUES (?, ?, ?, 'warning')")
      .run(1, '驾驶员体检异常', `${driver.real_name || '驾驶员'}体检${conclusion}，已暂停出车`, 1)
  }

  updateDriverStatus(req.params.id)

  const healthCheck = db.prepare('SELECT * FROM driver_health_checks WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json(healthCheck)
})

router.get('/:id/health-check', (req, res) => {
  const healthChecks = db.prepare(
    'SELECT * FROM driver_health_checks WHERE driver_id = ? ORDER BY check_date DESC'
  ).all(req.params.id)
  res.json(healthChecks)
})

router.post('/:id/upload', requireRole('admin', 'dispatcher'), upload.single('file'), (req, res) => {
  const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id)
  if (!driver) return res.status(404).json({ error: '驾驶员不存在' })

  const filePath = '/uploads/' + req.file.filename
  const field = req.body.field || 'license_image'
  db.prepare(`UPDATE drivers SET ${field} = ? WHERE id = ?`).run(filePath, req.params.id)

  res.json({ url: filePath })
})

module.exports = router
