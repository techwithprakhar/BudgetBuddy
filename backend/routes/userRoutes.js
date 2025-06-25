const router=require('express').Router();
const { registerUser,loginUser,getProfile,logoutUser,updateProfile,googleLogin} =require('../controllers/userController.js');
const {authUser} =require('../middlewares/authMiddleware')
const upload = require('../middlewares/upload.js')




router.post('/signup',registerUser)
router.post('/login',loginUser)
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
