import mongoose from "mongoose"
import bcrypt from "bcrypt"
import ApiError from "../Util/APIerror.js"



const UserSchema= new mongoose.Schema({
   name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  refreshToken:{
    type:String,
  }


},{timestamps:true})
UserSchema.index({email:1}) 


UserSchema.pre("save",async function(next){
        if(!this?.isModified(password)){
            next();
        }
            try {
                this.password=await bcrypt.hash(password,8)
            
            next();
            } catch (error) {
                next(err)
            }
})
UserSchema.methods.comparepassword=async function(password){
   console.log(password)
    const result = bcrypt.compare(password,this.password);
    if(!result){
        throw new ApiError(404,"password is incorrect")
    }
 return true;

}

export const User=mongoose.model('User_DB',UserSchema)