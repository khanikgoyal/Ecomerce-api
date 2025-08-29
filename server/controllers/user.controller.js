import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import verifyEmailtemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefressToken from "../utils/generateRefressToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

// Register user controller starts here
export async function registerUserController(req, res){
    try {
        const {name, email, password}=req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                message:"Please provide all required fields",
                error:true,
                sucess:false
            })
        }

        const user = await UserModel.findOne({email})
        if(user){
            return res.json({
                message:"User already exists",
                error:true,
                sucess:false
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const payload ={
            name,
            email,
            password:hashedPassword
        }

        const newUser = new UserModel(payload);
        const save = await newUser.save();

        const verifyEmailUrl=`${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`;

        const verifyEmail = await sendEmail({
            send_to:email,
            subject:"Verify email from myCart",
            html : verifyEmailtemplate({
                name,
                url: verifyEmailUrl
            })
        })

        return res.json({
            message:"User registered successfully, please check your email to verify", 
            error:false,
            sucess:true,
            data:save,
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message||error,
            error:true,
            sucess:false,
        })
    }
}
// Register user controller ends here

// Verifing email controller starts here
export async function verifyEmailController(req, res){
    try {
        const {code} = req.body

        const user = await  UserModel.findOne({_id: code})

        if(!user){
            return res.status(400).json({
                message: "Invalid code",
                error: true,
                sucess: false
            })
        }

        const updateUser = await UserModel.updateOne({_id:code},{
            verify_email:true
        })

        return res.json({
            message:"Email verified successfully",
            error:false,
            sucess:true,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false

        })
    }
}
// Verifing email controller ends here

// login controller starts here
export async function loginController(req, res){
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message:"Please provide all required fields",
                error:true,
                sucess:false
            })
        }

        const user = await UserModel.findOne({ email });
        if(!user){
            return res.status(400).json({
                message: "User does not exist",
                error:true,
                sucess:false
            })
        }

        if(user.status !== "Active"){
            return res.status(400).json({
                message: `Your account is ${user.status}, please contact support`,
                error:true,
                sucess:false
            })
        }

        const checkpassword = await bcrypt.compare(password, user.password);
        if(!checkpassword){
            return res.status(400).json({
                message: "Invalid credentials",
                error:true,
                sucess:false
            })
        }

        const accessToken = await generateAccessToken(user._id);
        const refreshToken = await generateRefressToken(user._id);

        const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.cookie("accessToken", accessToken, cookiesOption) 
        res.cookie("refreshToken", refreshToken, cookiesOption)
        return res.status(200).json({
            message:"Login successful",
            error:false,
            sucess:true,
            data:{
                accessToken,
                refreshToken
            }
        })

    }catch(error){
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false
        })
    }
}
// login controller ends here

// Logout controller starts here
export async function logoutController(req, res){
    try {
        const userId= req.userId; // this userId coming from auth middleware
    
        const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.clearCookie("accessToken", cookiesOption)
        res.clearCookie("refreshToken", cookiesOption)

        const removeRefressToken = await UserModel.findByIdAndUpdate(userId,{
            refresh_token:""
        })
        return res.status(200).json({
            message:"Logout successful",
            error:false,
            sucess:true,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message||error,
            error:true,
            sucess:false
        })
    }
}
// Logout controller ends here

//Cloudinary image upload controller starts here
export async function uploadAvatar(req, res){
    try {
        const image = req.file;
        const userId = req.userId;
        const upload = await uploadImageCloudinary(image);

        const user = await UserModel.findByIdAndUpdate(userId,{
            avatar:upload.url
        })


        return res.status(200).json({
            message:"Image uploaded successfully",
            error:false,
            sucess:true,
            data:{
                _id: userId,
                avatar:upload.url
            }
        })

        // console.log(image)
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false
        })
    }
}
//Cloudinary image upload controller ends here

