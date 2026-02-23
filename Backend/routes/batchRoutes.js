const express = require('express')
const db = require('../config/db')

const router = express.Router()

// =======================
// ADD BATCH
// =======================
router.post('/addBatch', async (req, res) => {
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

    // ✅ Correct validation
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

    res.json({ message: 'Batch added successfully' })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router