// const express = require('express')
// const db = require('../config/db')

// const router = express.Router()

// // =======================
// // ADD COURSE
// // =======================
// router.post('/addCourse', async (req, res) => {
//   try {
//     const { course_name, description } = req.body

//     if (!course_name) {
//       return res.status(400).json({ message: 'Course name is required' })
//     }

//     await db.execute(
//       'INSERT INTO courses (course_name, description) VALUES (?, ?)',
//       [course_name, description]
//     )

//     res.json({ message: 'Course added successfully' })
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// })

// // =======================
// // GET ALL COURSES
// // =======================
// router.get('/getCourses', async (req, res) => {
//   try {
//     const [courses] = await db.execute('SELECT * FROM courses')
//     res.json(courses)
//   } catch (err) {
//     res.status(500).json({ error: err.message })
//   }
// })

// module.exports = router

const express = require('express')
const { authorization, checkAuthorization } = require('../middlewares/authMiddleware')
const db = require('../config/db')

const router = express.Router()

// ADMIN – Create Course
router.post(
  '/addCourse',
  authorization,
  checkAuthorization,
  async (req, res) => {
    const { course_name, description } = req.body

    await db.execute(
      'INSERT INTO courses (course_name, description) VALUES (?, ?)',
      [course_name, description]
    )

    res.json({ message: 'Course created successfully' })
  }
)

// PUBLIC – Get all courses
router.get('/getCourses', async (req, res) => {
  const [rows] = await db.execute('SELECT * FROM courses')
  res.json(rows)
})

module.exports = router