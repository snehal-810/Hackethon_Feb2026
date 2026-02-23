const express = require('express')
const cryptoJs = require('crypto-js')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const config = require('../config')

const router = express.Router()

// =======================
// REGISTER USER
// =======================
router.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' })
    }

    // role validation (VERY IMPORTANT)
    if (role !== 'admin' && role !== 'student') {
      return res.status(400).json({ message: 'Role must be admin or student' })
    }

    // check existing user
    const [existing] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // encrypt password
    const encryptedPassword = cryptoJs.SHA256(password).toString()

    // insert user
    await db.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, encryptedPassword, role]
    )

    res.json({ message: 'User registered successfully' })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =======================
// LOGIN USER
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const encryptedPassword = cryptoJs.SHA256(password).toString()

    const [users] = await db.execute(
      'SELECT id, email, role FROM users WHERE email = ? AND password = ?',
      [email, encryptedPassword]
    )

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = users[0]

    // generate JWT
   const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role
  },
  config.JWT_SECRET_KEY,   // ✅ MUST MATCH index.js
  { expiresIn: '1d' }
)

    res.json({
      message: 'Login successful',
      token,
      email: user.email,
      role: user.role
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router