const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../db/db')
const { JWT_SECRET } = require('../middleware/auth')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

router.post('/login', (req, res) => {
  const { username, password, phone } = req.body

  if ((!username && !phone) || !password) {
    return res.status(422).json({ error: '参数错误', details: ['用户名/手机号和密码不能为空'] })
  }

  let user
  if (phone) {
    user = db.prepare('SELECT * FROM users WHERE phone = ? AND status = ?').get(phone, 'active')
  } else {
    user = db.prepare('SELECT * FROM users WHERE username = ? AND status = ?').get(username, 'active')
  }
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const valid = bcrypt.compareSync(password, user.password_hash)
  if (!valid) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }

  const department = user.department_id
    ? db.prepare('SELECT id, name, level FROM departments WHERE id = ?').get(user.department_id)
    : null

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
      department_id: user.department_id
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      real_name: user.real_name,
      role: user.role,
      department_id: user.department_id,
      department,
      phone: user.phone,
      email: user.email
    }
  })
})

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, username, real_name, role, department_id, phone, email, political_status, job_title FROM users WHERE id = ?').get(req.user.id)
  if (!user) {
    return res.status(404).json({ error: '用户不存在' })
  }
  const department = user.department_id
    ? db.prepare('SELECT id, name, level FROM departments WHERE id = ?').get(user.department_id)
    : null
  res.json({ ...user, department })
})

module.exports = router
