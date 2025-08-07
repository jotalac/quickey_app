import { Request, Response, NextFunction } from "express"
import { IUser } from "../../@types/user"
import { generateJWT, generateRefreshToken, verifyJWT, verifyRefreshToken } from "../../utils/jwt"
import User from "../../models/user_model"

// export const ssoCallback = (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = req.user as IUser 

//         if (!user) {
//             // res.status(401).json({
//             //     status: "error",
//             //     msg: "Authentication failed"
//             // })
//             res.status(401).send(`
//                 <script>
//                     window.opener.postMessage({
//                         type: 'SSO_ERROR',
//                         error: 'Autherntication failed'
//                     }, '${process.env.FRONTEND_URL}')
//                     window.close()
//                 </script>
//             `)
//         }


//         const accessToken = generateJWT(user)
//         const refreshToken = generateRefreshToken(user)

//         const authData = {
//             status: "success",
//             msg: "Login successfull",
//             data: {
//                 user: {
//                     id: user._id,
//                     username: user.username,
//                     role: user.role
//                     //later possibly add some other more staff that i would need to show on the profile
//                 },
//                 tokens: {
//                     accessToken,
//                     refreshToken,
//                     tokenType: "Bearer"
//                 }
//             }
//         }
        
//         res.status(200).send(
//             `<script>
//                 window.opener.postMessage({
//                     type: 'SSO_SUCCESS',
//                     authData: ${JSON.stringify(authData)}
//                 }, '*')
//                 window.close()
//             </script>`
//         )

//         // res.status(200).json({
//         //     status: "success",
//         //     msg: "Login successfull",
//         //     data: {
//         //         user: {
//         //             id: user._id,
//         //             username: user.username,
//         //             role: user.role
//         //             //later possibly add some other more staff that i would need to show on the profile
//         //         },
//         //         tokens: {
//         //             accessToken,
//         //             refreshToken,
//         //             tokenType: "Bearer"
//         //         }
//         //     }
//         // })
//     } catch (error: any) {
//         // res.status(500).json({status: 'error', msg: "Token generation failed"})
//         console.log(error.message);
        
//         res.status(500).send(
//             `<script>
//                 window.opener.postMessage({
//                     type: 'SSO_ERROR',
//                     error: 'Token generation failed'
//                 }, '${process.env.FRONTEND_URL}')
//                 window.close()
//             </script>`
//         )
//     } 
// }


export const refreshToken = async (req: Request, res: Response) => {
    console.log("refreshing token backend");
    
    try {
        const {refreshToken} = req.cookies

        if (!refreshToken) {
            res.status(401).json({
                status: "error",
                msg: "Refresh token not provided"
            })
            return
        }

        const decoded = verifyRefreshToken(refreshToken)
        if (!decoded) {
            res.status(403).json({
                status: "error",
                msg: "Refresh token is not valid"
            })
            return
        }

        const user = await User.findById(decoded.userId)
        if (!user) {
            res.status(403).json({
                status: "error",
                msg: "User not found"
            })
            return
        }

        const newAccessToken = generateJWT(user)
        const newRefreshToken = generateRefreshToken(user)

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', //send only through https
            sameSite: 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 3 // 3 days 
        })
        
        res.status(200).json({
            status: "success",
            msg: "token created successfully",
            data: { 
                user: { 
                    id: user._id,
                    username: user.username,
                    role: user.role
                },
                tokens: {
                    accessToken: newAccessToken,
                    tokenType: "Bearer"
                }
            }
            
        })

    } catch (error) {
        res.status(500).json({
            status: "error",
            msg: "Token refresh failed"
        })
    }
}

export const verifyToken = async (req: Request, res: Response) =>  {
    try {
        const user = req.user as IUser

        res.status(200).json({
            valid: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        })
    } catch (error) {
        res.status(500).json({
            valid: false
        })
    }
}

// export const githubCallback = (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const user = req.user as IUser 
//         console.log(user._id)
//         res.status(400).json({msg: 'error'})
//     } catch (error) {
//         res.status(400).json({msg: 'error'})

//     } 
// }

