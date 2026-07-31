import { Router } from 'express';
import { celebrate } from 'celebrate';
import { loginUser, logoutUser, refreshUserSession, registerUser, requestResetEmail, requestResetPassword } from '../controllers/authController.js';
import { loginUserSchema, registerUserSchema } from '../validations/authValidation.js';
import { requestResetEmailSchema, requestResetPasswordSchema } from '../validations/authValidation.js';

const router = Router();


router.post("/auth/register", celebrate(registerUserSchema), registerUser)
router.post("/auth/login", celebrate(loginUserSchema), loginUser)
router.post("/auth/logout", logoutUser)
router.post("/auth/refresh", refreshUserSession)
router.post("/auth/request-reset-email", celebrate(requestResetEmailSchema), requestResetEmail )
router.post("/auth/request-reset-password", celebrate(requestResetPasswordSchema), requestResetPassword )



export default router;
