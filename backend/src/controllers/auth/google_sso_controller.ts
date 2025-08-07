import { OAuth2Client } from "google-auth-library"
import {Request, Response} from 'express'
import User from "../../models/user_model"
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { generateJWT, generateRefreshToken } from "../../utils/jwt"
import { generateLoginResponse } from "./login_controller"


export const googleSSO = async (req: Request, res: Response) => {
    try {
        const {credential} = req.body

        if (!credential) {
            res.status(400).json({
                status: 'error',
                msg: 'No credential provided'
            })
            return
        }

        //verify google jwt token
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID 
        })

        const payload = ticket.getPayload()
        const email = payload?.email
        const name = payload?.name

        if (!email) {
          res.status(400).json({
            status: 'error',
            msg: 'Email not provided by google'
          })
        }

        // Check if user exists or create new one
        let user = await User.findOne({ email })

        if (!user) {
            const pwdGenerated = crypto.randomBytes(32).toString("hex")
            const hashedPassword = await bcrypt.hash(pwdGenerated, 10)
            
            let username = name || email?.split('@')[0]
            const userSameName = await User.findOne({ username })
            if (userSameName) {
                const number = crypto.randomInt(1000, 10000)
                username = `${username}_${number}`
            }
            
            user = await User.create({
                username,
                email,
                password: hashedPassword,
                registerType: "sso"
            })
        }

        const loginResponse = generateLoginResponse(user, res)

        res.status(200).json(loginResponse)


    } catch (error) {
      console.error('Google SSO error:', error)
      res.status(500).json({
          status: 'error',
          msg: 'Authentication failed'
      }) 
    }
}