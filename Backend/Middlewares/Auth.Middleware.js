import jwt from "jsonwebtoken";
import logger from "../Util/Logger.js";
import { User } from "../Models/UserModel.js";
import ApiError from "../Util/APIerror.js";

const Auth = async (req, res, next) => {
  try {
    let token = req?.headers?.cookie?.split("token=")[1];
    if (!token) throw new ApiError(401 ,"No token, authorization denied");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    } catch (err) {
      if (err.name === "TokenExpiredError") {
  
        const decodedData = jwt.decode(token); 
        const user = await User.findOne({ email: decodedData?.email });
        if (!user || !user.refreshToken) {
          throw new ApiError(403, "Refresh token not found, login again");
        }
        try {
            
            await jwt.verify(user.refreshToken,process.env.JWT_SECRET_KEY);
            
            const NewAccessToken= await jwt.sign({email:user?.email},process.env.JWT_SECRET_KEY,{expiresIn:"1m"})
       
            res.cookie("token",NewAccessToken,{
                    httpOnly:true,
                    secure:true,
                    SameSite:"Strict"
                })
        } catch (refreshtokenerror) {
                logger.error("Refresh Token Not found, PLease login again:",refreshtokenerror);
                next(`Refresh Token Not found, PLease login again:${refreshtokenerror}`);
                
        }
    }
}
next();
  }
catch(err){
    logger.error("No token, authorization denied",err);
        next(err?.message||"No token, authorization denied");
}
}
export default Auth;
