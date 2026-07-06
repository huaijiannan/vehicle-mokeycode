const db = require('./db')
const bcrypt = require('bcryptjs')

function seedDatabase() {
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get()
  if (deptCount.count > 0) {
    seedOperationsData()
    return
  }

  console.log('Seeding database...')

  const insertDept = db.prepare('INSERT INTO departments (id, name, parent_id, level) VALUES (?, ?, ?, ?)')
  insertDept.run(1, '中国XX集团有限公司', null, 1)
  insertDept.run(2, '北京分公司', 1, 2)
  insertDept.run(3, '上海分公司', 1, 2)
  insertDept.run(4, '广州分公司', 1, 2)
  insertDept.run(5, '成都分公司', 1, 2)
  insertDept.run(6, '武汉分公司', 1, 2)
  insertDept.run(7, '西安分公司', 1, 2)
  insertDept.run(8, '沈阳分公司', 1, 2)
  insertDept.run(9, '总部直属', 1, 2)
  insertDept.run(10, '办公室', 2, 3)
  insertDept.run(11, '财务部', 2, 3)
  insertDept.run(12, '后勤保障部', 2, 3)
  insertDept.run(13, '纪检监察部', 2, 3)
  insertDept.run(14, '市场经营部', 2, 3)
  insertDept.run(15, '办公室', 3, 3)
  insertDept.run(16, '后勤保障部', 3, 3)
  insertDept.run(17, '生产运营部', 3, 3)
  insertDept.run(18, '办公室', 4, 3)
  insertDept.run(19, '后勤保障部', 4, 3)
  insertDept.run(20, '办公室', 5, 3)
  insertDept.run(21, '后勤保障部', 5, 3)
  insertDept.run(22, '办公室', 6, 3)
  insertDept.run(23, '后勤保障部', 6, 3)
  insertDept.run(24, '办公室', 7, 3)
  insertDept.run(25, '后勤保障部', 7, 3)
  insertDept.run(26, '机关车队', 9, 3)
  insertDept.run(27, '接待车队', 9, 3)

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, real_name, role, department_id, phone, email, political_status, job_title)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const hash = bcrypt.hashSync('admin123', 10)
  insertUser.run(1, 'admin', hash, '系统管理员', 'admin', 1, '13800000001', 'admin@example.com', '中共党员', '系统管理员')
  insertUser.run(2, 'zhangsan', hash, '张三', 'employee', 10, '13800000002', 'zhangsan@example.com', '群众', '科员')
  insertUser.run(3, 'lisi', hash, '李四', 'dept_head', 10, '13800000003', 'lisi@example.com', '中共党员', '办公室主任')
  insertUser.run(4, 'wangwu', hash, '王五', 'leader', 2, '13800000004', 'wangwu@example.com', '中共党员', '副总经理')
  insertUser.run(5, 'zhaoqian', hash, '赵前', 'dispatcher', 12, '13800000005', 'zhaoqian@example.com', '中共党员', '调度员')
  insertUser.run(6, 'sunli', hash, '孙力', 'driver', 12, '13800000006', 'sunli@example.com', '群众', '司机')
  insertUser.run(7, 'zhouji', hash, '周纪', 'inspector', 13, '13800000007', 'zhouji@example.com', '中共党员', '纪检干事')
  insertUser.run(8, 'wucai', hash, '吴财', 'finance', 11, '13800000008', 'wucai@example.com', '中共党员', '财务主管')

  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, plate_number, brand_model, vehicle_type, fuel_type, engine_displacement, seat_count,
      purchase_date, purchase_price, color, department_id, status, mileage, inspection_due, insurance_due,
      quota_type, emission_standard, service_life)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertVehicle.run(1, '京A00123', '奥迪A6L 2024款 45TFSI', '轿车', '汽油', 2.0, 5, '2024-01-15', 420000, '黑色', 10, '空闲', 15000, '2027-01-15', '2027-01-15', '一般公务用车', '国VI', 10)
  insertVehicle.run(2, '京B00456', '别克GL8 2024款 陆尊', '商务车', '汽油', 2.0, 7, '2024-03-20', 350000, '银色', 12, '空闲', 8000, '2027-03-20', '2027-03-20', '一般公务用车', '国VI', 10)
  insertVehicle.run(3, '京C00789', '丰田柯斯达 2024款', '中型客车', '柴油', 4.0, 20, '2024-06-10', 550000, '白色', 12, '空闲', 5000, '2027-06-10', '2027-06-10', '一般公务用车', '国VI', 12)
  insertVehicle.run(4, '沪A10001', '帕萨特 2024款', '轿车', '汽油', 2.0, 5, '2024-02-10', 220000, '黑色', 15, '出车中', 6200, '2027-02-10', '2027-02-10', '一般公务用车', '国VI', 10)
  insertVehicle.run(5, '沪B10002', '荣威iMAX8 2024款', '商务车', '汽油', 2.0, 7, '2024-04-15', 280000, '白色', 16, '空闲', 4500, '2027-04-15', '2027-04-15', '一般公务用车', '国VI', 10)
  insertVehicle.run(6, '粤A20001', '比亚迪汉EV 2024款', '轿车', '电动', 0, 5, '2024-05-20', 260000, '白色', 18, '维修中', 3800, '2027-05-20', '2027-05-20', '一般公务用车', '国VI', 10)
  insertVehicle.run(7, '川A30001', '本田奥德赛 2024款', '商务车', '汽油', 2.0, 7, '2024-07-01', 250000, '银色', 19, '空闲', 2200, '2027-07-01', '2027-07-01', '一般公务用车', '国VI', 10)
  insertVehicle.run(8, '京D01000', '红旗H9 2024款', '轿车', '汽油', 3.0, 5, '2024-08-01', 380000, '黑色', 26, '空闲', 3000, '2027-08-01', '2027-08-01', '一般公务用车', '国VI', 10)

  const insertDriver = db.prepare(`
    INSERT INTO drivers (id, employee_id, real_name, gender, birth_date, phone, political_status, quota_type,
      hire_date, department_id, age, driving_age, work_age, license_number, license_class, license_first_date,
      license_valid_from, license_valid_to, license_authority, qualification_number, qualification_type,
      qualification_valid_from, qualification_valid_to, is_secret_post, secret_level, status, focus_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertDriver.run(1, 'DRV2026001', '刘建国', '男', '1980-05-12', '13800000101', '中共党员', '在编',
    '2015-03-01', 12, 46, 15, 11, '11010219800512001X', 'A1', '2009-08-15',
    '2020-08-15', '2030-08-15', '北京市公安局交通管理局', 'ZY2024001', '道路旅客运输',
    '2024-01-01', '2027-01-01', 0, null, '空闲', '正常')
  insertDriver.run(2, 'DRV2026002', '陈大明', '男', '1985-09-20', '13800000102', '群众', '在编',
    '2017-06-15', 12, 38, 10, 9, '11010219850920002Y', 'A2', '2014-03-10',
    '2020-03-10', '2030-03-10', '北京市公安局交通管理局', 'ZY2024002', '道路货物运输',
    '2024-03-01', '2027-03-01', 0, null, '空闲', '正常')
  insertDriver.run(3, 'DRV2026003', '王海涛', '男', '1990-01-08', '13800000103', '中共党员', '在编',
    '2019-09-01', 12, 36, 8, 6, '11010219900108003Z', 'C1', '2016-07-20',
    '2022-07-20', '2032-07-20', '北京市公安局交通管理局', 'ZY2024003', '道路旅客运输',
    '2024-06-01', '2027-06-01', 1, '机密', '空闲', '正常')

  const insertRepairShop = db.prepare('INSERT INTO repair_shops (id, name, contact_person, contact_phone, address) VALUES (?, ?, ?, ?, ?)')
  insertRepairShop.run(1, '北京奥迪4S店', '赵经理', '010-88880001', '北京市朝阳区北四环东路18号')
  insertRepairShop.run(2, '北京别克4S店', '钱主管', '010-88880002', '北京市海淀区中关村南大街22号')
  insertRepairShop.run(3, '北京丰田4S店', '孙经理', '010-88880003', '北京市丰台区南三环西路8号')

  const insertInsurance = db.prepare(`INSERT INTO vehicle_insurance (vehicle_id, insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertInsurance.run(1, '中国人保财险', '交强险', 'PICC-2026-BJ-001', 200000, 950, '2026-01-15', '2027-01-15', 'active')
  insertInsurance.run(1, '中国人保财险', '商业险', 'PICC-2026-BJ-002', 500000, 8200, '2026-01-15', '2027-01-15', 'active')
  insertInsurance.run(2, '平安保险', '交强险', 'PAIC-2026-BJ-001', 200000, 950, '2026-03-20', '2027-03-20', 'active')
  insertInsurance.run(2, '平安保险', '商业险', 'PAIC-2026-BJ-002', 500000, 7800, '2026-03-20', '2027-03-20', 'active')
  insertInsurance.run(3, '太平洋保险', '交强险', 'CPIC-2026-BJ-001', 200000, 1100, '2026-06-10', '2027-06-10', 'active')
  insertInsurance.run(3, '太平洋保险', '商业险', 'CPIC-2026-BJ-002', 500000, 9500, '2026-06-10', '2027-06-10', 'active')

  const insertRefuel = db.prepare(`INSERT INTO refuels (vehicle_id, refuel_date, station_name, fuel_type, fuel_amount, unit_price, total_amount, current_odometer, fuel_card_number, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertRefuel.run(1, '2026-06-28', '中石化朝阳站', '95#', 62.5, 8.56, 535.0, 15200, 'ZSY-001', '张伟')
  insertRefuel.run(1, '2026-06-15', '中石油海淀站', '95#', 58.3, 8.52, 497.0, 14580, 'ZSY-001', '张伟')
  insertRefuel.run(1, '2026-06-02', '中石化西城站', '95#', 55.0, 8.60, 473.0, 13920, 'ZSY-001', '李明')
  insertRefuel.run(2, '2026-06-25', '中石化朝阳站', '95#', 70.0, 8.56, 599.2, 8500, 'ZSY-002', '王磊')
  insertRefuel.run(2, '2026-06-10', '中石油朝阳站', '95#', 65.5, 8.52, 558.1, 7800, 'ZSY-002', '王磊')

  const insertMaintenance = db.prepare(`INSERT INTO maintenances (vehicle_id, record_type, date, repair_type, maintenance_type, items, cost, shop_id, status, current_odometer, next_maintenance_odometer, next_maintenance_date, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertMaintenance.run(1, 'repair', '2026-06-05', '常规维修', null, '更换前刹车片', 2800, 1, '已完工', null, null, null, '张伟')
  insertMaintenance.run(1, 'maintenance', '2026-05-15', null, '小保养', '更换机油、机滤', 1200, 1, null, 13000, 18000, '2026-11-15', '张伟')
  insertMaintenance.run(2, 'repair', '2026-06-18', '故障维修', null, '更换空调压缩机', 4500, 2, '维修中', null, null, null, '王磊')

  const insertInspection = db.prepare(`INSERT INTO vehicle_inspections (vehicle_id, inspection_date, next_inspection_date, inspection_org, result, cost) VALUES (?, ?, ?, ?, ?, ?)`)
  insertInspection.run(1, '2026-01-15', '2027-01-15', '北京朝阳检测场', '合格', 320)
  insertInspection.run(2, '2026-03-20', '2027-03-20', '北京海淀检测场', '合格', 320)
  insertInspection.run(3, '2025-06-01', '2026-06-01', '北京丰台检测场', '合格', 350)

  const insertViolation = db.prepare(`INSERT INTO vehicle_violations (vehicle_id, violation_date, location, behavior, points_deducted, penalty_amount, status, processed_date, processed_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertViolation.run(1, '2026-06-12', '京通快速5km', '超速20%以下', 3, 200, '待处理', null, null)
  insertViolation.run(1, '2026-05-20', '三环路分钟寺桥', '违反禁止标线', 1, 100, '已处理', '2026-05-25', '已缴纳罚款')
  insertViolation.run(2, '2026-06-20', '四环路望京桥', '违规停车', 0, 200, '待处理', null, null)

  console.log('Database seeded successfully.')
}

function seedOperationsData() {
  const shopCount = db.prepare('SELECT COUNT(*) as count FROM repair_shops').get()
  if (shopCount.count > 0) return

  console.log('Seeding operations data...')

  const insertRepairShop = db.prepare('INSERT INTO repair_shops (id, name, contact_person, contact_phone, address) VALUES (?, ?, ?, ?, ?)')
  insertRepairShop.run(1, '北京奥迪4S店', '赵经理', '010-88880001', '北京市朝阳区北四环东路18号')
  insertRepairShop.run(2, '北京别克4S店', '钱主管', '010-88880002', '北京市海淀区中关村南大街22号')
  insertRepairShop.run(3, '北京丰田4S店', '孙经理', '010-88880003', '北京市丰台区南三环西路8号')

  const insertInsurance = db.prepare(`INSERT INTO vehicle_insurance (vehicle_id, insurance_company, insurance_type, policy_number, coverage_amount, premium, effective_date, expiry_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertInsurance.run(1, '中国人保财险', '交强险', 'PICC-2026-BJ-001', 200000, 950, '2026-01-15', '2027-01-15', 'active')
  insertInsurance.run(1, '中国人保财险', '商业险', 'PICC-2026-BJ-002', 500000, 8200, '2026-01-15', '2027-01-15', 'active')
  insertInsurance.run(2, '平安保险', '交强险', 'PAIC-2026-BJ-001', 200000, 950, '2026-03-20', '2027-03-20', 'active')
  insertInsurance.run(2, '平安保险', '商业险', 'PAIC-2026-BJ-002', 500000, 7800, '2026-03-20', '2027-03-20', 'active')
  insertInsurance.run(3, '太平洋保险', '交强险', 'CPIC-2026-BJ-001', 200000, 1100, '2026-06-10', '2027-06-10', 'active')
  insertInsurance.run(4, '中国人保财险', '交强险', 'PICC-2026-SH-001', 200000, 950, '2026-02-10', '2027-02-10', 'active')
  insertInsurance.run(5, '平安保险', '交强险', 'PAIC-2026-SH-001', 200000, 950, '2026-04-15', '2027-04-15', 'active')

  const insertRefuel = db.prepare(`INSERT INTO refuels (vehicle_id, refuel_date, station_name, fuel_type, fuel_amount, unit_price, total_amount, current_odometer, fuel_card_number, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertRefuel.run(1, '2026-06-28', '中石化朝阳站', '95#', 62.5, 8.56, 535.0, 15200, 'ZSY-001', '张伟')
  insertRefuel.run(1, '2026-06-15', '中石油海淀站', '95#', 58.3, 8.52, 497.0, 14580, 'ZSY-001', '张伟')
  insertRefuel.run(1, '2026-06-02', '中石化西城站', '95#', 55.0, 8.60, 473.0, 13920, 'ZSY-001', '李明')
  insertRefuel.run(2, '2026-06-25', '中石化朝阳站', '95#', 70.0, 8.56, 599.2, 8500, 'ZSY-002', '王磊')
  insertRefuel.run(2, '2026-06-10', '中石油朝阳站', '95#', 65.5, 8.52, 558.1, 7800, 'ZSY-002', '王磊')
  insertRefuel.run(4, '2026-06-20', '中石化浦东站', '95#', 60.0, 8.56, 513.6, 6500, 'ZSY-003', '赵刚')

  const insertMaintenance = db.prepare(`INSERT INTO maintenances (vehicle_id, record_type, date, repair_type, maintenance_type, items, cost, shop_id, status, current_odometer, next_maintenance_odometer, next_maintenance_date, operator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertMaintenance.run(1, 'repair', '2026-06-05', '常规维修', null, '更换前刹车片', 2800, 1, '已完工', null, null, null, '张伟')
  insertMaintenance.run(1, 'maintenance', '2026-05-15', null, '小保养', '更换机油、机滤', 1200, 1, null, 13000, 18000, '2026-11-15', '张伟')
  insertMaintenance.run(2, 'repair', '2026-06-18', '故障维修', null, '更换空调压缩机', 4500, 2, '维修中', null, null, null, '王磊')
  insertMaintenance.run(6, 'repair', '2026-06-10', '事故维修', null, '更换前保险杠、右前大灯', 8500, 3, '维修中', null, null, null, '李明')

  const insertInspection = db.prepare(`INSERT INTO vehicle_inspections (vehicle_id, inspection_date, next_inspection_date, inspection_org, result, cost) VALUES (?, ?, ?, ?, ?, ?)`)
  insertInspection.run(1, '2026-01-15', '2027-01-15', '北京朝阳检测场', '合格', 320)
  insertInspection.run(2, '2026-03-20', '2027-03-20', '北京海淀检测场', '合格', 320)
  insertInspection.run(3, '2025-06-01', '2026-06-01', '北京丰台检测场', '合格', 350)

  const insertViolation = db.prepare(`INSERT INTO vehicle_violations (vehicle_id, violation_date, location, behavior, points_deducted, penalty_amount, status, processed_date, processed_result) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  insertViolation.run(1, '2026-06-12', '京通快速5km', '超速20%以下', 3, 200, '待处理', null, null)
  insertViolation.run(1, '2026-05-20', '三环路分钟寺桥', '违反禁止标线', 1, 100, '已处理', '2026-05-25', '已缴纳罚款')
  insertViolation.run(2, '2026-06-20', '四环路望京桥', '违规停车', 0, 200, '待处理', null, null)

  console.log('Operations data seeded.')
}

module.exports = { seedDatabase }
