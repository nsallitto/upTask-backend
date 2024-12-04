import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

//Declaramos el usuario en el req
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('No Autorizado')
        return res.status(401).json({error: error.message})
    }
    //Separamos el JWT del Bearer
    const token = bearer.split(" ")[1]

    //Verificamos el JWT
    try {
        const decoded = jwt.verify(token, process.env.PRIVATE_KEY_JWT)

        //Buscamos el Usuario segun el id del JWT
        if (typeof decoded === "object" && decoded.id) {
            const user = await User.findById(decoded.id).select('id userName email')
            if (user) {
                req.user = user
                next()
            } else {
                res.status(500).json({error: 'El Usuario no existe'})
            }
        }
    } catch (error) {
        res.status(500).json({error: 'Token no válido'})
    }
}