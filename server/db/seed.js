const db = require('./db')
const bcrypt = require('bcryptjs')

function seedDatabase() {
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get()
  if (deptCount.count > 0) return

  console.log('Seeding database...')

  const insertDept = db.prepare('INSERT INTO departments (id, name, parent_id, level) VALUES (?, ?, ?, ?)')
  insertDept.run(1, '中国XX集团有限公司', null, 1)
  insertDept.run(2, '北京分公司', 1, 2)
  insertDept.run(3, '上海分公司', 1, 2)
  insertDept.run(4, '办公室', 2, 3)
  insertDept.run(5, '财务部', 2, 3)
  insertDept.run(6, '后勤保障部', 2, 3)
  insertDept.run(7, '纪检监察部', 2, 3)
  insertDept.run(8, '车队管理科', 6, 4)

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password_hash, real_name, role, department_id, phone, email, political_status, job_title)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const hash = bcrypt.hashSync('admin123', 10)
  insertUser.run(1, 'admin', hash, '系统管理员', 'admin', 1, '13800000001', 'admin@example.com', '中共党员', '系统管理员')
  insertUser.run(2, 'zhangsan', hash, '张三', 'employee', 4, '13800000002', 'zhangsan@example.com', '群众', '科员')
  insertUser.run(3, 'lisi', hash, '李四', 'dept_head', 4, '13800000003', 'lisi@example.com', '中共党员', '办公室主任')
  insertUser.run(4, 'wangwu', hash, '王五', 'leader', 2, '13800000004', 'wangwu@example.com', '中共党员', '副总经理')
  insertUser.run(5, 'zhaoqian', hash, '赵前', 'dispatcher', 8, '13800000005', 'zhaoqian@example.com', '中共党员', '调度员')
  insertUser.run(6, 'sunli', hash, '孙力', 'driver', 8, '13800000006', 'sunli@example.com', '群众', '司机')
  insertUser.run(7, 'zhouji', hash, '周纪', 'inspector', 7, '13800000007', 'zhouji@example.com', '中共党员', '纪检干事')
  insertUser.run(8, 'wucai', hash, '吴财', 'finance', 5, '13800000008', 'wucai@example.com', '中共党员', '财务主管')

  const insertVehicle = db.prepare(`
    INSERT INTO vehicles (id, plate_number, brand_model, vehicle_type, fuel_type, engine_displacement, seat_count,
      purchase_date, purchase_price, color, department_id, status, mileage, inspection_due, insurance_due,
      quota_type, emission_standard, service_life)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertVehicle.run(1, '京A00123', '奥迪A6L 2024款 45TFSI', '轿车', '汽油', 2.0, 5, '2024-01-15', 420000, '黑色', 1, '空闲', 15000, '2027-01-15', '2027-01-15', '一般公务用车', '国VI', 10)
  insertVehicle.run(2, '京B00456', '别克GL8 2024款 陆尊', '商务车', '汽油', 2.0, 7, '2024-03-20', 350000, '银色', 2, '空闲', 8000, '2027-03-20', '2027-03-20', '一般公务用车', '国VI', 10)
  insertVehicle.run(3, '京C00789', '丰田柯斯达 2024款', '中型客车', '柴油', 4.0, 20, '2024-06-10', 550000, '白色', 1, '空闲', 5000, '2027-06-10', '2027-06-10', '一般公务用车', '国VI', 12)

  const insertDriver = db.prepare(`
    INSERT INTO drivers (id, employee_id, real_name, gender, birth_date, phone, political_status, quota_type,
      hire_date, department_id, age, driving_age, work_age, license_number, license_class, license_first_date,
      license_valid_from, license_valid_to, license_authority, qualification_number, qualification_type,
      qualification_valid_from, qualification_valid_to, is_secret_post, secret_level, status, focus_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insertDriver.run(1, 'DRV2026001', '刘建国', '男', '1980-05-12', '13800000101', '中共党员', '在编',
    '2015-03-01', 8, 46, 15, 11, '11010219800512001X', 'A1', '2009-08-15',
    '2020-08-15', '2030-08-15', '北京市公安局交通管理局', 'ZY2024001', '道路旅客运输',
    '2024-01-01', '2027-01-01', 0, null, '空闲', '正常')
  insertDriver.run(2, 'DRV2026002', '陈大明', '男', '1985-09-20', '13800000102', '群众', '在编',
    '2017-06-15', 8, 38, 10, 9, '11010219850920002Y', 'A2', '2014-03-10',
    '2020-03-10', '2030-03-10', '北京市公安局交通管理局', 'ZY2024002', '道路货物运输',
    '2024-03-01', '2027-03-01', 0, null, '空闲', '正常')
  insertDriver.run(3, 'DRV2026003', '王海涛', '男', '1990-01-08', '13800000103', '中共党员', '在编',
    '2019-09-01', 8, 36, 8, 6, '11010219900108003Z', 'C1', '2016-07-20',
    '2022-07-20', '2032-07-20', '北京市公安局交通管理局', 'ZY2024003', '道路旅客运输',
    '2024-06-01', '2027-06-01', 1, '机密', '空闲', '正常')

  console.log('Database seeded successfully.')
}

module.exports = { seedDatabase }
