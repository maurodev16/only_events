import { Router } from "express";
import checkRefreshToken from "../../middleware/checkRefreshToken.js";
import checkRequiredFields from "../../middleware/checkRequiredFields.js";

import {
  loginRouter,
  signupRouter,
  refreshTokenRouter,
  sendResetLinkRouter,
  resetPasswordRouter,
  confirmEmailRouter,
  emailVerificationResultRouter,
} from "../../controllers/authController.js";

const router = Router();

router.post("/login", loginRouter);
router.post("/signup",checkRequiredFields(["nickname", "email", "password"]),signupRouter); 
router.post("/refresh-token", checkRefreshToken, refreshTokenRouter);
router.post("/send-reset-link", sendResetLinkRouter);
router.post("/reset-password/:token", resetPasswordRouter);
router.patch("/confirm-email/:token", confirmEmailRouter);
router.get("/email-verification-result/:id", emailVerificationResultRouter);

export default router;
