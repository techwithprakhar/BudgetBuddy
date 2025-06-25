const mongoose=require('mongoose')

// ----------  DATABASE CONNECTION  ----------
async function connectDB() {
  try {
    mongoose.set('strictQuery',false)
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  MongoDB connected successfully');
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);                 // stop the server if db connection fails
  }
}
module.exports= connectDB;