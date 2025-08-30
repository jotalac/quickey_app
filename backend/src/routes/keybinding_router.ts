import express from "express"
import { getCategories, saveKeyBinding } from "../controllers/keybinding/save_keybinding_controller"
import { authenticateToken } from "../middleware/auth_middleware"
import {deleteSave, getBindingUser, getDescription, updateSave, verfiyBindingName} from "../controllers/keybinding/keybinding_user_controller"
import { keyBindingSaveLimiter, keyBindingUpdateLimiter } from "../middleware/rate_limiter"
import { likeSave, unlikeSave } from "../controllers/keybinding/like_keybinding_controller"
import { getBindingDiscover, getHotKeybindings } from "../controllers/keybinding/keybinding_discover_controller"

const router = express.Router()

router.post("/validate-name", authenticateToken, verfiyBindingName)

router.post("/save", authenticateToken, keyBindingSaveLimiter, saveKeyBinding)

router.get("/get-categories", getCategories)

router.get("/get-user-binding", authenticateToken, getBindingUser)

router.get("/:saveId/get-description", authenticateToken, getDescription)

router.patch("/:saveId/update", authenticateToken, keyBindingUpdateLimiter, updateSave)

router.delete("/:saveId/delete", authenticateToken, deleteSave)

//discover page
router.get("/get-discover-binding", getBindingDiscover)

router.get("/get-hot-binding", getHotKeybindings)

//like and unlike post
router.post("/:saveId/like", authenticateToken, likeSave)

router.delete("/:saveId/unlike", authenticateToken, unlikeSave)

export default router