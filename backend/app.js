const express = require('express')
const cors=require('cors')
const app = express()
const connectDb=require('./db/db');
const userRoutes=require('./routes/userRoutes')
const transactionRoutes=require('./routes/transactionRoutes')
const goalRoutes=require('./routes/goalRoutes')

const cookie = require('cookie-parser');


require('dotenv').config();

const port=process.env.PORT;

app.use(cors({
  origin: 'http://localhost:3000', // Set to your frontend URL
  credentials: true // Allow cookies and credentials
}))   // currently I am allowing all origins to send requiest to our backend
app.use(express.json())
app.use(cookie())


app.use('/user',userRoutes)
app.use('/transaction',transactionRoutes)
app.use('/goal',goalRoutes)

const server=()=>{
    connectDb()
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
}

server();
