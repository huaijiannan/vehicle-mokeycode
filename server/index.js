const express = require('express')
const cors = require('cors')
const path = require('path')
const { initDatabase } = require('./db/init')
const { seedDatabase } = require('./db/seed')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/vehicles', require('./routes/vehicles'))
app.use('/api/drivers', require('./routes/drivers'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

initDatabase()
seedDatabase()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
