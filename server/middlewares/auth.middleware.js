import jwt from "jsonwebtoken";

const auth =async(req,res,next)=>{
    try {
        const token = req.cookies.accessToken || request?.header?.authorization?.split(" ")[1]; // ["Bearer", "token"]
        // console.log("token",token);

        if(!token){
            return res.status(401).json({
                message:"Access denied, token missing",
                error:true,
                sucess:false
            })
        }
        const decode= await jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
        
        if(!decode){
            return res.status(401).json({
                message:"Unauthorized access",
                error:true,
                sucess:false
            })
        }
        
        req.userId = decode.id;
        next(); 


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false
        })
    }
}

export default auth;