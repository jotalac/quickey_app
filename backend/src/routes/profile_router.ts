import { Router } from "express";
import { authenticateToken } from "../middleware/auth_middleware";
import { getAccountData, getAiGenData, getBindingStats } from "../controllers/profile/profile_display_controller";
import { deleteUser, editBio, editSocialMediaLinks, editUsername, saveNewProfilePicture } from "../controllers/profile/profile_edit_controller";
import { profilePicUploadMiddleware } from "../middleware/image_upload_middleware";
import { passwordChangeLimiter, profilePicRateLimiter, usernameChangeRateLimiter } from "../middleware/rate_limiter";
import { changePassword, passwordChangeRequest, verifyPasswordResetToken } from "../controllers/profile/password_change_controller";

const router = Router()

router.get("/get-account-data", authenticateToken, getAccountData)

router.get("/get-binding-stats", authenticateToken, getBindingStats)

router.get("/get-ai-gen-data", authenticateToken, getAiGenData)

//profile edit
router.patch("/edit/username", authenticateToken, usernameChangeRateLimiter, editUsername)

router.patch("/edit/bio", authenticateToken, editBio)

router.patch("/edit/social-media-links", authenticateToken, editSocialMediaLinks)

router.post("/edit/profile-picture", authenticateToken, profilePicRateLimiter, profilePicUploadMiddleware, saveNewProfilePicture)

//profile settings
router.post("/password-change-request", authenticateToken, passwordChangeLimiter, passwordChangeRequest)
router.post("/password-token-verify", verifyPasswordResetToken)
router.patch("/edit/password", changePassword)

router.delete("/delete", authenticateToken, deleteUser)

export default router