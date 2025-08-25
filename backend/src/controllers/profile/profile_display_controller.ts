import { Request, Response } from "express"
import { IUser } from "../../@types/user"
import User from "../../models/user_model"
import KeyBinding from "../../models/keybinding_model"
import Like from "../../models/like_model"
import AiGenKeybindingModel from "../../models/ai_generation_keybinding_model"

const getAccountData = async (req: Request, res: Response) => {    
    try {
        const userId = (req.user as IUser)._id

        if (!userId) {
            res.status(401).json({status: "error", msg: "User unauthorized"})
            return
        }
        
        const accountData = await User.findById(userId).select("username email role bio createdAt socialLinks profilePicture")
        if (!accountData) {
            res.status(401).json({status: "error", msg: "User not found"})
            return
        }

        if (accountData.profilePicture) {
            accountData.profilePicture = `${process.env.APP_URL}/uploads/profile/${accountData.profilePicture}`
        }
        
        res.status(200).json({
            status: "success",
            data: accountData
        })


    } catch (error) {
        res.status(500).json({status: "error", msg: "Failed to load account data"})
    }
}

const getBindingStats = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as IUser)._id

        if (!userId) {
            res.status(401).json({status: "error", msg: "User unauthorized"})
            return
        }

        const [totalCount, likedCount, sharedCount] = await Promise.all([
            KeyBinding.countDocuments({userId}),
            Like.countDocuments({userId}),
            KeyBinding.countDocuments({userId: userId, public: true})
        ])

        res.status(200).json({
            status: "success",
            data: {totalCount, likedCount, sharedCount} 
        })


    } catch (error) {
        res.status(500).json({status: "error", msg: "Failed to get keybinding data"})
    }
}

const getAiGenData = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as IUser)._id

        if (!userId) {
            res.status(401).json({status: "error", msg: "User unauthorized"})
            return
        }

        const aiGenHistroyData = await AiGenKeybindingModel.find({userId: userId})
            .select("prompt createdAt generatedNodes")
            .sort({createdAt: "desc"})

        res.status(200).json({
            status: "success",
            data: aiGenHistroyData
        })

    } catch (error) {
        res.status(500).json({status: "error", msg: "Error getting ai generation history data"})
    }
}

export {getAccountData, getBindingStats, getAiGenData}