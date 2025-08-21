import { Router } from "express";
import { authenticateToken } from "../middleware/auth_middleware";
import { getAccountData, getAiGenData, getBindingStats } from "../controllers/profile/profile_display_controller";
import { editBio, editUsername } from "../controllers/profile/profile_edit_controller";

const router = Router()

router.get("/get-account-data", authenticateToken, getAccountData)

router.get("/get-binding-stats", authenticateToken, getBindingStats)

router.get("/get-ai-gen-data", authenticateToken, getAiGenData)

//profile edit
router.patch("/edit/username", authenticateToken, editUsername)
router.patch("/edit/bio", authenticateToken, editBio)

export default router