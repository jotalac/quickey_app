import express from "express";
import { aiGenerateKeybinding, aiGenerateKeybindingTesting, getAiLimits } from "../controllers/ai_generation/ai_keybinding_generate_controller";
import { authenticateToken } from "../middleware/auth_middleware";
import { aiKeybindingGenerationLimit } from "../middleware/ai_generation/ai_limit_middleware";

const router = express.Router()

router.post("/keybinding-generate", authenticateToken, aiKeybindingGenerationLimit, aiGenerateKeybinding)
router.post("/keybinding-generate-test", aiGenerateKeybindingTesting)

router.get("/get-generation-limits", authenticateToken, getAiLimits)

export default router