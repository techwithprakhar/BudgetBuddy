const userModel = require('../models/userModel')
const userService = require('../services/userService')
const cloudinary = require('../config/cloudinary')
const jwt=require('jsonwebtoken')
const { google } = require('googleapis');
const otpModel = require('../models/otpModel');
const passwordResetTokenModel = require('../models/passwordResetTokenModel');
const emailService = require('../services/emailService');


// Send OTP for email verification
module.exports.sendOTP = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const isUserAlreadyExist = await userModel.findOne({ "email": email })
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'User already exist' })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Delete any existing OTP for this email
        await otpModel.deleteMany({ email });
        
        // Save OTP to database (expires in 10 minutes)
        await otpModel.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // Store user registration data temporarily (we'll verify OTP before creating account)
        // For now, we'll just send the OTP. The frontend will send name, email, password, and otp together for verification
        
        // Send OTP email
        await emailService.sendOTPEmail(email, otp);
        
        res.status(200).json({ 
            message: 'OTP sent successfully to your email',
            success: true 
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
}

// Verify OTP and register user
module.exports.verifyOTPAndRegister = async (req, res, next) => {
    try {
        const { name, email, password, otp } = req.body;
        
        // Check if user already exists
        const isUserAlreadyExist = await userModel.findOne({ "email": email })
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'User already exist' })
        }

        // Verify OTP
        const otpRecord = await otpModel.findOne({ 
            email: email.toLowerCase().trim(),
            otp: otp
        });
        
        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Check if OTP is expired
        if (new Date() > otpRecord.expiresAt) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        // OTP is valid, create user account
        const hashedPassword = await userModel.hashPassword(password);
        const user = await userService.createUser({
            name,
            email,
            password: hashedPassword
        });
        
        // Mark email as verified
        user.isEmailVerified = true;
        await user.save();
        
        // Delete used OTP
        await otpModel.deleteOne({ _id: otpRecord._id });
        
        const token = user.generateAuthToken();
        // Remove password from user object before sending to frontend
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        
        res.status(201).json({ 
            token, 
            user: userObj,
            message: 'Account created successfully'
        });
    } catch (error) {
        console.error('Error verifying OTP and registering:', error);
        res.status(500).json({ message: 'Failed to create account. Please try again.' });
    }
}

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
    const { name } = req.body;
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

// Change password (requires current password verification)
module.exports.changePassword = async (req, res) => {
  try {
    // User is already authenticated via authUser middleware (req.user is set)
    const user = await userModel.findById(req.user._id).select('+password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = await userModel.hashPassword(newPassword);
    await user.save();
    
    // Generate new auth token
    const newToken = user.generateAuthToken();
    const userObj = user.toObject();
    delete userObj.password;
  
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: userObj,
      token: newToken
    });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to change password' });
  }
}

// 🎯 Google OAuth Login/Signup
module.exports.googleLogin = async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
      console.error('Google OAuth credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured. Please contact support.'
      });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    let tokens;
    try {
      const tokenResponse = await oauth2Client.getToken(code);
      tokens = tokenResponse.tokens;
      oauth2Client.setCredentials(tokens);
    } catch (tokenError) {
      console.error('Error exchanging authorization code:', tokenError.message);
      
      // Extract more specific error information
      let errorMessage = 'Invalid or expired authorization code.';
      if (tokenError.message?.includes('redirect_uri_mismatch')) {
        errorMessage = 'Redirect URI mismatch. Please contact support.';
      } else if (tokenError.message?.includes('invalid_grant')) {
        errorMessage = 'Invalid authorization code. Please try again.';
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    // Get user info
    let googleResponse;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      googleResponse = await oauth2.userinfo.get();
    } catch (userInfoError) {
      console.error('❌ Error fetching user info from Google:', userInfoError.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user information from Google'
      });
    }

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
        _id: user._id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove password from user object before sending to frontend
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;

    // 6️⃣ Return user data
    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token: token,
      user: userObj
    });

  } catch (error) {
    console.error('❌ Google login error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      return res.status(401).json({
        success: false,
        message: 'Google authentication failed. Please check your OAuth credentials.'
      });
    }

    if (error.message?.includes('redirect_uri_mismatch')) {
      return res.status(400).json({
        success: false,
        message: 'Redirect URI mismatch. Please check GOOGLE_REDIRECT_URI in your .env matches Google Console settings.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Google login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Request password reset
module.exports.requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            // For security, don't reveal if user exists or not
            return res.status(200).json({ 
                message: 'If an account exists with this email, a password reset link has been sent.',
                success: true 
            });
        }

        // Generate reset token
        const resetToken = passwordResetTokenModel.generateToken();
        
        // Delete any existing reset tokens for this email
        await passwordResetTokenModel.deleteMany({ email: email.toLowerCase().trim() });
        
        // Save reset token to database (expires in 1 hour)
        await passwordResetTokenModel.create({
            email: email.toLowerCase().trim(),
            token: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        // Send password reset email
        try {
            await emailService.sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            await passwordResetTokenModel.deleteOne({ token: resetToken });
            return res.status(500).json({ 
                message: 'Failed to send reset email. Please try again later.' 
            });
        }
        
        res.status(200).json({ 
            message: 'If an account exists with this email, a password reset link has been sent.',
            success: true 
        });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ message: 'Failed to process password reset request.' });
    }
};

// Reset password with token
module.exports.resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Find valid reset token
        const resetTokenRecord = await passwordResetTokenModel.findOne({ 
            token: token,
            used: false
        });
        
        if (!resetTokenRecord) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Check if token is expired
        if (new Date() > resetTokenRecord.expiresAt) {
            await passwordResetTokenModel.deleteOne({ _id: resetTokenRecord._id });
            return res.status(400).json({ message: 'Reset token has expired. Please request a new one.' });
        }

        // Find user by email
        const user = await userModel.findOne({ email: resetTokenRecord.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update password
        user.password = await userModel.hashPassword(newPassword);
        await user.save();

        // Mark token as used
        resetTokenRecord.used = true;
        await resetTokenRecord.save();

        // Generate new auth token
        const authToken = user.generateAuthToken();
        const userObj = user.toObject ? user.toObject() : { ...user };
        delete userObj.password;
        
        res.status(200).json({ 
            message: 'Password reset successfully',
            token: authToken,
            user: userObj,
            success: true 
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
};