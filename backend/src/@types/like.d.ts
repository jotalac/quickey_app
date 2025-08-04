import { Document } from "mongoose";

export interface ILike extends Document {
    userId: ObjectId;
    keyBindingId: ObjectId;
    createdAt: Date
}

export interface ILikeModel extends Model<ILike> {
    hasUserLiked(userId: string, keyBindingId: string): Promise<boolean>;
}