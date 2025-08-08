import { ObjectId, Document } from "mongoose";

export interface IAiGenerationKeybinding extends Document {
    userId: ObjectId
    prompt: string,
    model: string,
    generatedNodes: string[]
    createdAt: Date
}