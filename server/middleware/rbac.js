const PERMISSIONS = {
  admin: ['*'],
  employee: ['dashboard', 'application:create', 'application:list', 'application:own'],
  dept_head: ['dashboard', 'application:list', 'approval:pending', 'approval:process', 'vehicle:list'],
  leader: ['dashboard', 'application:list', 'approval:pending', 'approval:process', 'report:view'],
  dispatcher: ['dashboard', 'dispatch:pending', 'dispatch:assign', 'vehicle:list', 'driver:list', 'trip:list'],
  driver: ['dashboard', 'trip:own', 'trip:start', 'trip:end'],
  inspector: ['dashboard', 'track:monitor', 'report:view'],
  finance: ['dashboard', 'expense:list', 'expense:create', 'report:view']
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未登录或token已过期' })
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: '无操作权限' })
    }
    next()
  }
}

module.exports = { PERMISSIONS, requireRole }
