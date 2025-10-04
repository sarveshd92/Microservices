import { User } from "../Models/UserModel.js";
import ApiError from "../Util/APIerror.js";
import jwt from "jsonwebtoken"
import logger from "../Util/Logger.js";
export const generatetoken= async(email)=>{

    try {
        
        const refreshtoken =  jwt.sign({email:email},process.env.JWT_SECRET_KEY,{ expiresIn: '1h' })
        const accesstoken =  jwt.sign({email:email},process.env.JWT_SECRET_KEY,{ expiresIn: '1m' })
        return {refreshtoken,accesstoken};
    } catch (error) {
        logger.warn("error while generating refresh token",error);
        throw new ApiError(401,"Failed to generate token",error);
    }
}



export const register= async(req,res,next)=>{
    try {
        const {name,email,password}=req?.body;
        console.log(req.body)
        if(!email||!name||!password){
            throw new ApiError(404,"please fill all the required fields");

        }
                const UserData= await User.findOne({email:email});
                if(UserData){
                    throw new ApiError(404,"User already exists in the database")
                }

               
     
                const NewUser=new User({
                    email:email,
                    password:password,
                    name:name,
                  
                })

                await NewUser.save()
                return res.status(201).json({message:"user created",data:NewUser})

    } catch (error) {
        logger.error("Error in register controller :",error)
        throw new ApiError(500,error || "Error in register controller ")
    }
}

export const login=async(req,res,next)=>{
    try {
        const {email,password}=req.body;
        if(!email||!password){
            throw new ApiError(404,"fill all the required fields");

        }
        const data=await User.findOne({email:email});
          if(!data){
            throw new ApiError(404,"no user found with this username please signup")
          }
      
          await data.comparepassword(password);
           const {refreshtoken,accesstoken} = await generatetoken(email);

           const updateddata = await User.findOneAndUpdate({email:email},{$set:{refreshToken:refreshtoken}},{new:true})
         

           return res.status(201).cookie("token",accesstoken,{
            httpOnly:true,
            secure:true,
            SameSite:"Strict"
           }).json({ success:true,
            message:"Logged in Successfully",
            data:data
           })
        
    } catch (err) {
        logger.error("Error in Login controller:",err)
           next(err)
   
     
    }
}

