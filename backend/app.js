const express = require('express')
const cors=require('cors')
const app = express()
const connectDb=require('./db/db');
const userRoutes=require('./routes/userRoutes')
const transactionRoutes=require('./routes/transactionRoutes')
const goalRoutes=require('./routes/goalRoutes')

const cookie = require('cookie-parser');


require('dotenv').config();

const port=process.env.PORT || 5000;

// Split comma-separated list into array
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];

console.log('🌐 CORS Configuration:');
console.log('Allowed Origins:', allowedOrigins.length > 0 ? allowedOrigins : 'NONE - CORS will block all requests!');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('⚠️ Request with no origin received');
      return callback(null, true);
    }
    
    if (allowedOrigins.length === 0) {
      console.error('❌ ALLOWED_ORIGINS not configured! Blocking request from:', origin);
      return callback(new Error('CORS not configured. Please set ALLOWED_ORIGINS in environment variables.'));
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.error(`❌ Blocked by CORS: ${origin}`);
      console.error('✅ Allowed origins are:', allowedOrigins);
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
