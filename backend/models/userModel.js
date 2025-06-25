const mongoose=require('mongoose')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

const userSchema=new mongoose.Schema({
name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password not required for Google users
    }
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values
    unique: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// // Index for better performance
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });

userSchema.methods.generateAuthToken=function(){
    const token = jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }  // setting token expiration time to 24 hours
    );
    return token
}

userSchema.methods.comparePassword=async function(password){  // methods is used to create a function which can be used by the instance of the model
    return await bcrypt.compare(password,this.password)         // bcrypt will compare the password with the hashed password
}

userSchema.statics.hashPassword=async function(password){    // statics is used to create a function which can be used by the model itself
    return await bcrypt.hash(password,10);
}

const userModel=mongoose.model('user',userSchema)

module.exports=userModel