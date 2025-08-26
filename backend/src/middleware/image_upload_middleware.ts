import path from "path";
import fs from 'fs'
import multer from "multer";
import { IUser } from "../@types/user";

const PROFILE_DIR = path.join(__dirname, '..', '..', 'uploads', 'profile')

//ensure directroy exists - create it
if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true })
}

const ALLOWED_MIME = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml',
])

export const profilePicUploadMiddleware = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, PROFILE_DIR),
        filename: (req, file, cb) => {
            //image name = id + timestamp + ext
            const userId = (req.user as IUser)._id
            const unique = Date.now().toString(8)
            const ext = path.extname(file.originalname).toLocaleLowerCase()
            cb(null, `${userId}-${unique}${ext}`)
        }
    }),
    limits: {
        fileSize: 4_000_000, // 1.5 MB
        files: 1
    },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
            return cb(new Error('Unsupported file type'))
        }
        cb(null, true)
    }
}).single("profilePic")