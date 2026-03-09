const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

pool.query(`
  CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    restaurant TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    items TEXT NOT NULL
  )
`)

app.post('/api/menu', async (req, res) => {
  const { date, restaurant, meal_type, items } = req.body
  await pool.query('DELETE FROM menus WHERE date = $1 AND restaurant = $2 AND meal_type = $3', [date, restaurant, meal_type])
  await pool.query('INSERT INTO menus (date, restaurant, meal_type, items) VALUES ($1, $2, $3, $4)', [date, restaurant, meal_type, JSON.stringify(items)])
  res.json({ success: true })
})

app.get('/api/menu', async (req, res) => {
  const { date, restaurant } = req.query
  const result = await pool.query('SELECT * FROM menus WHERE date = $1 AND restaurant = $2', [date, restaurant])
  const data = {}
  result.rows.forEach(row => {
    data[row.meal_type] = JSON.parse(row.items)
  })
  res.json(data)
})

app.listen(3001, () => console.log('서버 실행중 http://localhost:3001'))