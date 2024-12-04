import { Router } from "express";
import { body, param } from "express-validator"
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validacion";
import { authenticate } from "../middleware/auth";

const router = Router()

router.post('/create-account',
    body("userName").notEmpty().withMessage("El nombre del usuario no puede ir vacio"),
    body("password").isLength({min: 8}).withMessage("El password debe tener al menos 8 caracteres"),
    body("password_confirmation").custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Los passwords no son iguales")
        }
        return true
    }),
    body("email").isEmail().withMessage("E-mail no válido"),
    
    handleInputErrors,
    AuthController.createAccount)

router.post('/confirm-account',
    body("token").notEmpty().withMessage("El Token no puede ir vacio"),

    handleInputErrors,
    AuthController.confirmAccount
)

router.post('/login',
    body("email").isEmail().withMessage("Email no válido"),
    body("password").notEmpty().withMessage("El password no puede ir vacío"),

    handleInputErrors,
    AuthController.login
)

router.post('/request-code',
    body('email').isEmail().withMessage("Email no válido"),

    handleInputErrors,
    AuthController.requestConfirmationCode
)

router.post('/forgot-password',
    body('email').isEmail().withMessage("Email no válido"),

    handleInputErrors,
    AuthController.forgotPassword
)

router.post('/validate-token',
    body('token').notEmpty().withMessage("El Token no puede ir vacio"),

    handleInputErrors,
    AuthController.validateToken
)

router.post('/update-password/:token',
    param("token").isNumeric().withMessage("Token no válido"),
    body("password").isLength({min: 8}).withMessage("El password debe tener al menos 8 caracteres"),
    body("password_confirmation").custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Los passwords no son iguales")
        }
        return true
    }),
    
    handleInputErrors,
    AuthController.updatePassword
)

router.get('/user',
    authenticate,
    
    AuthController.user
)
/** RUTAS PROFILE */

router.put('/profile',
    authenticate,

    body('email').isEmail().withMessage("Email no válido"),
    body("userName").notEmpty().withMessage("El nombre del usuario no puede ir vacio"),

    handleInputErrors,
    AuthController.updateProfile
)

router.post('/profile/change-password',
    authenticate,
    body("current_password").notEmpty().withMessage("La contraseña no puede ir vacia"),
    body("password").isLength({min: 8}).withMessage("El password debe tener al menos 8 caracteres"),
    body("password_confirmation").custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Los passwords no son iguales")
        }
        return true
    }),

    handleInputErrors,
    AuthController.changeCurrentPassword
)

router.post('/check-password',
    authenticate,
    body("password").notEmpty().withMessage("El password no puede ir vacio"),

    handleInputErrors,
    AuthController.checkPassword
)

export default router;