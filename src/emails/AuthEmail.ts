import { transporter } from "../config/nodemailer"
import dotenv from "dotenv"

dotenv.config()

interface IEmail {
    email: string
    user: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Confirma tu cuenta',
            text: 'UpTask - Confirma tu cuenta',
            html: `
                <p>Hola: ${user.user}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
                <p>Visita el siguiente enlace: </p>
                <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                <p>E ingresa el codigo: <b>${user.token}</b> </p>
                <p>Este token expira en 10 minutos</p>
            `
        })
    }
    static sendPasswordResetToken = async (user: IEmail) => {
        await transporter.sendMail({
            from: 'UpTask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Reestablece tu password',
            text: 'UpTask - Reestablece tu password',
            html: `
                <p>Hola: ${user.user}, has solicitado reestablecer tu password</p>
                <p>Visita el siguiente enlace: </p>
                <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer password</a>
                <p>E ingresa el codigo: <b>${user.token}</b> </p>
                <p>Este token expira en 10 minutos</p>
            `
        })
    }
}
