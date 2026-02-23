const express = require('express')
const db = require('../config/db')

const router = express.Router()

// CREATE STUDENT
router.post('/addStudent', async (req, res) => {
  try {
    const { name, email, phone } = req.body

    const [existing] = await db.execute(
      'SELECT student_id FROM students WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Student already exists' })
    }

    await db.execute(
      'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    )

    res.json({ message: 'Student created successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router