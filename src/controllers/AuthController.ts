import { type Request, type Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import Token from "../models/Token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {

    //CREAR USUARIO
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body
            const userExists = await User.findOne({email}) //--> chequeamos que el usuario exista
            if (userExists) {
                const error = new Error("Ya existe un usuario con este E-mail")
                return res.status(409).json({error: error.message})
            }

            //CREAMOS EL USUARIO
            const user = new User(req.body)

            //HASHEAMOS PASSWORD
            user.password =  await hashPassword(password)

            //GENERAMOS TOKEN
            const token  = new Token
            token.token = generateToken() 
            token.user = user.id

            //ENVIAMOS E-MAIL
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                user: user.userName,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()]) //--> almacenamos el usuario en la DB 
            res.send("Cuenta creada, revisa tu email para confirmarla")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //CONFIRMAR USUARIO
    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body
            const tokenExists = await Token.findOne({ token })
            if (!tokenExists) {
                const error = new Error("Token no valido")
                return res.status(404).json({ error: error.message })
            }
            // BUSCAMOS EL USUARIO QUE TIENE ESE TOKEN
            const user = await User.findOne(tokenExists.user)
            user.confirmed = true

            //GUARDAMOS LA CONFIRMACION DEL USUARIO Y BORRAMOS TOKEN
            await Promise.allSettled([ user.save(), tokenExists.deleteOne() ])
            res.send('Usuario confirmado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //LOGIN USUARIO
    static login = async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body

            // REVISAMOS QUE EL TENGAMOS UN USUARIO CON ESE EMAIL
            const user = await User.findOne({email})
            if (!user) {
                const error = new Error("No hay ningun usuario con ese E-mail")
                return res.status(404).json({ error: error.message})
            }

            // REVISAMOS SI EL USUARIO ESTA CONFIRMADO
            if (!user.confirmed) {
                // generamos un nuevo token
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()
                
                // enviamos un e-mail de confirmacion
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    user: user.userName,
                    token: token.token
                })
                const error = new Error("La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmacion")
                return res.status(401).json({ error: error.message})
            }

            // REVISAMOS PASSWORD
            const isPasswordCorrect = await checkPassword(password, user.password)
            if (!isPasswordCorrect) {
                const error = new Error("El password es incorrecto")
                return res.status(401).json({ error: error.message})
            }

            // GENERAMOS UN JWT
            const token = generateJWT({id: user.id})

            res.send(token)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //REENVIAR TOKEN CONFIRMACION
    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Confirmamos si el usuario esta registrado
            const user = await User.findOne({email})
            if (!user) {
                const error = new Error("El usuario no esta registrado")
                return res.status(404).json({error: error.message})
            }

            //Confirmamos si el usuario ya esta confirmado
            if (user.confirmed) {
                const error = new Error("El usuario ya esta confirmado")
                return res.status(403).json({error: error.message})
            }

            //Generamos un nuevo token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            
            //Enviamos Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                user: user.userName,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send("Se envió un nuevo codigo de confirmación a tu Email")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //REESTABLECEMOS EL PASSWORD
    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            //Validamos que el usuario exista
            const user = await User.findOne({email})
            if (!user) {
                const error = new Error("El usuario no esta registrado")
                return res.status(404).json({error: error.message})
            }

            //Generamos un token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            //Enviamos un email de validacion
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                user: user.userName,
                token: token.token
            })
            res.send("Revisa tu email para reestablecer tu password")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //VALIDAMOS TOKEN PARA CAMBIO DE PASSWORD
    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            //VALIDAMOS SI EL TOKEN EXISTE 
            const tokenExists = await Token.findOne({token})
            if (!tokenExists) {
                const error = new Error("Token no valido")
                return res.status(404).json({ error: error.message })
            }
            res.send("Token válido, define tu nuevo Password")
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //SELECCIONAMOS LA NUEVA CONTRASEÑA
    static updatePassword = async (req: Request, res: Response) => {
        try {
            const { token } = req.params
            const { password } = req.body
            //VALIDAMOS SI EL TOKEN EXISTE
            const tokenExists = await Token.findOne( {token} )
            if (!tokenExists) {
                const error = new Error("Token no valido")
                return res.status(404).json({ error: error.message })
            }
            //BUSCAMOS QUE USUARIO TIENE ESE TOKEN
            const user = await User.findOne(tokenExists.user)
            user.password = await hashPassword(password)
            res.send("Tu Password se modifico correctamente")
            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    //PERFIL USUARIO
    static user = async (req: Request, res: Response) => {
        return res.json(req.user)
    }

    //ACTUALIZAR PERFIL
    static updateProfile = async (req: Request, res: Response) => {
        const { userName, email } = req.body

        const userExists = await User.findOne({email})
        if (userExists && req.user.id.toString() !== userExists.id.toString()) {
            const error = new Error("Ese email ya esta registrado")
            return res.status(409).json({error: error.message})
        }
        
        req.user.email = email
        req.user.userName = userName

        try {
            await req.user.save()
            res.send("Perfil actualizado correctamente")
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
        
    }

    //CAMBIAR LA CONTRASEÑA
    static changeCurrentPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body
        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error("Contraseña Incorrecta")
            return res.status(401).json({error: error.message})
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send("La contraseña se modificó correctamente")
        } catch (error) {
            res.status(500).json({error: "Hubo un error"})
        }
    }

    //CHEQUEAMOS EL PASSWORD ANTES DE BORRAR PROYECTOS
    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body
        const user = await User.findById(req.user.id)

        const isPasswordCorrect = await checkPassword(password, user.password)
        if (!isPasswordCorrect) {
            const error = new Error("Contraseña incorrecta")
            return res.status(401).json({error: error.message})
        }
        res.send("Contraseña correcta")
    }
}