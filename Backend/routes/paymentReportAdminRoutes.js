const express = require('express')
const db = require('../config/db')
const { authorization, checkAuthorization } = require('../middlewares/authMiddleware')

const router = express.Router()

// 🔐 JWT + ADMIN PROTECTED REPORT
router.get(
  '/report',
  authorization,
  checkAuthorization,
  async (req, res) => {
    try {
      const sql = `
        SELECT 
          r.registration_code,
          s.name AS student_name,
          s.email,
          c.course_name,
          b.batch_name,
          b.fee AS original_fee,
          r.discount_amount,
          r.final_amount,
          r.created_at
        FROM registrations r
        JOIN students s ON r.student_id = s.student_id
        JOIN batches b ON r.batch_id = b.batch_id
        JOIN courses c ON b.course_id = c.course_id
        ORDER BY r.created_at DESC
      `

      const [rows] = await db.execute(sql)

      res.json({
        count: rows.length,
        data: rows
      })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

module.exports = router