import { Router } from "express";
import checkAccessToken from "../../middleware/checkAccessToken.js";
import {
  currentUserRouter,
  upgradeToCompanyRouter,
  getAllUserRouter,
  getUserByIdRouter,
  editUserByIdRouter,
} from "../../controllers/userController.js";


const router = Router();

router.get("/current-user", checkAccessToken, currentUserRouter);
router.patch("/upgrade-to-company", checkAccessToken, upgradeToCompanyRouter);
router.get("/fetch", checkAccessToken, getAllUserRouter);
router.get("/fetch-by-Id/:id", checkAccessToken, getUserByIdRouter);
router.put("/editUser/:id", checkAccessToken, editUserByIdRouter);

export default router;
