import { Request , Response} from "express";
import { IUser } from "../../@types/user"
import Like from "../../models/like_model";
import mongoose from "mongoose";


const likeSave = async (req: Request, res: Response ) => {
    const user = req.user as IUser
    const {saveId} = req.params

    try {
        //check if user has already like on the keybinding
        const exists = await Like.findOne({userId: user._id, keyBindingId: saveId})
        if (exists) {
            res.status(200).json({status: "success"}) 
            return
        }

        await Like.create({
                userId: new mongoose.Types.ObjectId(user._id),
                keyBindingId: new mongoose.Types.ObjectId(saveId)
        })

        res.status(200).json({status: "success"})
    } catch (error) {
        console.log(error)
        res.status(500).json({status: "error"})
    }
}

const unlikeSave = async (req: Request, res: Response) => {
    const user = req.user as IUser
    const {saveId} = req.params
    
    try {
        await Like.deleteOne({userId: user._id, keyBindingId: saveId})

        res.status(200).json({status: "success"})
    } catch (error) {
        res.status(500).json({status: "error"})
    }
}

export {likeSave, unlikeSave}