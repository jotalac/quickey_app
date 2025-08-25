import mongoose, { Schema } from "mongoose"

export interface IPasswordReset extends Document {
    userId: mongoose.Types.ObjectId,
    resetToken: string,
    createdAt: Date,}

const passwordResetSchema = new Schema<IPasswordReset>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    resetToken: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1000 * 60 * 10 //10 minutes
    },
})

// Index for efficient cleanup and lookup
passwordResetSchema.index({ userId: 1 })

const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema)

export default PasswordReset