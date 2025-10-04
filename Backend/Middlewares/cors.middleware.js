import ApiError from "../Util/APIerror.js"

var whitelist=['http://localhost:5000']
export const configurecors={
    origin:(origin,cb)=>{
        if(!origin || whitelist.includes(origin)){
            cb(null,true);
        }
        else{
        cb( new ApiError(404,'Not allowed by CORS'))
        }
    }
}