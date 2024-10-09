import { Router } from "express";
import checkRefreshToken from "../../middleware/checkRefreshToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js";

import {
  loginRouter,
  signupRouter,
  refreshTokenRouter,
  forgotPasswordRouter,
  resetPasswordRouter,
  confirmEmailRouter,
  emailVerificationResultRouter,
} from "../../controllers/authController.js";

const router = Router();

router.post("/login", loginRouter);
router.post("/signup",checkRequiredFields(["nickname", "email", "password"]),signupRouter); 
router.post("/refresh-token", checkRefreshToken, refreshTokenRouter);
router.post("/forgot-password", forgotPasswordRouter);
router.post("/reset-password/:token", resetPasswordRouter);
router.patch("/confirm-email/:token", confirmEmailRouter);
router.get("/email-verification-result/:id", emailVerificationResultRouter);

export default router;
