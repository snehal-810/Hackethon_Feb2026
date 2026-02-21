const express = require('express')
const cors = require('cors')

//user defined modules


//creating the express object
const app = express()

//add the middlewares
app.use(cors())
app.use(express.static('images'))
app.use(express.json())
app.use(authorization)



//startig the server at port 4000
app.listen(4000, 'localhost', () => {
  console.log('server started at port 4000')
})