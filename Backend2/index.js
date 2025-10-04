import express from "express"
const app =express();



app.use(express.json())
app.use('/',async (req,res)=>{
    console.log("hello ")
    return res.status(200).json({success:true, message:"hello "})
})
app.listen(5002,()=>{
    console.log("server is running on port 5002")
})