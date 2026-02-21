const express = require('express')
const cors = require('cors')

// creating express app
const app = express()

// middlewares
app.use(cors())
app.use(express.json())
app.use(express.static('images'))

// test route
app.get('/', (req, res) => {
  res.send('Admission Management Backend Running')
})

// start server
app.listen(4000, () => {
  console.log('Server started at port 4000')
})