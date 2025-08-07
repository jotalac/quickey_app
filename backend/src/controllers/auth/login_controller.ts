import { Request, Response } from "express"
import User from "../../models/user_model"
import { IUser } from "../../@types/user"
import { generateJWT } from "../../utils/jwt"
import { generateRefreshToken } from "../../utils/jwt"

interface LoginRequest extends Request {
    body: {
        name: string,
        password: string
    }
}

const validateLogin = async (req: LoginRequest, res: Response) => {
    try {
        let {name, password} = req.body

        name = name?.trim()
        password = password?.trim()

        //check if all data for login is provided
        if (!name || !password) {
            res.status(200).json({
                status: "error",
                msg: "Username or password not provided"
            })
            return
        }
        
        const user = await findUser(name)
        
        //check if provided user exists
        if (!user) {
            res.status(200).json({
                status: "error",
                msg: "Login not valid"
            })
            return
        }

        //check if user is not logged with sso
        if (user.registerType === 'sso') {
            res.status(200).json({
                status: "error",
                msg: "You are registered with Google account"
            })
            return
        }

        //check if password is correct
        if (!await user.comparePassword(password)) {
            res.status(200).json({
                status: "error",
                msg: "Login credentials are invalid"
            })
            return
        }

        const loginResponse = generateLoginResponse(user, res)

        res.status(200).json(loginResponse)

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: "error",
            msg: "Server login error",
            error
        })
    }

}

const findUser = async (name: string) => {
    return await User.findOne({
        $or: [
            {username: name},
            {email: name}
        ]
    })
}

const generateLoginResponse = (user: IUser, res: Response) => {
    //generate tokens
    const accessToken = generateJWT(user)
    const refreshToken = generateRefreshToken(user)

    //set the refresh token in httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', //send only through https
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 3 // 3 days 
    })

    const authData = {
        status: "success",
        msg: "login successfull",
        data: {
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            },
            tokens: {
                accessToken,
                tokenType: "Bearer"
            }
        }
    }

    return authData
}

const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })
    res.status(200).json({ status: 'success', msg: 'Logged out successfully' });
}

export {validateLogin, generateLoginResponse, logout}