import {Router} from 'express';
import { registerUserController, verifyEmailController, loginController, logoutController, uploadAvatar, updateUserDetails, forgotPassword, verifyForgotPasswordOtp, resetPassword, refressToken } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const userRouter = Router();

userRouter.post("/register", registerUserController)
userRouter.post("/verfy-email", verifyEmailController)
userRouter.post("/login", loginController)
userRouter.get("/logout",auth, logoutController)
userRouter.put("/upload-avatar", auth, upload.single('avatar'), uploadAvatar)
userRouter.put("/update-user", auth, updateUserDetails)
userRouter.put("/forgot-password", forgotPassword)
userRouter.put("/verify-forgot-password-otp", verifyForgotPasswordOtp)
userRouter.put("/reset-password",resetPassword)
userRouter.post("/refresh-token", refressToken)

export default userRouter; 