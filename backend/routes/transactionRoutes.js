const router=require('express').Router();
const { getTransaction, addTransaction, updateTransaction, deleteTransaction,} =require('../controllers/transactionController');
const {authUser,authUserWithTransactionId} =require('../middlewares/authMiddleware')



router.get('/get-transaction',authUser,getTransaction)
router.post('/add-transaction',authUser,addTransaction)
router.put('/update-transaction/:id',authUserWithTransactionId,updateTransaction)
router.delete('/delete-transaction/:id',authUserWithTransactionId,deleteTransaction)

module.exports=  router;

