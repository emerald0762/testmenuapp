const express = require('express')
const cors = require('cors')
const Database = require('better-sqlite3')

const app = express()
app.use(cors())
app.use(express.json())


const db = new Database('menu.db')


db.exec(`
  CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    restaurant TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    items TEXT NOT NULL
  )
`)

app.post('/api/menu', (req, res) => {
  const { date, restaurant, meal_type, items } = req.body
  
  db.prepare('DELETE FROM menus WHERE date = ? AND restaurant = ? AND meal_type = ?')
    .run(date, restaurant, meal_type)
  
  db.prepare('INSERT INTO menus (date, restaurant, meal_type, items) VALUES (?, ?, ?, ?)')
    .run(date, restaurant, meal_type, JSON.stringify(items))
  
  res.json({ success: true })
})

app.get('/api/menu', (req, res) => {
  const { date, restaurant } = req.query
  
  const rows = db.prepare('SELECT * FROM menus WHERE date = ? AND restaurant = ?')
    .all(date, restaurant)
  
  const result = {}
  rows.forEach(row => {
    result[row.meal_type] = JSON.parse(row.items)
  })
  
  res.json(result)
})

app.listen(3001, () => console.log('서버 실행중 http://localhost:3001'))