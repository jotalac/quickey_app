import mongoose, {Schema, Model, ObjectId, Document} from "mongoose"
import { ILike, ILikeModel } from "../@types/like";

const likeSchema = new Schema<ILike>({
    keyBindingId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "keyBinding",
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
  });

// Enforce uniqueness: one like per user per save.
likeSchema.index({ userId: 1, keyBindingId: 1 }, { unique: true });

likeSchema.index({userId: 1})

//check if specified user 
likeSchema.statics.hasUserLiked = async function (userId: string, keyBindingId: string) {
    const like = await this.findOne({ userId, keyBindingId });
    return !!like; // Returns true if a like exists, false otherwise
};


const Like = mongoose.model<ILike>('Like', likeSchema);

export default Like;