const express = require('express')
const cors = require('cors')

// creating express app
const app = express()

const studentRoutes = require("./routes/studentRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const batchRoutes = require("./routes/batchRoutes");
const registrationRoutes = require('./routes/registrationRoutes');
const paymentReportAdminRoutes = require('./routes/paymentReportAdminRoutes');
const discountRoutes = require('./routes/discountRoutes');


// middlewares
app.use(cors())
app.use(express.json())
//app.use(express.static('images'))

// test route
app.get('/', (req, res) => {
  res.send('Admission Management Backend Running')
})


app.use("/student", studentRoutes);
app.use("/user", userRoutes)
app.use("/courses", courseRoutes)
app.use("/batches", batchRoutes)
app.use('/registrations', registrationRoutes)
app.use('/admin/payments', paymentReportAdminRoutes)
app.use('/discounts', discountRoutes)
// start server
app.listen(4000, () => {
  console.log('Server started at port 4000')
})