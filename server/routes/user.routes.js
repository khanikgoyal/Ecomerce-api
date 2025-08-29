import {Router} from 'express';
import { registerUserController, verifyEmailController, loginController, logoutController, uploadAvatar } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';

const userRouter = Router();

userRouter.post("/register", registerUserController)
userRouter.post("/verfy-email", verifyEmailController)
userRouter.post("/login", loginController)
userRouter.get("/logout",auth, logoutController)
userRouter.put("/upload-avatar", auth, upload.single('avatar'), uploadAvatar)

export default userRouter; 