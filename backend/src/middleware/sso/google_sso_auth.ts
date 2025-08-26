// import passport, { DoneCallback } from 'passport';
// import { Strategy as GoogleStrategy , Profile, VerifyCallback} from 'passport-google-oauth20';
// import dotenv from "dotenv";
// import User from '../../models/user_model';
// import crypto from 'crypto';
// import { IUser } from '../../@types/user';
// import bcrypt from 'bcrypt'

// dotenv.config();

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       callbackURL: `${process.env.BACKEND_URL}/api/auth/sso/google/callback`,
//     },
//     async (accessToken: string, refreshToken: string, profile: Profile, cb: VerifyCallback) => {
//         try {
//             //safety check for emails
//             if (!profile.emails || !profile.emails[0]?.value) {
//                return cb(new Error('No email provided by Google'));
//             }

//             // check if user with the specified email does alreasy exist - login
//             let user = await User.findOne({ email: profile.emails[0].value });
//             if (!user) {
//                 //generate random password - user with sso wont user the password anyway
//                 const pwdGenerated = crypto.randomBytes(32).toString("hex")
//                 const hashedPassword = await bcrypt.hash(pwdGenerated, 10);

//                 //check if there is some user with same username but different email - generate username
//                 let usernameSave = profile.displayName
//                 const userSameName = await User.findOne({ username: usernameSave})
//                 if (userSameName) {
//                     const baseName = usernameSave.split(" ")[0]
//                     const number = crypto.randomInt(1000, 10000)
//                     usernameSave = `${baseName}_${number}`
//                 }

//                 // Create a new user, adjust values accordingly.
//                 user = await User.create({
//                     username: usernameSave,
//                     email: profile.emails[0].value,
//                     password: hashedPassword,
//                     registerType: "sso"
//                 });
//             }
//             return cb(null, user);
//         } catch (error) {
//             return cb(error);
//         }
//         }
//     ) 
// );

// passport.serializeUser((user, done: DoneCallback) => {
//   done(null, (user as IUser)._id);
// });

// passport.deserializeUser(async (id: string, done: DoneCallback) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error);
//   }
// });



// import { OAuth2Client } from "google-auth-library"
// import {Request, Response} from 'express'
// import User from "../../models/user_model"
// import crypto from 'crypto'
// import bcrypt from 'bcrypt'
// import { generateJWT, generateRefreshToken } from "../../utils/jwt"


// export const googleSSO = async (req: Request, res: Response) => {
//     try {
//         const {credential} = req.body

//         if (!credential) {
//             res.status(400).json({
//                 status: 'error',
//                 msg: 'No credential provided'
//             })
//             return
//         }

//         //verify google jwt token
//         const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

//         const ticket = await client.verifyIdToken({
//             idToken: credential,
//             audience: process.env.GOOGLE_CLIENT_ID 
//         })

//         const payload = ticket.getPayload()
//         const email = payload?.email
//         const name = payload?.name

//         if (!email) {
//           res.status(400).json({
//             status: 'error',
//             msg: 'Email not provided by google'
//           })
//         }

//         // Check if user exists or create new one
//         let user = await User.findOne({ email })

//         if (!user) {
//             const pwdGenerated = crypto.randomBytes(32).toString("hex")
//             const hashedPassword = await bcrypt.hash(pwdGenerated, 10)
            
//             let username = name || email?.split('@')[0]
//             const userSameName = await User.findOne({ username })
//             if (userSameName) {
//                 const number = crypto.randomInt(1000, 10000)
//                 username = `${username}_${number}`
//             }
            
//             user = await User.create({
//                 username,
//                 email,
//                 password: hashedPassword,
//                 registerType: "sso"
//             })
//         }

//         //generate tokens
//         const accessToken = generateJWT(user)
//         const refreshToken = generateRefreshToken(user)

//         const authData = {
//             status: "success",
//             msg: "login successfull",
//             data: {
//                 user: {
//                     id: user._id,
//                     username: user.username,
//                     role: user.role
//                 },
//                 tokens: {
//                     accessToken,
//                     refreshToken,
//                     tokenType: "Bearer"
//                 }
//             }
//         }

//         res.status(200).json(authData)


//     } catch (error) {
//       console.error('Google SSO error:', error)
//       res.status(500).json({
//           status: 'error',
//           msg: 'Authentication failed'
//       }) 
//     }
// }