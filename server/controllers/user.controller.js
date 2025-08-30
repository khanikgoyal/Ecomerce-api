import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import verifyEmailtemplate from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefressToken from "../utils/generateRefressToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOtp from "../utils/generateOtp.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import jwt from "jsonwebtoken";

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

//update user details controller starts here
export async function updateUserDetails(req, res){
    try {
        const userId = req.userId;
        const {name, email, mobile, password} = req.body;

        if(password){
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }
        
        const updateUser = await UserModel.updateOne({_id:userId}, {
            ...(name && {name:name}),
            ...(email && {email:email}),
            ...(mobile && {mobile:mobile}),
            ...(password && {password:hashedPassword}),
        })

        return res.status(200).json({
            message:"User details updated successfully",
            error:false,
            sucess:true,
            data:updateUser      
        })
        
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false
        })
    }
}
//update user details controller ends here

//forgot password controller starts here
export async function forgotPassword(req, res){
    try {
        const {email}= req.body;

        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).json({
                message: "User not available",
                error:true,
                sucess:false
            })
        }

        const otp = generateOtp();
        const expireTime = new Date()+ 60*60*1000; // 

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp: otp,
            forgot_password_expiry: new Date(expireTime).toISOString()
        })

        await sendEmail({
            send_to: email,
            subject: "Password reset OTP from myCart",
            html: forgotPasswordTemplate({name: user.name, otp: otp})
        })

        return res.status(200).json({
            message:"OTP sent to your email, please check",
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
//forgot password controller ends here

//verify otp controller starts here
export async function verifyForgotPasswordOtp(req, res){
    try {
        const {email, otp}=req.body;

        if(!email || !otp){
            return res.status(400).json({
                message: "Please provide all required fields",
                error:true,
                sucess:false
            })
        }
        
        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "User not available",
                error:true,
                sucess:false
            })
        }

        const currentTime = new Date().toISOString();
        if(user.forgot_password_expiry< currentTime){
            return res.status(400).json({
                message: "OTP expired, please try again",
                error:true,
                sucess:false
            })
        }
        if(user.forgot_password_otp !== otp){
            return res.status(400).json({
                message: "Invalid OTP",
                error:true,
                sucess:false
            })
        }

        return res.status(200).json({
            message:"OTP verified successfully, you can now reset your password",
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
//verify otp controller ends here

// Reset password controller starts here
export async function resetPassword(req, res){
    try {
        const {email, newPassword, confirmPassword} = req.body;
        if(!email || !newPassword || !confirmPassword){
            return res.status(400).json({
                message: "Please provide all required fields",
                error:true,
                sucess:false
            })
        }

        const user = await UserModel.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "User not available",
                error:true,
                sucess:false
            })
        }
        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message: "Password and confirm password do not match",
                error:true,
                sucess:false
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatePassword = await UserModel.findByIdAndUpdate(user._id,{
            password: hashedPassword,
        })

        return res.status(200).json({
            message:"Password reset successfully, you can now login with your new password",
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
// Reset password controller ends here

// Refresh token controller starts here
export async function refressToken(req, res){
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];
        if(!refreshToken){
            return res.status(401).json({
                message: "No refress token found, please login",
                error:true,
                sucess:false
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESS_TOKEN)
        // console.log("refressToken", refressToken)
        if(!verifyToken){
            return res.status(401).json({
                message:"Token is expire",
                error:true,
                sucess:false
            })
        }
        const userId= verifyToken?._id;
        const newAccessToken = await generateAccessToken(userId)
        const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        res.cookie("accessToken", newAccessToken, cookiesOption)

        return res.status(200).json({
            message: "New token generated successfuly",
            error:false,
            sucess: true,
            date:{
                accessToken: newAccessToken
            }
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error:true,
            sucess:false
        })
    }
}