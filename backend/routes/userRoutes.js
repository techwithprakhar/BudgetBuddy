const router=require('express').Router();
const { registerUser,loginUser,getProfile,logoutUser,updateProfile,googleLogin, sendOTP, verifyOTPAndRegister, requestPasswordReset, resetPassword, changePassword} =require('../controllers/userController.js');
const {authUser} =require('../middlewares/authMiddleware')
const upload = require('../middlewares/upload.js')




router.post('/signup',registerUser)
router.post('/send-otp', sendOTP) // Send OTP for email verification
router.post('/verify-otp-register', verifyOTPAndRegister) // Verify OTP and create account
router.post('/login',loginUser)
router.post('/forgot-password', requestPasswordReset) // Request password reset
router.post('/reset-password', resetPassword) // Reset password with token
router.post('/change-password', authUser, changePassword) // Change password (requires authentication)
router.get('/profile',authUser,getProfile)
router.get('/logout',authUser,logoutUser)
router.put(
  '/update-profile',
  
  authUser,
  upload.single('avatar'),
  updateProfile
);

router.post('/google-login', googleLogin); // 🎯 Google OAuth endpoint

module.exports=  router;
