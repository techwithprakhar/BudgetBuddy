const userModel=require('../models/userModel')
const transactionModel=require('../models/transactionModel')
const GoalModel=require('../models/goalModel')
const jwt=require('jsonwebtoken')


module.exports.authUser=async(req,res,next)=>{                                  // it simply checks token from cookies or headers.authorization and then checks if token is valid thn sets the user in the front end
    // const token= req.cookies.token || req.headers.authorization.split(' ')[1]  // getting token from cookies or from headers.authorization
           
    
    // Use req.cookies (not req.cookie) and prefer cookie over header for browser auth
    const token = (req.cookies && req.cookies.token) || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }


 
 
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findById(decoded._id)    // finding in he database by id after decryption
       
        
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }

        
        req.user=user             // setting the user in front end
        
        
        return next();
    }
    catch(err){
        console.log(err);
        
        return res.status(401).json({message:"Unauthorized"})  // if token is not valid whie decoding
    }
}


module.exports.authUserWithTransactionId=async(req,res,next)=>{                                  // it simply checks token from cookies or headers.authorization and then checks if token is valid thn sets the user in the front end
    // const token= req.cookies.token || req.headers.authorization.split(' ')[1]  // getting token from cookies or from headers.authorization

    
    const {id}=req.params;

     // Use req.cookies (not req.cookie) and prefer cookie over header for browser auth
     const token = (req.cookies && req.cookies.token) || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }

    
 

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findById(decoded._id)    // finding in he database by id after decryption
       
        
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const transaction=await transactionModel.findById(id)  // finding the transaction by id
        if(!transaction){
            return res.status(404).json({message:"Transaction not found"})  // if transaction is
        }
        if(transaction.userId!=decoded._id){
            return res.status(401).json({message:"Unauthorized Not Your Transaction"})  // if transaction is not of
        }  // if transaction is not of the user
        
        req.user=user             // setting the user in front end
        
        
        return next();
    }
    catch(err){
        console.log(err);
        
        return res.status(401).json({message:"Unauthorized"})  // if token is not valid whie decoding
    }
}

module.exports.authUserWithGoalId=async(req,res,next)=>{                                  // it simply checks token from cookies or headers.authorization and then checks if token is valid thn sets the user in the front end
    
    const {id}=req.params;

     // Use req.cookies (not req.cookie) and prefer cookie over header for browser auth
     const token = (req.cookies && req.cookies.token) || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }

    
 

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findById(decoded._id)    // finding in he database by id after decryption
       
        
        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }

        const goal=await GoalModel.findById(id)  // finding the transaction by id
        if(!goal){
            return res.status(404).json({message:"Goal not found"})  // if transaction is
        }
        if(goal.userId!=decoded._id){
            return res.status(401).json({message:"Unauthorized Not Your Goal"})  // if transaction is not of
        }  // if transaction is not of the user
        
        req.user=user             // setting the user in front end
        
        
        return next();
    }
    catch(err){
        console.log(err);
        
        return res.status(401).json({message:"Unauthorized"})  // if token is not valid whie decoding
    }
}



