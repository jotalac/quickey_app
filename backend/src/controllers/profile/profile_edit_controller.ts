import { Request, Response } from "express"
import { IUser } from "../../@types/user"
import User from "../../models/user_model"

const editUsername = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        const {newUsername} = req.body

        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        } 
        //check if new username is valid
        if (!await newNameValid(newUsername.trim())) {
            res.status(400).json({status: "error", msg: "New username not valid"})
            return
        }

        await User.updateOne({_id: user._id}, {username: newUsername.trim()})

        res.status(200).json({status: "success", msg: "Username updated"})


    } catch (error) {
        res.status(500).json({status: "error", msg: "Error saving new name"})

    }
}

const editBio = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        const {newBio} = req.body

        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        } 

        if (!newBio) {
            res.status(400).json({status: "error", msg: "Bio text not provided"})
            return 
        }
        //check if new username is valid
        if (newBio.length > 1000) {
            res.status(400).json({status: "error", msg: "Bio text too long"})
            return
        }

        await User.updateOne({_id: user._id}, {bio: newBio.trim()})

        res.status(200).json({status: "success", msg: "Bio updated"})


    } catch (error) {
        res.status(500).json({status: "error", msg: "Error editing bio"})

    }
}

const newNameValid = async (newName: string) => {
    if (newName.length < 3 || newName.length > 20) return false

    const existsUser = await User.findByUsername(newName)
    if (existsUser) return false
    return true
}

export {editUsername, editBio}