const userModel=require("../models/userModel")



module.exports.createUser=async({name,email,password,profilePicture=''})=>{   // it is accepting the data of user and creating the user and returning the user 
    if(!name  || !email || !password){
        throw new Error("All fields are Required")
    }
    else{
        const user=userModel.create({
            name,
            email,
            password,
            profilepicture:profilePicture
            
        })
        return user;
    }
}