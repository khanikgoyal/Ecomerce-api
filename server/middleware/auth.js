const auth =(req,res,next)=>{
    try {
        
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false
        })
    }
}