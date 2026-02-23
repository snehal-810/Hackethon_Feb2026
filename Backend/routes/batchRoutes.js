const express = require('express')
const db = require('../config/db')
const { authorization, checkAuthorization } = require('../middlewares/authMiddleware')

const router = express.Router()

// =======================
// ADD BATCH (ADMIN ONLY)
// =======================
router.post(
  '/addBatch',
  authorization,
  checkAuthorization,
  async (req, res) => {
    try {
      const {
        course_id,
        batch_name,
        fee,
        capacity,
        mode,
        location,
        start_date,
        end_date
      } = req.body

      // validation
      if (!course_id || !fee || !capacity || !mode) {
        return res.status(400).json({ error: 'Required fields missing' })
      }

      await db.execute(
        `INSERT INTO batches 
         (course_id, batch_name, fee, capacity, mode, location, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          course_id,
          batch_name,
          fee,
          capacity,
          mode,
          location,
          start_date,
          end_date
        ]
      )

      res.json({ message: 'Batch added successfully (Admin)' })

    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
)

module.exports = router