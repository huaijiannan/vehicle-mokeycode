const db = require('./db')

function seedMoreVehicles() {
  const count = db.prepare('SELECT COUNT(*) as c FROM vehicles').get()
  if (count.c >= 100) {
    console.log(`Already ${count.c} vehicles, skipping bulk seed.`)
    return
  }

  const deptVehicles = [
    { deptId: 10, name: '办公室', parentName: '北京分公司', count: 12 },
    { deptId: 11, name: '财务部', parentName: '北京分公司', count: 4 },
    { deptId: 12, name: '后勤保障部', parentName: '北京分公司', count: 20 },
    { deptId: 13, name: '纪检监察部', parentName: '北京分公司', count: 3 },
    { deptId: 14, name: '市场经营部', parentName: '北京分公司', count: 10 },
    { deptId: 15, name: '办公室', parentName: '上海分公司', count: 8 },
    { deptId: 16, name: '后勤保障部', parentName: '上海分公司', count: 16 },
    { deptId: 17, name: '生产运营部', parentName: '上海分公司', count: 10 },
    { deptId: 18, name: '办公室', parentName: '广州分公司', count: 7 },
    { deptId: 19, name: '后勤保障部', parentName: '广州分公司', count: 14 },
    { deptId: 20, name: '办公室', parentName: '成都分公司', count: 6 },
    { deptId: 21, name: '后勤保障部', parentName: '成都分公司', count: 10 },
    { deptId: 22, name: '办公室', parentName: '武汉分公司', count: 7 },
    { deptId: 23, name: '后勤保障部', parentName: '武汉分公司', count: 12 },
    { deptId: 24, name: '办公室', parentName: '西安分公司', count: 5 },
    { deptId: 25, name: '后勤保障部', parentName: '西安分公司', count: 10 },
    { deptId: 26, name: '机关车队', parentName: '总部直属', count: 14 },
    { deptId: 27, name: '接待车队', parentName: '总部直属', count: 9 },
    { deptId: 28, name: '办公室', parentName: '沈阳分公司', count: 6, newDept: true },
    { deptId: 29, name: '后勤保障部', parentName: '沈阳分公司', count: 10, newDept: true },
  ]

  const platePrefixes = {
    '北京分公司': '京', '上海分公司': '沪', '广州分公司': '粤A',
    '成都分公司': '川A', '武汉分公司': '鄂A', '西安分公司': '陕A',
    '沈阳分公司': '辽A', '总部直属': '京'
  }
  const plateLetters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'

  const models = [
    { model: '奥迪A6L 2024款 45TFSI', type: '轿车', fuel: '汽油', displacement: 2.0, seats: 5 },
    { model: '帕萨特 2024款 330TSI', type: '轿车', fuel: '汽油', displacement: 2.0, seats: 5 },
    { model: '红旗H9 2024款 3.0T', type: '轿车', fuel: '汽油', displacement: 3.0, seats: 5 },
    { model: '别克GL8 2024款 陆尊', type: '商务车', fuel: '汽油', displacement: 2.0, seats: 7 },
    { model: '丰田柯斯达 2024款', type: '中型客车', fuel: '柴油', displacement: 4.0, seats: 20 },
    { model: '宇通T7 2024款', type: '大型客车', fuel: '柴油', displacement: 4.5, seats: 23 },
    { model: '比亚迪汉EV 2024款', type: '轿车', fuel: '电动', displacement: 0, seats: 5 },
    { model: '荣威iMAX8 2024款', type: '商务车', fuel: '汽油', displacement: 2.0, seats: 7 },
    { model: '本田奥德赛 2024款 锐·混动', type: '商务车', fuel: '汽油', displacement: 2.0, seats: 7 },
    { model: '丰田凯美瑞 2024款 双擎', type: '轿车', fuel: '汽油', displacement: 2.5, seats: 5 },
  ]
  const colors = ['黑色', '白色', '银色', '深灰']
  const statusWeights = ['空闲','空闲','空闲','空闲','空闲','出车中','维修中','空闲','空闲','空闲']

  // Add missing departments for 沈阳分公司
  for (const dv of deptVehicles) {
    if (dv.newDept) {
      const existing = db.prepare('SELECT id FROM departments WHERE id = ?').get(dv.deptId)
      if (!existing) {
        const parentId = [1,8].includes(dv.deptId) ? 8 : 9 // all under 沈阳 or 总部
        const realParent = dv.parentName === '沈阳分公司' ? 8 : 9
        db.prepare('INSERT OR IGNORE INTO departments (id, name, parent_id, level) VALUES (?, ?, ?, 3)').run(dv.deptId, dv.name, realParent)
      }
    }
  }

  console.log(`Seeding ${deptVehicles.reduce((s, d) => s + d.count, 0)} more vehicles...`)

  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (plate_number, brand_model, vehicle_type, fuel_type, engine_displacement, seat_count,
      purchase_date, purchase_price, color, department_id, status, mileage, inspection_due, insurance_due,
      quota_type, emission_standard, service_life)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertInsurance = db.prepare(`INSERT INTO vehicle_insurance (vehicle_id, insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertInspection = db.prepare(`INSERT INTO vehicle_inspections (vehicle_id, inspection_date, next_inspection_date, inspection_org, result, cost) VALUES (?, ?, ?, ?, ?, ?)`)

  let vid = db.prepare('SELECT MAX(id) as m FROM vehicles').get().m || 0
  const insCompanies = ['中国人保财险', '平安保险', '太平洋保险', '中国人寿财险']

  const bulkInsert = db.transaction(() => {
    for (const dv of deptVehicles) {
      const prefix = platePrefixes[dv.parentName] || '京'
      for (let i = 0; i < dv.count; i++) {
        vid++
        const mi = Math.floor(Math.random() * models.length)
        const m = models[mi]
        const letter = plateLetters[Math.floor(Math.random() * plateLetters.length)]
        const digits = String(Math.floor(10000 + Math.random() * 90000))
        const plate = `${prefix}${letter}${digits}`

        const purchaseYear = 2023 + Math.floor(Math.random() * 3)
        const purchaseMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
        const purchaseDate = `${purchaseYear}-${purchaseMonth}-15`
        const basePrice = { '轿车': 250000, '商务车': 320000, '中型客车': 500000, '大型客车': 600000 }
        const price = Math.round(basePrice[m.type] * (0.8 + Math.random() * 0.4))

        const mileage = Math.round(Math.random() * 30000)
        const status = statusWeights[Math.floor(Math.random() * statusWeights.length)]

        const inspYear = 2027 + Math.floor(Math.random() * 2)
        const inspMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
        const inspDue = `${inspYear}-${inspMonth}-15`

        const insYear = 2027 + Math.floor(Math.random() * 2)
        const insMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
        const insDue = `${insYear}-${insMonth}-15`

        insertVehicle.run(plate, m.model, m.type, m.fuel, m.displacement, m.seats,
          purchaseDate, price, colors[Math.floor(Math.random() * colors.length)], dv.deptId,
          status, mileage, inspDue, insDue, '一般公务用车', '国VI', 10)

        // Insurance for this vehicle
        const insComp = insCompanies[Math.floor(Math.random() * insCompanies.length)]
        const effDate = insDue.replace(/\d{4}/, String(parseInt(insDue.slice(0, 4)) - 1))
        insertInsurance.run(vid, insComp, '交强险', `${insComp.slice(0, 4).toUpperCase()}-${effDate.slice(0, 4)}-${String(vid).padStart(4, '0')}`, 200000, Math.round(800 + Math.random() * 400), effDate, insDue, 'active')

        // Inspection for this vehicle (about half the vehicles)
        if (Math.random() > 0.5) {
          const lastInspDate = inspDue.replace(/\d{4}/, String(parseInt(inspDue.slice(0, 4)) - 1))
          insertInspection.run(vid, lastInspDate, inspDue, '所在地机动车检测场', '合格', Math.round(250 + Math.random() * 200))
        }
      }
    }
  })

  bulkInsert()
  console.log(`Done. Total vehicles: ${db.prepare('SELECT COUNT(*) as c FROM vehicles').get().c}`)
}

module.exports = { seedMoreVehicles }
