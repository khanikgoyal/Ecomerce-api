import {Router} from 'express';
import { registerUserController, verifyEmailController, loginController } from '../controllers/user.controller.js';

const userRouter = Router();

userRouter.post("/register", registerUserController)
userRouter.post("/verfy-email", verifyEmailController)
userRouter.post("/login", loginController)

export default userRouter; 