import express from "express"
import { verifyToken } from "../controllers/auth/jwt_controller"
import { getCategories, saveKeyBinding } from "../controllers/keybinding/save_keybinding_controller"
import { authenticateToken } from "../middleware/auth_middleware"
import {getBindingUser, getDescription, verfiyBindingName} from "../controllers/keybinding/keybinding_user_controller"
import { keyBindingSaveLimiter } from "../middleware/rate_limiter"
import { likeSave, unlikeSave } from "../controllers/keybinding/like_keybinding_controller"

const router = express.Router()

router.post("/validate-name", authenticateToken, verfiyBindingName)

router.post("/save", authenticateToken, keyBindingSaveLimiter ,saveKeyBinding)

router.get("/get-categories", getCategories)

router.get("/get-user-binding", authenticateToken, getBindingUser)

router.get("/:saveId/get-description", authenticateToken, getDescription)

//like and unlike post
router.post("/:saveId/like", authenticateToken, likeSave)

router.delete("/:saveId/unlike", authenticateToken, unlikeSave)

export default router