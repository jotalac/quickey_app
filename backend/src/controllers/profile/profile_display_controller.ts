import { Request, Response } from "express"
import { IUser } from "../../@types/user"
import User from "../../models/user_model"

const getAccountData = async (req: Request, res: Response) => {    
    try {
        const userId = (req.user as IUser).id

        if (!userId) {
            res.status(401).json({status: "error", msg: "User unauthorized"})
            return
        }
        
        const accountData = await User.findById(userId).select("username email role bio createdAt socialLinks")
        if (!accountData) {
            res.status(401).json({status: "error", msg: "User not found"})
            return
        }
        
        res.status(200).json({
            status: "success",
            data: accountData
        })


    } catch (error) {
        res.status(500).json({status: "error", msg: "Failed to load account data"})
    }
}

export {getAccountData}