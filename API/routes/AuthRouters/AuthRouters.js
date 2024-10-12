import { Router } from "express";
import checkRefreshToken from "../../middleware/checkRefreshToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js";

import {
  loginRouter,
  signupRouter,
  refreshTokenRouter,
  sendResetLinkRouter,
  resetPasswordRouter,
  verifyEmailRouter,
  resetPasswordFormRouter,
} from "../../controllers/authController.js";

const router = Router();

router.post("/login", loginRouter);
router.post("/signup",checkRequiredFields(["nickname", "email", "password"]),signupRouter);
router.post("/refresh-token", checkRefreshToken, refreshTokenRouter);

// Rota para enviar o link de redefinição
router.post("/send-reset-link", sendResetLinkRouter);

// Rota para renderizar o formulário de redefinição de senha
router.get("/reset-password-form/:token", resetPasswordFormRouter);

// Rota para redefinir a senha usando o token
router.post("/reset-password/:token", resetPasswordRouter);


///
router.get("/verify-email/:token", verifyEmailRouter);


export default router;
