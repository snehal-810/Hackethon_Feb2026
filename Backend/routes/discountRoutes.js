const express = require('express')
const db = require('../config/db')
const { authorization, checkAuthorization } = require('../middlewares/authMiddleware')

const router = express.Router()

// =======================
// 1️⃣ CREATE DISCOUNT (ADMIN ONLY)
// =======================
router.post(
  '/create',
  authorization,
  checkAuthorization,
  async (req, res) => {
    try {
      const {
        discount_code,
        discount_type,
        value_type,
        value,
        valid_from,
        valid_to
      } = req.body

      if (!discount_code || !discount_type || !value_type || !value) {
        return res.status(400).json({ error: 'Required fields missing' })
      }

      await db.execute(
        `INSERT INTO discounts
         (discount_code, discount_type, value_type, value, valid_from, valid_to)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          discount_code,
          discount_type,
          value_type,
          value,
          valid_from,
          valid_to
        ]
      )

      res.json({ message: 'Discount created successfully (Admin)' })

    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)


// =======================
// 2️⃣ LIST ACTIVE DISCOUNTS
// (ADMIN / INTERNAL USE)
// =======================
router.get(
  '/active',
  authorization,
  checkAuthorization,
  async (req, res) => {
    try {
      const sql = `
        SELECT *
        FROM discounts
        WHERE is_active = true
          AND CURDATE() BETWEEN valid_from AND valid_to
      `

      const [rows] = await db.execute(sql)

      res.json({
        count: rows.length,
        discounts: rows
      })

    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

module.exports = router