import { Request, Response } from "express"
import { IUser } from "../../@types/user"
import { v4 as uuidv4 } from "uuid"
import PasswordReset from "../../models/password_change_model"
import emailService from "../../utils/emailService"
import { passwordValid } from "../../middleware/validate_register_form"
import bcrypt from "bcrypt"
import User from "../../models/user_model"

const passwordChangeRequest = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        
        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        }

        // Check if user is registered with SSO
        if (user.registerType === 'sso') {
            res.status(400).json({
                status: "error", 
                msg: "Cannot change password for Google account users"
            })
            return
        }

        // Delete any existing password reset requests for this user
        await PasswordReset.deleteMany({ userId: user._id })

        const resetToken = uuidv4()

        await PasswordReset.create({userId: user._id, resetToken: resetToken})
        
        const emailSend = await emailService.sendPasswordResetEmail(user.email, user.username, resetToken)

        if (emailSend) {
            res.status(200).json({status: "success", msg: "Password reset link sent to your email"})
        } else {
            res.status(500).json({status: "error", msg: "Failed to send reset email"})
        }
    } catch (error) {
        res.status(500).json({status: "error", msg: "Error requesting password change"})
    }
}

const verifyPasswordResetToken = async (req: Request, res: Response) => {
    try {
        const {token} = req.body

        if (!token) {
            res.status(400).json({status: "error", msg: "Token not provided"})
            return
        }
        
        const passwordReset = await PasswordReset.findOne({ resetToken: token }).populate('userId', 'email')
        if (!passwordReset) {
            res.status(200).json({status: "success", valid: false, msg: "Invalid token provided"})
            return
        }

        const user = passwordReset.userId as any

        res.status(200).json({status: "success", valid: true, email: user.email})

    } catch (error) {
        res.status(500).json({status: "error", msg: "Error verifying token"})
    }
}

const changePassword = async (req: Request, res: Response) => {
    try {
        const {token, newPassword} = req.body

        if (!token) {
            res.status(400).json({status: "error", msg: "Token not provided"})
            return
        }

        const passwordReset = await PasswordReset.findOne({ resetToken: token })
        if (!passwordReset) {
            res.status(400).json({status: "error", msg: "Invalid token provided"})
            return 
        }
        
        if (!passwordValid(newPassword)) {
            res.status(400).json({status: "error", msg: "Password doesn't meet the requierements"})
            return
        }

        //create hash
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        //save it to the user
        await User.updateOne({_id: passwordReset?.userId}, {password: hashedPassword})

        //delete the password change request
        await PasswordReset.deleteOne({resetToken: token})

        res.status(200).json({status: "success", msg: "Password changed successfully"})

    } catch (error) {
        res.status(500).json({status: "error", msg: "Error changing password"})
    }
}

//helper functions
const tokenValid = async (token: string): Promise<boolean> => {
    const passwordReset = await PasswordReset.findOne({ resetToken: token })
    
    if (!passwordReset) {
        return false
    }
    return true
}


export {passwordChangeRequest, verifyPasswordResetToken, changePassword}