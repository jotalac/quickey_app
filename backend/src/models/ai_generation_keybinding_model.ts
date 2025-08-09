import { IAiGenerationKeybinding } from "../@types/ai_keybinding_generation";
import mongoose, { Schema, Types, Document } from 'mongoose'

const AiGenerationKeybindingSchema = new Schema<IAiGenerationKeybinding>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    prompt: {type: String, required: true},
    model: {type: String, required: true},
    generatedNodes: { type: [String], required: true},
    createdAt: {type: Date, default: Date.now, expires: 60 * 60 * 24} //delete after 24 hours
})

// Efficient quota counting (user + time range)
AiGenerationKeybindingSchema.index({ userId: 1, createdAt: 1 })

export default mongoose.model<IAiGenerationKeybinding>('AiGenerationKeybinding', AiGenerationKeybindingSchema)