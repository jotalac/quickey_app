import { Request, Response } from "express"
import { IUser } from "../../@types/user"
import User from "../../models/user_model"
import path from "path"
import sharp from "sharp"
import fs from "fs"
import KeyBinding from "../../models/keybinding_model"
import Like from "../../models/like_model"
import PasswordReset from "../../models/password_change_model"

interface socialMediaLink {
    platform: string,
    url: string
}
const ALLOWED_PLATFORMS = ['instagram','facebook','reddit','x'] as const
type Platform = typeof ALLOWED_PLATFORMS[number]

const SOCIAL_PREFIXES: Record<Platform, string[]> = {
    instagram: ["https://instagram.com/", "https://www.instagram.com/"],
    facebook:  ["https://facebook.com/", "https://www.facebook.com/"],
    reddit:    ["https://reddit.com/user/", "https://www.reddit.com/user/"],
    x:         ["https://x.com/", "https://www.x.com/", "https://twitter.com/", "https://www.twitter.com/"]
}

const MAX_URL_LEN = 200

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

        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $set: { username: newUsername.trim() } },
            { new: true, runValidators: true }
        )

        if (!updatedUser) {
            res.status(400).json({status: "error", msg: "User not found"})
            return
        }

        

        res.status(200).json({
            status: "success",
            msg: "Username updated",
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role
            }
        })


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

        if (newBio === undefined) {
            res.status(400).json({status: "error", msg: "Bio text not provided"})
            return 
        }
        //check if new username is valid
        if (newBio.trim().length > 1000) {
            res.status(400).json({status: "error", msg: "Bio text too long"})
            return
        }

        await User.updateOne({_id: user._id}, {bio: newBio.trim()})

        res.status(200).json({status: "success", msg: "Bio updated"})


    } catch (error) {
        res.status(500).json({status: "error", msg: "Error editing bio"})

    }
}

const editSocialMediaLinks = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        const {links} = req.body

        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        } 

        if (!links) {
            res.status(400).json({status: "error", msg: "Links not provided"})
            return
        } 

        if (!validateSocialMediaLinks(links)) {
            res.status(400).json({status: "error", msg: "Links are not valid"})
            return 
        }

        // Normalize: ensure all platforms exist
        const map = new Map<string,string>()
        for (const p of ALLOWED_PLATFORMS) map.set(p, "")
        for (const l of links) {
            const p = l.platform.toLowerCase().trim()
            if (map.has(p)) map.set(p, (l.url || '').trim())
        }

        const sanitizedLinks = ALLOWED_PLATFORMS.map(p => ({ platform: p, url: map.get(p)! }))

        await User.updateOne({_id: user._id}, { socialLinks: sanitizedLinks })

        res.status(200).json({status: "success", msg: "Social links updated", data: sanitizedLinks})


    } catch (error) {
        res.status(500).json({status: "error", msg: "Error saving social media links"})

    }
}

const PUBLIC_IMAGE_FOLDER = path.join(__dirname, "..", "..", "..", "uploads", "profile")

const saveNewProfilePicture = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser
        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        }
        
        const file = (req as any).file as Express.Multer.File | undefined
        if (!file) {
            res.status(400).json({status: "error", msg: "No file provided"})
            return
        }

        const newName = await processImage(file)
        if (!newName) {
            res.status(500).json({status: "error", msg: "Error saving new image"})
            return 
        }

        //delete the old profile picutre
        if (user.profilePicture) {
            deleteOldProfilePicture(user.profilePicture)
        }

        await User.updateOne({_id: user._id}, {profilePicture: newName})

        const publicUrl = `${process.env.APP_URL}/uploads/profile/${newName}`

        res.status(200).json({
            status: "success",
            msg: "Profile picture updated",
            url: publicUrl
        })
        
        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({status: "error", msg: "Error saving new image"})
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser

        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        }
        
        const [deletedUser] = await Promise.all([
            User.findOneAndDelete({_id: user._id}),
            KeyBinding.deleteMany({userId: user._id}),
            Like.deleteMany({userId: user._id}),
            PasswordReset.deleteMany({userId: user._id})
        ])

        if (!deletedUser) {
            res.status(400).json({status: "error", msg: "User not found"})
            return
        }
        
        //delete profile picture
        if (deletedUser.profilePicture) {
            deleteOldProfilePicture(deletedUser.profilePicture)
        }
        res.status(200).json({status: "success", msg: "User deleted successfully"})
        
    } catch (error) {
        res.status(500).json({status: "error", msg: "Error deleting user"})
    }
}



// helper functions
const newNameValid = async (newName: string) => {
    if (newName.length < 3 || newName.length > 20) return false

    const existsUser = await User.findByUsername(newName)
    if (existsUser) return false
    return true
}

function validateSocialMediaLinks(links: socialMediaLink[]): boolean {
    if (!Array.isArray(links)) return false
    for (const linkObj of links) {
        if (!linkObj || typeof linkObj.platform !== 'string') return false
        const platform = linkObj.platform.toLowerCase().trim() as Platform
        if (!ALLOWED_PLATFORMS.includes(platform)) return false

        const url = (linkObj.url || '').trim()
        if (url === '') continue // empty allowed
        if (url.length > MAX_URL_LEN) return false
        
        // must start with one of allowed prefixes
        if (!SOCIAL_PREFIXES[platform].some(pref => url.startsWith(pref))) return false
    }
    return true
}

const processImage = async (file: Express.Multer.File): Promise<string> => {
    try {
        //get the loaciton for new edited file
        const originalPath = file.path
        const ext = path.extname(file.filename).toLocaleLowerCase()
        const newName = file.filename.replace(ext, '.webp')
        const newPath = path.join(PUBLIC_IMAGE_FOLDER, newName)

        //edit the file, size, quailty and format
        await sharp(originalPath)
        .rotate() // auto orient 
        .resize(256, 256, {fit: 'cover'})
        .webp({quality: 85})
        .toFile(newPath)
        
        //delete the original file (if it wasnt webp)
        if (originalPath !== newPath) {
            fs.unlink(originalPath, () => {})
        }

        return newName
    } catch (error) {
        console.log(error)
        return ""
    }
}

const deleteOldProfilePicture = (imageLink: string) => {
    const oldPath = path.join(PUBLIC_IMAGE_FOLDER, imageLink)
    fs.unlink(oldPath, (e) => {})
}



export {editUsername, editBio, editSocialMediaLinks, saveNewProfilePicture, deleteUser}