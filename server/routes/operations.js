const express = require('express')
const db = require('../db/db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()
router.use(authMiddleware)

// ==================== 组织架构 ====================

router.get('/departments', (req, res) => {
  const depts = db.prepare('SELECT id, name, parent_id, level FROM departments ORDER BY id').all()
  const vehicleCounts = db.prepare('SELECT department_id, COUNT(*) as count FROM vehicles GROUP BY department_id').all()
  const countMap = {}
  vehicleCounts.forEach(v => { countMap[v.department_id] = v.count })

  function buildTree(parentId) {
    return depts
      .filter(d => d.parent_id === parentId)
      .map(d => ({
        id: String(d.id),
        name: d.name,
        level: d.level,
        vehicleCount: countMap[d.id] || 0,
        children: buildTree(d.id)
      }))
      .filter(d => d.level < 3 || d.vehicleCount > 0)
  }

  res.json(buildTree(null))
})

// ==================== 车辆列表 + 汇总 ====================

router.get('/vehicles', (req, res) => {
  const { orgId, search, status, type, page = '1', size = '15' } = req.query
  const pageNum = Math.max(1, parseInt(page))
  const pageSize = Math.min(50, Math.max(1, parseInt(size)))

  let whereClauses = ['1=1']
  const params = []

  if (orgId && orgId !== 'all') {
    const dept = db.prepare('SELECT id, level FROM departments WHERE id = ?').get(orgId)
    if (dept) {
      if (dept.level === 3) {
        whereClauses.push('v.department_id = ?')
        params.push(orgId)
      } else if (dept.level === 2) {
        const children = db.prepare('SELECT id FROM departments WHERE parent_id = ?').all(orgId)
        const ids = children.map(c => c.id)
        if (ids.length > 0) {
          whereClauses.push(`v.department_id IN (${ids.map(() => '?').join(',')})`)
          params.push(...ids)
        } else {
          whereClauses.push('v.department_id = ?')
          params.push(orgId)
        }
      }
    }
  }

  if (search) {
    whereClauses.push('(v.plate_number LIKE ? OR v.brand_model LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }
  if (status) {
    const statusMapping = {
      '运营中': ['空闲', '出车中'],
      '维修中': ['维修中'],
      '已停运': ['报废']
    }
    if (statusMapping[status]) {
      const mapped = statusMapping[status]
      whereClauses.push(`v.status IN (${mapped.map(() => '?').join(',')})`)
      params.push(...mapped)
    } else {
      whereClauses.push('v.status = ?')
      params.push(status)
    }
  }
  if (type) {
    whereClauses.push('v.vehicle_type = ?')
    params.push(type)
  }

  const whereSQL = whereClauses.join(' AND ')

  const countRow = db.prepare(`
    SELECT COUNT(*) as total FROM vehicles v LEFT JOIN departments d ON v.department_id = d.id WHERE ${whereSQL}
  `).get(...params)
  const total = countRow.total

  const offset = (pageNum - 1) * pageSize
  const list = db.prepare(`
    SELECT v.id, v.plate_number as plate, v.brand_model as model, v.vehicle_type as type,
      v.fuel_type as fuel, d.name as dept, v.status, v.vin
    FROM vehicles v LEFT JOIN departments d ON v.department_id = d.id
    WHERE ${whereSQL} ORDER BY v.id ASC LIMIT ? OFFSET ?
  `).all(...params, pageSize, offset)

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  const enriched = list.map(v => {
    const fuelMonth = db.prepare(`
      SELECT COALESCE(SUM(fuel_amount), 0) as total FROM refuels
      WHERE vehicle_id = ? AND refuel_date >= ? AND refuel_date < ?
    `).get(v.id, monthStart, nextMonthStr).total

    const repairMonth = db.prepare(`
      SELECT COALESCE(SUM(cost), 0) as total FROM maintenances
      WHERE vehicle_id = ? AND record_type = 'repair' AND date >= ? AND date < ?
    `).get(v.id, monthStart, nextMonthStr).total

    const latestOdo = db.prepare(`
      SELECT current_odometer FROM refuels WHERE vehicle_id = ?
      ORDER BY refuel_date DESC LIMIT 1
    `).get(v.id)

    const mileage = latestOdo?.current_odometer || v.mileage || null

    const latestInsurance = db.prepare(`
      SELECT expiry_date FROM vehicle_insurance WHERE vehicle_id = ? AND status = 'active'
      ORDER BY expiry_date DESC LIMIT 1
    `).get(v.id)

    const latestInspection = db.prepare(`
      SELECT next_inspection_date FROM vehicle_inspections WHERE vehicle_id = ?
      ORDER BY next_inspection_date DESC LIMIT 1
    `).get(v.id)

    const violationCount = db.prepare(`
      SELECT COUNT(*) as count FROM vehicle_violations WHERE vehicle_id = ?
    `).get(v.id).count

    const insExpiry = latestInsurance?.expiry_date
    const inspExpiry = latestInspection?.next_inspection_date
    const insExpiryDays = insExpiry ? Math.ceil((new Date(insExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : null
    const inspExpiryDays = inspExpiry ? Math.ceil((new Date(inspExpiry) - new Date()) / (1000 * 60 * 60 * 24)) : null

    return {
      ...v,
      mileage,
      fuelMonth,
      repairMonth,
      insuranceExpiry: insExpiry,
      inspectionExpiry: inspExpiry,
      insuranceStatus: insExpiryDays === null ? 'normal' : insExpiryDays < 0 ? 'expired' : insExpiryDays <= 30 ? 'expiring' : 'normal',
      inspectionStatus: inspExpiryDays === null ? 'normal' : inspExpiryDays < 0 ? 'expired' : inspExpiryDays <= 30 ? 'expiring' : 'normal',
      violationCount
    }
  })

  res.json({ list: enriched, total, page: pageNum, size: pageSize, totalPages: Math.ceil(total / pageSize) })
})

router.get('/summary', (req, res) => {
  const { orgId } = req.query
  let deptFilter = ''
  const params = []

  if (orgId && orgId !== 'all') {
    const dept = db.prepare('SELECT id, level FROM departments WHERE id = ?').get(orgId)
    if (dept) {
      if (dept.level === 3) {
        deptFilter = 'AND v.department_id = ?'
        params.push(orgId)
      } else if (dept.level === 2) {
        const children = db.prepare('SELECT id FROM departments WHERE parent_id = ?').all(orgId)
        const ids = children.map(c => c.id)
        if (ids.length > 0) {
          deptFilter = `AND v.department_id IN (${ids.map(() => '?').join(',')})`
          params.push(...ids)
        }
      }
    }
  }

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextMonthStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`

  const totalVehicles = db.prepare(`SELECT COUNT(*) as count FROM vehicles v WHERE 1=1 ${deptFilter}`).get(...params).count

  const fuelRow = db.prepare(`
    SELECT COALESCE(SUM(r.fuel_amount), 0) as total FROM refuels r
    JOIN vehicles v ON r.vehicle_id = v.id
    WHERE r.refuel_date >= ? AND r.refuel_date < ? ${deptFilter.replace(/v\./g, 'v.')}
  `).get(monthStart, nextMonthStr, ...params)

  const repairRow = db.prepare(`
    SELECT COALESCE(SUM(m.cost), 0) as total FROM maintenances m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE m.record_type = 'repair' AND m.date >= ? AND m.date < ? ${deptFilter.replace(/v\./g, 'v.')}
  `).get(monthStart, nextMonthStr, ...params)

  const inspectionWarnCount = db.prepare(`
    SELECT COUNT(DISTINCT v.id) as count FROM vehicles v
    JOIN vehicle_inspections insp ON v.id = insp.vehicle_id
    WHERE insp.next_inspection_date <= date('now', '+30 days') ${deptFilter.replace(/v\./g, 'v.')}
    AND v.id IN (SELECT vehicle_id FROM vehicle_inspections WHERE vehicle_id = v.id ORDER BY next_inspection_date DESC LIMIT 1)
  `).get(...params).count

  const insuranceWarnCount = db.prepare(`
    SELECT COUNT(DISTINCT v.id) as count FROM vehicles v
    JOIN vehicle_insurance ins ON v.id = ins.vehicle_id AND ins.status = 'active'
    WHERE ins.expiry_date <= date('now', '+30 days') ${deptFilter.replace(/v\./g, 'v.')}
  `).get(...params).count

  const violationVehicles = db.prepare(`
    SELECT COUNT(DISTINCT v.id) as count FROM vehicles v
    JOIN vehicle_violations vio ON v.id = vio.vehicle_id
    WHERE vio.status = '待处理' ${deptFilter.replace(/v\./g, 'v.')}
  `).get(...params).count

  res.json({
    totalVehicles,
    totalFuel: fuelRow.total,
    totalRepair: repairRow.total,
    inspectionWarning: inspectionWarnCount,
    insuranceWarning: insuranceWarnCount,
    violationVehicles
  })
})

router.get('/vehicles/:id/summary', (req, res) => {
  const v = db.prepare(`
    SELECT v.*, d.name as department_name FROM vehicles v
    LEFT JOIN departments d ON v.department_id = d.id WHERE v.id = ?
  `).get(req.params.id)
  if (!v) return res.status(404).json({ error: '车辆不存在' })
  res.json(v)
})

// ==================== 加油管理 ====================

router.get('/vehicles/:id/refuel', (req, res) => {
  const { month } = req.query
  let sql = 'SELECT * FROM refuels WHERE vehicle_id = ?'
  const params = [req.params.id]

  if (month) {
    sql += ' AND refuel_date >= ? AND refuel_date < ?'
    params.push(`${month}-01`)
    const nextMonth = new Date(month + '-01')
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    params.push(nextMonth.toISOString().split('T')[0])
  }

  sql += ' ORDER BY refuel_date DESC'
  const records = db.prepare(sql).all(...params)

  const stats = db.prepare(`
    SELECT COALESCE(SUM(fuel_amount), 0) as totalAmount, COALESCE(SUM(total_amount), 0) as totalCost
    FROM refuels WHERE vehicle_id = ?
    ${month ? 'AND refuel_date >= ? AND refuel_date < ?' : ''}
  `).get(...(month ? [req.params.id, `${month}-01`, params[params.length - 1]] : [req.params.id]))

  let avgConsumption = 0
  let isAbnormal = false
  if (records.length >= 2) {
    const sorted = [...records].sort((a, b) => a.refuel_date.localeCompare(b.refuel_date))
    let totalDist = 0
    let totalWeighted = 0
    for (let i = 1; i < sorted.length; i++) {
      const dist = sorted[i].current_odometer - sorted[i - 1].current_odometer
      if (dist > 0) {
        const consumption = (sorted[i].fuel_amount / dist) * 100
        totalWeighted += consumption * dist
        totalDist += dist
      }
    }
    avgConsumption = totalDist > 0 ? Math.round((totalWeighted / totalDist) * 10) / 10 : 0
    isAbnormal = avgConsumption > 13
  }

  res.json({ records, stats: { totalAmount: stats.totalAmount, totalCost: stats.totalCost, avgConsumption, isAbnormal } })
})

router.post('/vehicles/:id/refuel', (req, res) => {
  const { refuel_date, station_name, fuel_type, fuel_amount, unit_price, current_odometer, fuel_card_number } = req.body
  if (!refuel_date || !station_name || !fuel_type || !fuel_amount || !unit_price || !current_odometer) {
    return res.status(422).json({ error: '参数错误', details: ['加油日期、加油站、油品、加油量、单价、里程数为必填'] })
  }

  const total_amount = Math.round(fuel_amount * unit_price * 100) / 100
  const operator = req.user.real_name || req.user.username

  const result = db.prepare(`
    INSERT INTO refuels (vehicle_id, refuel_date, station_name, fuel_type, fuel_amount, unit_price, total_amount, current_odometer, fuel_card_number, operator)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, refuel_date, station_name, fuel_type, fuel_amount, unit_price, total_amount, current_odometer, fuel_card_number || null, operator)

  res.status(201).json({ id: result.lastInsertRowid, total_amount })
})

// ==================== 维修保养 ====================

router.get('/vehicles/:id/maintenance', (req, res) => {
  const repairs = db.prepare(`
    SELECT m.*, rs.name as shop_name FROM maintenances m
    LEFT JOIN repair_shops rs ON m.shop_id = rs.id
    WHERE m.vehicle_id = ? AND m.record_type = 'repair' ORDER BY m.date DESC
  `).all(req.params.id)

  const maintenances = db.prepare(`
    SELECT m.*, rs.name as shop_name FROM maintenances m
    LEFT JOIN repair_shops rs ON m.shop_id = rs.id
    WHERE m.vehicle_id = ? AND m.record_type = 'maintenance' ORDER BY m.date DESC
  `).all(req.params.id)

  res.json({ repairs, maintenances })
})

router.post('/vehicles/:id/maintenance', (req, res) => {
  const {
    record_type, date, repair_type, maintenance_type, items, cost, shop_id, status,
    current_odometer, next_maintenance_odometer, next_maintenance_date
  } = req.body

  if (!record_type || !date || !items) {
    return res.status(422).json({ error: '参数错误', details: ['记录类型、日期、项目描述为必填'] })
  }

  const operator = req.user.real_name || req.user.username
  const result = db.prepare(`
    INSERT INTO maintenances (vehicle_id, record_type, date, repair_type, maintenance_type, items, cost, shop_id, status, current_odometer, next_maintenance_odometer, next_maintenance_date, operator)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, record_type, date, repair_type || null, maintenance_type || null, items, cost || null, shop_id || null, status || null, current_odometer || null, next_maintenance_odometer || null, next_maintenance_date || null, operator)

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/vehicles/:id/maintenance/:recordId', (req, res) => {
  const { status } = req.body
  if (!status) return res.status(422).json({ error: '状态为必填' })

  db.prepare('UPDATE maintenances SET status = ? WHERE id = ? AND vehicle_id = ?').run(status, req.params.recordId, req.params.id)

  if (status === '已完工') {
    db.prepare("UPDATE vehicles SET status = '空闲' WHERE id = ?").run(req.params.id)
  }

  res.json({ message: '更新成功' })
})

// ==================== 维修厂 ====================

router.get('/repair-shops', (req, res) => {
  const shops = db.prepare('SELECT * FROM repair_shops ORDER BY name').all()
  res.json(shops)
})

router.post('/repair-shops', (req, res) => {
  const { name, contact_person, contact_phone, address } = req.body
  if (!name) return res.status(422).json({ error: '维修厂名称为必填' })

  const result = db.prepare('INSERT INTO repair_shops (name, contact_person, contact_phone, address) VALUES (?, ?, ?, ?)').run(name, contact_person || null, contact_phone || null, address || null)
  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/repair-shops/:id', (req, res) => {
  const { name, contact_person, contact_phone, address, status } = req.body
  const shop = db.prepare('SELECT * FROM repair_shops WHERE id = ?').get(req.params.id)
  if (!shop) return res.status(404).json({ error: '维修厂不存在' })

  const sets = []
  const params = []
  if (name !== undefined) { sets.push('name = ?'); params.push(name) }
  if (contact_person !== undefined) { sets.push('contact_person = ?'); params.push(contact_person) }
  if (contact_phone !== undefined) { sets.push('contact_phone = ?'); params.push(contact_phone) }
  if (address !== undefined) { sets.push('address = ?'); params.push(address) }
  if (status !== undefined) { sets.push('status = ?'); params.push(status) }
  if (sets.length === 0) return res.status(422).json({ error: '无更新字段' })

  params.push(req.params.id)
  db.prepare(`UPDATE repair_shops SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  res.json({ message: '更新成功' })
})

// ==================== 保险管理 ====================

router.get('/vehicles/:id/insurance', (req, res) => {
  const records = db.prepare('SELECT * FROM vehicle_insurance WHERE vehicle_id = ? ORDER BY effective_date DESC').all(req.params.id)
  res.json({ records })
})

router.post('/vehicles/:id/insurance', (req, res) => {
  const { insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date } = req.body
  if (!insurance_company || !insurance_type || !policy_number || !effective_date || !expiry_date) {
    return res.status(422).json({ error: '参数错误', details: ['保险公司、险种、保单号、生效日期、到期日期为必填'] })
  }

  const status = new Date(expiry_date) < new Date() ? 'expired' : new Date(expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring' : 'active'

  const result = db.prepare(`
    INSERT INTO vehicle_insurance (vehicle_id, insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.params.id, insurance_company, insurance_type, policy_number, coverage_amount || null, premium || null, effective_date, expiry_date, status)

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/vehicles/:id/insurance/:recordId', (req, res) => {
  const { insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date } = req.body
  const record = db.prepare('SELECT * FROM vehicle_insurance WHERE id = ? AND vehicle_id = ?').get(req.params.recordId, req.params.id)
  if (!record) return res.status(404).json({ error: '保险记录不存在' })

  const sets = []
  const params = []
  if (insurance_company !== undefined) { sets.push('insurance_company = ?'); params.push(insurance_company) }
  if (insurance_type !== undefined) { sets.push('insurance_type = ?'); params.push(insurance_type) }
  if (policy_number !== undefined) { sets.push('policy_number = ?'); params.push(policy_number) }
  if (coverage_amount !== undefined) { sets.push('coverage_amount = ?'); params.push(coverage_amount) }
  if (premium !== undefined) { sets.push('premium = ?'); params.push(premium) }
  if (effective_date !== undefined) { sets.push('effective_date = ?'); params.push(effective_date) }
  if (expiry_date !== undefined) {
    sets.push('expiry_date = ?')
    params.push(expiry_date)
    const newStatus = new Date(expiry_date) < new Date() ? 'expired' : new Date(expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'expiring' : 'active'
    sets.push('status = ?')
    params.push(newStatus)
  }
  if (sets.length === 0) return res.status(422).json({ error: '无更新字段' })

  params.push(req.params.recordId)
  db.prepare(`UPDATE vehicle_insurance SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  res.json({ message: '更新成功' })
})

router.post('/vehicles/:id/insurance/renew', (req, res) => {
  const { insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date } = req.body
  if (!insurance_company || !insurance_type || !policy_number || !effective_date || !expiry_date) {
    return res.status(422).json({ error: '参数错误' })
  }

  db.prepare("UPDATE vehicle_insurance SET status = 'expired' WHERE vehicle_id = ? AND status = 'active'").run(req.params.id)

  const result = db.prepare(`
    INSERT INTO vehicle_insurance (vehicle_id, insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(req.params.id, insurance_company, insurance_type, policy_number, coverage_amount || null, premium || null, effective_date, expiry_date)

  res.status(201).json({ id: result.lastInsertRowid, message: '续保成功' })
})

// ==================== 年检管理 ====================

router.get('/vehicles/:id/inspection', (req, res) => {
  const records = db.prepare('SELECT * FROM vehicle_inspections WHERE vehicle_id = ? ORDER BY inspection_date DESC').all(req.params.id)
  res.json({ records })
})

router.post('/vehicles/:id/inspection', (req, res) => {
  const { inspection_date, next_inspection_date, inspection_org, result, cost } = req.body
  if (!inspection_date || !next_inspection_date || !inspection_org || !result) {
    return res.status(422).json({ error: '参数错误', details: ['年检日期、下次年检日期、年检单位、年检结果为必填'] })
  }

  const r = db.prepare(`
    INSERT INTO vehicle_inspections (vehicle_id, inspection_date, next_inspection_date, inspection_org, result, cost)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.params.id, inspection_date, next_inspection_date, inspection_org, result, cost || null)

  res.status(201).json({ id: r.lastInsertRowid })
})

// ==================== 违章处理 ====================

router.get('/vehicles/:id/violations', (req, res) => {
  const records = db.prepare('SELECT * FROM vehicle_violations WHERE vehicle_id = ? ORDER BY violation_date DESC').all(req.params.id)
  const stats = db.prepare(`
    SELECT COUNT(*) as totalCount, COALESCE(SUM(points_deducted), 0) as totalPoints, COALESCE(SUM(penalty_amount), 0) as totalPenalty
    FROM vehicle_violations WHERE vehicle_id = ?
  `).get(req.params.id)
  res.json({ records, stats })
})

router.post('/vehicles/:id/violations', (req, res) => {
  const { violation_date, location, behavior, points_deducted, penalty_amount } = req.body
  if (!violation_date || !location || !behavior) {
    return res.status(422).json({ error: '参数错误', details: ['违章日期、违章地点、违章行为为必填'] })
  }

  const result = db.prepare(`
    INSERT INTO vehicle_violations (vehicle_id, violation_date, location, behavior, points_deducted, penalty_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, '待处理')
  `).run(req.params.id, violation_date, location, behavior, points_deducted || 0, penalty_amount || 0)

  res.status(201).json({ id: result.lastInsertRowid })
})

router.put('/vehicles/:id/violations/:recordId', (req, res) => {
  const { status, processed_date, processed_result } = req.body
  if (!status) return res.status(422).json({ error: '状态为必填' })

  if (status === '已处理') {
    db.prepare('UPDATE vehicle_violations SET status = ?, processed_date = ?, processed_result = ? WHERE id = ? AND vehicle_id = ?')
      .run(status, processed_date || new Date().toISOString().split('T')[0], processed_result || '', req.params.recordId, req.params.id)
  } else {
    db.prepare('UPDATE vehicle_violations SET status = ? WHERE id = ? AND vehicle_id = ?')
      .run(status, req.params.recordId, req.params.id)
  }

  res.json({ message: '更新成功' })
})

module.exports = router
