import jwt from "jsonwebtoken";
import Types from "mongoose";

type UserPayload = {
    id: Types.ObjectId
}

export const generateJWT = (payload:UserPayload) => {
    const token = jwt.sign(payload, process.env.PRIVATE_KEY_JWT, {
        expiresIn: '180d'
    })

    return token
}