import express from "express";
import { aiGenerateKeybinding } from "../controllers/ai_generation/ai_keybinding_generate_model";

const router = express.Router()

router.post("/keybinding-generate", aiGenerateKeybinding)


export default router