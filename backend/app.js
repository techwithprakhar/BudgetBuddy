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

// Split comma-separated list into array
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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
