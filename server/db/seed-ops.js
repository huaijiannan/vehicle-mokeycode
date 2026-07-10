const db = require('./db')

function seedDemoOperations() {
  const count = db.prepare('SELECT COUNT(*) as c FROM refuels').get()
  if (count.c >= 20) {
    console.log(`Already ${count.c} refuels, skipping ops seed.`)
    return
  }

  console.log('Seeding demo operations data...')

  const now = new Date()
  const stations = ['中石化朝阳站', '中石油海淀站', '中石化西城站', '中石油浦东站', '中石化丰台站', '中石油通州站']
  const operators = ['张伟', '李明', '王磊', '赵刚', '陈强', '刘洋']
  const fuelTypes = ['92#', '95#', '98#', '0#柴油']

  const insertRefuel = db.prepare(`INSERT INTO refuels (vehicle_id, refuel_date, station_name, fuel_type, fuel_amount, unit_price, total_amount, current_odometer, fuel_card_number, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertMaintenance = db.prepare(`INSERT INTO maintenances (vehicle_id, record_type, date, repair_type, maintenance_type, items, cost, shop_id, status, current_odometer, next_maintenance_odometer, next_maintenance_date, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insertViolation = db.prepare(`INSERT INTO vehicle_violations (vehicle_id, violation_date, location, behavior, points_deducted, penalty_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)`)

  const vehicleIds = db.prepare('SELECT id FROM vehicles LIMIT 30').all().map(r => r.id)

  const bulkInsert = db.transaction(() => {
    for (const vid of vehicleIds) {
      let odo = Math.round(5000 + Math.random() * 30000)
      for (let m = 0; m < 3; m++) {
        const d = new Date(now.getFullYear(), now.getMonth() - m, 1)
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const day = String(Math.floor(15 + Math.random() * 15)).padStart(2, '0')
        const amount = parseFloat((40 + Math.random() * 50).toFixed(1))
        const price = parseFloat((8.2 + Math.random() * 0.8).toFixed(2))
        const total = Math.round(amount * price)
        odo += Math.round(400 + Math.random() * 800)

        insertRefuel.run(
          vid, `${monthStr}-${day}`,
          stations[Math.floor(Math.random() * stations.length)],
          fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
          amount, price, total, odo,
          `ZSY-${String(vid).padStart(3, '0')}`,
          operators[Math.floor(Math.random() * operators.length)]
        )
      }

      const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // 30% chance of maintenance record
      if (Math.random() < 0.3) {
        const maintTypes = ['小保养', '大保养']
        const items = [
          '更换机油、机滤、空滤',
          '更换刹车油、变速箱油',
          '更换前刹车片、后刹车片',
          '四轮定位、轮胎换位'
        ]
        const mi = Math.floor(Math.random() * maintTypes.length)
        const mDateBase = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const mDateStr = `${mDateBase.getFullYear()}-${String(mDateBase.getMonth() + 1).padStart(2, '0')}`
        const nextMaintDate = new Date(now.getFullYear(), now.getMonth() + 3, 1)
        const nextMaintStr = `${nextMaintDate.getFullYear()}-${String(nextMaintDate.getMonth() + 1).padStart(2, '0')}`
        insertMaintenance.run(
          vid, 'maintenance', `${mDateStr}-15`,
          null, maintTypes[mi],
          items[Math.floor(Math.random() * items.length)],
          Math.round(800 + Math.random() * 2500),
          Math.ceil(Math.random() * 3),
          null, odo - Math.round(2000 + Math.random() * 5000),
          odo + Math.round(3000 + Math.random() * 7000),
          `${nextMaintStr}-15`,
          operators[Math.floor(Math.random() * operators.length)]
        )
      }

      // 15% chance of repair record
      if (Math.random() < 0.15) {
        const repairItems = ['更换前减震器', '更换空调压缩机', '更换发电机', '钣金喷漆']
        const statuses = ['待维修', '维修中', '已完工']
        insertMaintenance.run(
          vid, 'repair', `${curMonthStr}-10`,
          Math.random() > 0.5 ? '常规维修' : '故障维修',
          null,
          repairItems[Math.floor(Math.random() * repairItems.length)],
          Math.round(1500 + Math.random() * 8000),
          Math.ceil(Math.random() * 3),
          statuses[Math.floor(Math.random() * statuses.length)],
          null, null, null,
          operators[Math.floor(Math.random() * operators.length)]
        )
      }

      // 20% chance of violation
      if (Math.random() < 0.2) {
        const violations = [
          ['超速20%以下', 3, 200],
          ['违反禁止标线', 1, 100],
          ['违规停车', 0, 200],
          ['未按规定使用灯光', 1, 100],
          ['占用应急车道', 6, 200],
        ]
        const v = violations[Math.floor(Math.random() * violations.length)]
        const vDay = String(Math.floor(10 + Math.random() * 20)).padStart(2, '0')
        insertViolation.run(vid, `${curMonthStr}-${vDay}`, '市区主要道路', v[0], v[1], v[2], Math.random() > 0.4 ? '待处理' : '已处理')
      }
    }
  })

  bulkInsert()
  console.log(`Demo ops seeded: ${db.prepare('SELECT COUNT(*) as c FROM refuels').get().c} refuels, ${db.prepare('SELECT COUNT(*) as c FROM maintenances').get().c} maintenance records, ${db.prepare('SELECT COUNT(*) as c FROM vehicle_violations').get().c} violations.`)
}

module.exports = { seedDemoOperations }
