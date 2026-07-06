const db = require('./db')

function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      level INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      real_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      department_id INTEGER,
      phone TEXT,
      email TEXT,
      political_status TEXT DEFAULT '群众',
      job_title TEXT,
      quota_level TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plate_number TEXT NOT NULL UNIQUE,
      vin TEXT,
      brand_model TEXT NOT NULL,
      vehicle_type TEXT NOT NULL DEFAULT '轿车',
      fuel_type TEXT DEFAULT '汽油',
      engine_displacement REAL,
      seat_count INTEGER DEFAULT 5,
      purchase_date TEXT,
      purchase_price REAL,
      service_life INTEGER,
      color TEXT,
      emission_standard TEXT,
      department_id INTEGER,
      status TEXT DEFAULT '空闲',
      mileage REAL DEFAULT 0,
      inspection_due TEXT,
      insurance_due TEXT,
      insurance_type TEXT,
      insurance_company TEXT,
      road_tax_due TEXT,
      fuel_card_number TEXT,
      etc_device_id TEXT,
      gps_device_id TEXT,
      registration_cert TEXT,
      image_url TEXT,
      is_secret INTEGER DEFAULT 0,
      secret_level TEXT,
      remark TEXT,
      quota_type TEXT DEFAULT '一般公务用车',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id TEXT NOT NULL UNIQUE,
      real_name TEXT NOT NULL,
      gender TEXT DEFAULT '男',
      birth_date TEXT,
      phone TEXT NOT NULL,
      political_status TEXT DEFAULT '群众',
      quota_type TEXT DEFAULT '在编',
      hire_date TEXT,
      department_id INTEGER,
      age INTEGER,
      driving_age INTEGER,
      work_age INTEGER,
      license_number TEXT,
      license_class TEXT DEFAULT 'C1',
      license_first_date TEXT,
      license_valid_from TEXT,
      license_valid_to TEXT,
      license_authority TEXT,
      license_image TEXT,
      qualification_number TEXT,
      qualification_type TEXT,
      qualification_valid_from TEXT,
      qualification_valid_to TEXT,
      qualification_image TEXT,
      is_secret_post INTEGER DEFAULT 0,
      secret_level TEXT,
      security_clearance_date TEXT,
      status TEXT DEFAULT '空闲',
      focus_level TEXT DEFAULT '正常',
      training_overdue INTEGER DEFAULT 0,
      health_overdue INTEGER DEFAULT 0,
      license_overdue INTEGER DEFAULT 0,
      violation_count_12m INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS driver_trainings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      training_date TEXT NOT NULL,
      training_type TEXT NOT NULL,
      duration REAL,
      content TEXT,
      assessment_result TEXT,
      trainer TEXT,
      certificate_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS driver_violations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      violation_date TEXT NOT NULL,
      violation_type TEXT NOT NULL,
      location TEXT,
      description TEXT,
      penalty TEXT,
      points_deducted INTEGER DEFAULT 0,
      is_processed INTEGER DEFAULT 0,
      processed_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS driver_health_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      check_date TEXT NOT NULL,
      institution TEXT,
      conclusion TEXT NOT NULL,
      is_qualified INTEGER DEFAULT 1,
      report_image TEXT,
      follow_up TEXT,
      follow_up_done INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicant_id INTEGER NOT NULL,
      department_id INTEGER,
      scene_category TEXT NOT NULL DEFAULT '日常公务出行',
      scene_sub_category TEXT,
      purpose TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      depart_time DATETIME NOT NULL,
      return_time DATETIME NOT NULL,
      passenger_count INTEGER DEFAULT 1,
      need_driver INTEGER DEFAULT 1,
      vehicle_type_prefer TEXT,
      estimated_mileage REAL,
      estimated_cost REAL,
      participants TEXT,
      has_secret_info INTEGER DEFAULT 0,
      secret_level TEXT,
      is_carpool INTEGER DEFAULT 0,
      status TEXT DEFAULT '待提交',
      current_approval_order INTEGER DEFAULT 0,
      total_approval_count INTEGER DEFAULT 0,
      reject_reason TEXT,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (applicant_id) REFERENCES users(id),
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      approver_id INTEGER NOT NULL,
      approval_order INTEGER NOT NULL,
      status TEXT DEFAULT '待审批',
      comment TEXT,
      approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (approver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS dispatches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL UNIQUE,
      vehicle_id INTEGER NOT NULL,
      driver_id INTEGER,
      dispatch_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      dispatcher_id INTEGER,
      status TEXT DEFAULT '已派车',
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id),
      FOREIGN KEY (dispatcher_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dispatch_id INTEGER NOT NULL UNIQUE,
      vehicle_id INTEGER NOT NULL,
      driver_id INTEGER NOT NULL,
      start_time DATETIME,
      start_odometer REAL,
      end_time DATETIME,
      end_odometer REAL,
      total_mileage REAL,
      status TEXT DEFAULT '待出车',
      pre_check_result TEXT,
      incident_report TEXT,
      user_confirm INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dispatch_id) REFERENCES dispatches(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER,
      trip_id INTEGER,
      expense_type TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      receipt_url TEXT,
      budget_category TEXT,
      occurred_at TEXT NOT NULL,
      reporter_id INTEGER,
      status TEXT DEFAULT '待审核',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (reporter_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS gps_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER,
      vehicle_id INTEGER,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      speed REAL DEFAULT 0,
      heading REAL DEFAULT 0,
      is_abnormal INTEGER DEFAULT 0,
      recorded_at DATETIME NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
    CREATE INDEX IF NOT EXISTS idx_vehicles_department ON vehicles(department_id);
    CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
    CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
    CREATE INDEX IF NOT EXISTS idx_drivers_department ON drivers(department_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
    CREATE INDEX IF NOT EXISTS idx_approvals_application ON approvals(application_id);
    CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(approver_id);
    CREATE INDEX IF NOT EXISTS idx_dispatches_vehicle ON dispatches(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
    CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(expense_type);
    CREATE INDEX IF NOT EXISTS idx_gps_tracks_trip ON gps_tracks(trip_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_driver_trainings ON driver_trainings(driver_id);
    CREATE INDEX IF NOT EXISTS idx_driver_violations ON driver_violations(driver_id);
    CREATE INDEX IF NOT EXISTS idx_driver_health_checks ON driver_health_checks(driver_id);

    CREATE TABLE IF NOT EXISTS refuels (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id      INTEGER NOT NULL REFERENCES vehicles(id),
      refuel_date     TEXT NOT NULL,
      station_name    TEXT NOT NULL,
      fuel_type       TEXT NOT NULL,
      fuel_amount     REAL NOT NULL,
      unit_price      REAL NOT NULL,
      total_amount    REAL NOT NULL,
      current_odometer REAL NOT NULL,
      fuel_card_number TEXT,
      operator        TEXT NOT NULL,
      created_at      TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_refuels_vehicle ON refuels(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_refuels_date ON refuels(refuel_date);
    CREATE INDEX IF NOT EXISTS idx_refuels_vehicle_month ON refuels(vehicle_id, refuel_date);

    CREATE TABLE IF NOT EXISTS maintenances (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id              INTEGER NOT NULL REFERENCES vehicles(id),
      record_type             TEXT NOT NULL,
      date                    TEXT NOT NULL,
      repair_type             TEXT,
      maintenance_type        TEXT,
      items                   TEXT NOT NULL,
      cost                    REAL,
      shop_id                 INTEGER REFERENCES repair_shops(id),
      status                  TEXT,
      current_odometer        REAL,
      next_maintenance_odometer REAL,
      next_maintenance_date   TEXT,
      operator                TEXT NOT NULL,
      created_at              TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_maintenances_vehicle ON maintenances(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_maintenances_type ON maintenances(record_type);
    CREATE INDEX IF NOT EXISTS idx_maintenances_date ON maintenances(date);

    CREATE TABLE IF NOT EXISTS repair_shops (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT NOT NULL,
      contact_person  TEXT,
      contact_phone   TEXT,
      address         TEXT,
      status          TEXT NOT NULL DEFAULT 'active',
      created_at      TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS vehicle_insurance (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id          INTEGER NOT NULL REFERENCES vehicles(id),
      insurance_company   TEXT NOT NULL,
      insurance_type      TEXT NOT NULL,
      policy_number       TEXT NOT NULL,
      coverage_amount     REAL,
      premium             REAL,
      effective_date      TEXT NOT NULL,
      expiry_date         TEXT NOT NULL,
      status              TEXT NOT NULL DEFAULT 'active',
      document_url        TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_insurance_vehicle ON vehicle_insurance(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_insurance_expiry ON vehicle_insurance(expiry_date);

    CREATE TABLE IF NOT EXISTS vehicle_inspections (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id              INTEGER NOT NULL REFERENCES vehicles(id),
      inspection_date         TEXT NOT NULL,
      next_inspection_date    TEXT NOT NULL,
      inspection_org          TEXT NOT NULL,
      result                  TEXT NOT NULL,
      cost                    REAL,
      report_url              TEXT,
      created_at              TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_inspections_vehicle ON vehicle_inspections(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_inspections_next ON vehicle_inspections(next_inspection_date);

    CREATE TABLE IF NOT EXISTS vehicle_violations (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id          INTEGER NOT NULL REFERENCES vehicles(id),
      violation_date      TEXT NOT NULL,
      location            TEXT NOT NULL,
      behavior            TEXT NOT NULL,
      points_deducted     INTEGER NOT NULL DEFAULT 0,
      penalty_amount      REAL NOT NULL DEFAULT 0,
      status              TEXT NOT NULL DEFAULT '待处理',
      processed_date      TEXT,
      processed_result    TEXT,
      created_at          TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_violations_vehicle ON vehicle_violations(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_violations_status ON vehicle_violations(status);
  `)

  console.log('Database tables initialized.')
}

module.exports = { initDatabase }
