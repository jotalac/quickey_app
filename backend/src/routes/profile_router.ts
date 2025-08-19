import { Router } from "express";
import { authenticateToken } from "../middleware/auth_middleware";
import { getAccountData, getBindingStats } from "../controllers/profile/profile_display_controller";

const router = Router()

router.get("/get-account-data", authenticateToken, getAccountData)

router.get("/get-binding-stats", authenticateToken, getBindingStats)



export default router