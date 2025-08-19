import { Router } from "express";
import { authenticateToken } from "../middleware/auth_middleware";
import { getAccountData } from "../controllers/profile/profile_display_controller";

const router = Router()

router.get("/get-account-data", authenticateToken, getAccountData)


export default router