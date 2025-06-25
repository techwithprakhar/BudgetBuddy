const router=require('express').Router();
const { getGoals, addGoal, updateGoal, deleteGoal } = require('../controllers/goalController');
const {authUser, authUserWithGoalId} =require('../middlewares/authMiddleware')



router.get('/get-goal',authUser,getGoals)
router.post('/add-goal',authUser,addGoal)
router.put('/update-goal/:id',authUserWithGoalId,updateGoal)
router.delete('/delete-goal/:id',authUserWithGoalId,deleteGoal)

module.exports=  router;

