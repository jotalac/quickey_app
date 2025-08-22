import { Router } from "express";
import { authenticateToken } from "../middleware/auth_middleware";
import { getAccountData, getAiGenData, getBindingStats } from "../controllers/profile/profile_display_controller";
import { editBio, editSocialMediaLinks, editUsername, saveNewProfilePicture } from "../controllers/profile/profile_edit_controller";
import { profilePicUploadMiddleware } from "../middleware/image_upload_middleware";

const router = Router()

router.get("/get-account-data", authenticateToken, getAccountData)

router.get("/get-binding-stats", authenticateToken, getBindingStats)

router.get("/get-ai-gen-data", authenticateToken, getAiGenData)

//profile edit
router.patch("/edit/username", authenticateToken, editUsername)

router.patch("/edit/bio", authenticateToken, editBio)

router.patch("/edit/social-media-links", authenticateToken, editSocialMediaLinks)

router.post("/edit/profile-picture", authenticateToken, profilePicUploadMiddleware, saveNewProfilePicture)

export default router