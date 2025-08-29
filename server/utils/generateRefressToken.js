import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateRefressToken = async(userId)=>{
    const token =await jwt.sign(
            {id:userId},
            process.env.SECRET_KEY_REFRESS_TOKEN,
            { expiresIn:'7d'}
        )
        const updateRefressToken = await UserModel.updateOne(
            {_id:userId},
            {refresh_token:token}
        )
        if(!updateRefressToken.acknowledged){
            throw new Error("Unable to update refress token");
        }
        return token;
}

export default generateRefressToken;