// const express = require('express')
// const db = require('../config/db')
// const crypto = require('crypto')

// const router = express.Router()

// // ===============================
// // REGISTER STUDENT INTO BATCH
// // ===============================
// router.post('/registerStudent', async (req, res) => {
//   try {
//     const { student_id, batch_id, discount_id } = req.body

//     if (!student_id || !batch_id) {
//       return res.status(400).json({ message: 'Student and Batch are required' })
//     }

//     // 1️⃣ Check student exists
//     const [students] = await db.execute(
//       'SELECT student_id FROM students WHERE student_id = ?',
//       [student_id]
//     )
//     if (students.length === 0) {
//       return res.status(404).json({ message: 'Student not found' })
//     }

//     // 2️⃣ Check batch exists and get fee & capacity
//     const [batches] = await db.execute(
//       'SELECT fee, capacity FROM batches WHERE batch_id = ?',
//       [batch_id]
//     )
//     if (batches.length === 0) {
//       return res.status(404).json({ message: 'Batch not found' })
//     }

//     const batchFee = batches[0].fee
//     const capacity = batches[0].capacity

//     // 3️⃣ Enforce ONE COURSE AT A TIME rule
//   const [activeReg] = await db.execute(
//   `SELECT registration_id FROM registrations 
//    WHERE student_id = ? AND status = 'ACTIVE'`,
//   [student_id]
// )

//     if (activeReg.length > 0) {
//       return res.status(400).json({
//         message: 'Student already has an active registration'
//       })
//     }

//     // 4️⃣ Check batch capacity
//     const [countResult] = await db.execute(
//       'SELECT COUNT(*) AS count FROM registrations WHERE batch_id = ?',
//       [batch_id]
//     )

//     if (countResult[0].count >= capacity) {
//       return res.status(400).json({ message: 'Batch capacity full' })
//     }

//     // 5️⃣ Discount calculation (ONLY ONE DISCOUNT ALLOWED)
//   // 5️⃣ Discount calculation (ONLY ONE DISCOUNT ALLOWED)
// let discountAmount = 0

// if (discount_id) {

//   const [discounts] = await db.execute(
//     `SELECT value_type, value
//      FROM discounts
//      WHERE discount_id = ?
//        AND is_active = 1
//        AND (valid_from IS NULL OR valid_from <= CURDATE())
//        AND (valid_to IS NULL OR valid_to >= CURDATE())`,
//     [discount_id]
//   )

//   if (discounts.length === 0) {
//     return res.status(400).json({
//       message: 'Invalid or expired discount'
//     })
//   }

//   const discount = discounts[0]

//   if (discount.value_type === 'FLAT') {
//     discountAmount = discount.value
//   }

//   if (discount.value_type === 'PERCENT') {
//     discountAmount = (batchFee * discount.value) / 100
//   }
// }

//     // 6️⃣ Final fee calculation
//     const finalAmount = batchFee - discountAmount

//     // 7️⃣ Generate unique Registration Code
//     const registrationCode = 'REG-' + crypto.randomBytes(4).toString('hex')

//     // 8️⃣ Save registration
//     const [result] = await db.execute(
//       `INSERT INTO registrations
//       (registration_code, student_id, batch_id, original_fee, discount_amount, final_amount)
//       VALUES (?, ?, ?, ?, ?, ?)`,
//       [
//         registrationCode,
//         student_id,
//         batch_id,
//         batchFee,
//         discountAmount,
//         finalAmount
//       ]
//     )

//     res.json({
//       message: 'Student registered successfully',
//       registration_code: registrationCode,
//       original_fee: batchFee,
//       discount_amount: discountAmount,
//       final_amount: finalAmount
//     })

//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// })

// module.exports = router

const express = require('express')
const db = require('../config/db')

const router = express.Router()

// =======================
// REGISTER STUDENT WITH DISCOUNT
// =======================
router.post('/registerStudent', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      course_id,
      batch_id,
      discount_code   // OPTIONAL
    } = req.body

    // -----------------------
    // BASIC VALIDATION
    // -----------------------
    if (!name || !email || !phone || !course_id || !batch_id) {
      return res.status(400).json({ error: 'Required fields missing' })
    }

    // -----------------------
    // CHECK / CREATE STUDENT
    // -----------------------
    const [students] = await db.execute(
      'SELECT student_id FROM students WHERE email = ?',
      [email]
    )

    let studentId

    if (students.length === 0) {
      const [result] = await db.execute(
        'INSERT INTO students (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone]
      )
      studentId = result.insertId
    } else {
      studentId = students[0].student_id
    }

    // -----------------------
    // ONE ACTIVE REGISTRATION RULE
    // -----------------------
    const [existingReg] = await db.execute(
      `SELECT registration_id 
       FROM registrations 
       WHERE student_id = ? AND status = 'REGISTERED'`,
      [studentId]
    )

    if (existingReg.length > 0) {
      return res.status(400).json({
        error: 'Student already has an active registration'
      })
    }

    // -----------------------
    // FETCH BATCH FEE
    // -----------------------
    const [batches] = await db.execute(
      'SELECT fee FROM batches WHERE batch_id = ?',
      [batch_id]
    )

    if (batches.length === 0) {
      return res.status(400).json({ error: 'Invalid batch' })
    }

    const originalFee = batches[0].fee
    let discountAmount = 0
    let discountId = null

    // -----------------------
    // DISCOUNT VALIDATION
    // -----------------------
    if (discount_code) {
      const [discounts] = await db.execute(
        `SELECT * FROM discounts
         WHERE discount_code = ?
           AND is_active = true
           AND CURDATE() BETWEEN valid_from AND valid_to`,
        [discount_code]
      )

      if (discounts.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired discount' })
      }

      const discount = discounts[0]
      discountId = discount.discount_id

      if (discount.value_type === 'FLAT') {
        discountAmount = discount.value
      } else if (discount.value_type === 'PERCENT') {
        discountAmount = (originalFee * discount.value) / 100
      }
    }

    // -----------------------
    // FINAL AMOUNT
    // -----------------------
    const finalAmount = originalFee - discountAmount

    // -----------------------
    // UNIQUE REGISTRATION CODE
    // -----------------------
    const registrationCode =
      'REG-' + Date.now() + '-' + Math.floor(Math.random() * 1000)

    // -----------------------
    // SAVE REGISTRATION
    // -----------------------
    await db.execute(
      `INSERT INTO registrations
      (registration_code, student_id, course_id, batch_id,
       original_fee, discount_id, discount_amount, final_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        registrationCode,
        studentId,
        course_id,
        batch_id,
        originalFee,
        discountId,
        discountAmount,
        finalAmount
      ]
    )

    res.json({
      message: 'Student registered successfully',
      registrationCode,
      originalFee,
      discountAmount,
      finalAmount
    })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router