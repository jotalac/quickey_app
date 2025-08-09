import { NextFunction, Request, Response } from "express"
import { IUser } from "../../@types/user"
import AiGenerationKeybinding from "../../models/ai_generation_keybinding_model"

const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '10', 10)

const aiKeybindingGenerationLimit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as IUser
        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        }

        // const dateLastDay = new Date(Date.now() - 1000 * 60 * 60 * 24)
        // getting all records for user, assume that the old ones are deleted 
        const usedNumber = await AiGenerationKeybinding.countDocuments({userId: user._id})

        if (usedNumber >= DAILY_LIMIT) {
            const minutesUntilNext = getTimeRemaining(user._id)
            res.status(429).json({status: "error", msg: "AI generation daily limit reached", availibleIn: minutesUntilNext})
            return
        }

        (req as any).aiUsage = {used: usedNumber, remaining: DAILY_LIMIT - usedNumber - 1}
        next()
    } catch (error) {
        res.status(500).json({status: "error", msg: "Error validating daily limit"})
    }
}


//helper functions
const getTimeRemaining = async (userId: string) => {
    try {
        const oldestRecord = await AiGenerationKeybinding.findOne({userId: userId})
        .sort({createdAt: 'asc'})
        .select('createdAt')
        .lean()

        let minutesUntilNext = null

        if (oldestRecord?.createdAt) {
            const nextFree = new Date(oldestRecord.createdAt).getTime() + 24 * 60 * 60 * 1000
            const msLeft = nextFree - Date.now()
            minutesUntilNext = Math.ceil(msLeft / 1000 * 60)
        }

        return minutesUntilNext
        
        
    } catch (error) {   
        return null
    }

}

export {aiKeybindingGenerationLimit, getTimeRemaining}