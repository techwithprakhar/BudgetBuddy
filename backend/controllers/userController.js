const userModel = require('../models/userModel')
const userService = require('../services/userService')
const cloudinary = require('../config/cloudinary')
const jwt=require('jsonwebtoken')
const { google } = require('googleapis');


module.exports.registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    const isUserAlreadyExist = await userModel.findOne({ "email": email })
    if (isUserAlreadyExist) {
        return res.status(400).json({ message: 'User already exist' })
    }
    const hashedPassword = await userModel.hashPassword(password)
    const user = await userService.createUser({
        name,
        email,
        password: hashedPassword
    })
    const token = user.generateAuthToken()
    // Remove password from user object before sending to frontend
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    res.status(201).json({ token, user: userObj })
}

module.exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password')
    if (!user) {
        return res.status(401).json({ message: "User not found" })
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        return res.status(401).json({ errors: [{ message: "Invalid Credentials" }] })
    }
    const token = user.generateAuthToken()
    // Remove password from user object before sending to frontend
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    res.status(200).json({ token, user: userObj })
}

module.exports.getProfile = async (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.sub || decoded._id);
      if (!user) return res.status(401).json({ message: 'User not found' });
      const userObj = user.toObject ? user.toObject() : { ...user };
      delete userObj.password;
      res.status(200).json({ user: userObj });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports.logoutUser = async (req, res, next) => {
    // No cookie to clear, just respond
    res.status(200).json({ message: "Logged out successfully" })
}

module.exports.updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.sub || decoded._id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const { name, password } = req.body;
    let profilePicUrl = user.profilePic;
    let toUpload;
    if (req.file && req.file.buffer) {
      const mime = req.file.mimetype;
      const b64 = req.file.buffer.toString('base64');
      toUpload = `data:${mime};base64,${b64}`;
    }
    if (toUpload) {
      const uploaded = await cloudinary.uploader.upload(toUpload, {
        folder: 'user_avatars',
        public_id: `user_${user._id}`,
        overwrite: true,
        transformation: { width: 300, height: 300, crop: 'thumb', gravity: 'face' }
      });

      profilePicUrl = uploaded.secure_url;
      user.profilePicture = profilePicUrl;
    }
    if (name) user.name = name;
    if (password) user.password = await userModel.hashPassword(password);
    await user.save();
    const newToken = user.generateAuthToken();
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.profilepicture;
  
    res.status(200).json({
      success: true,
      user: userObj,
      token: newToken
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// 🎯 Google OAuth Login/Signup
module.exports.googleLogin = async (req, res) => {
  try {
   
    
    const { code } = req.body;
if (!code) {
  return res.status(400).json({ success: false, message: 'Authorization code is required' });
}
 
// Exchange code for tokens

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // Must match what you set in Google Cloud Console
);

const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);


// Get user info
const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
const googleResponse = await oauth2.userinfo.get();
const { id: googleId, email, name, picture } = googleResponse.data;


    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Unable to get email from Google'
      });
    }

    // 2️⃣ Check if user exists
    let user = await userModel.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // 3️⃣ Update existing user with Google info if needed
      if (!user.googleId) {
        user.googleId = googleId;
        user.profilePicture = picture;
        await user.save();
      }
    } else {
      // 4️⃣ Create new user
      user = new userModel({
        name: name,
        email: email,
        googleId: googleId,
        profilePicture: picture,
        authProvider: 'google',
        isEmailVerified: true, // Google emails are pre-verified
        isActive: true
      });

      await user.save();
    }

    // 5️⃣ Generate JWT token
    // const token = jwt.sign(
    //   { 
    //     sub: user._id,
    //     email: user.email,
    //     name: user.name
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '7d' }
    // );

    const token = jwt.sign(
  { 
    _id: user._id, // ← change from `sub` to `_id`
    email: user.email,
    name: user.name
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)


    // Set cookie with proper options for cross-origin auth
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false, // false for localhost, true for prod
      sameSite: 'None', // 'None' for cross-site, 'Lax' for same-site
    });

    // 6️⃣ Return user data
    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider || 'google'
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    
    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google access token'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Google login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};