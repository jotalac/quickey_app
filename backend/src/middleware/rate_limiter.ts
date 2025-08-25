import rateLimit from 'express-rate-limit'
import {NextFunction, Request, Response} from 'express'
import { v4 as uuidv4 } from "uuid";
import { IUser } from '../@types/user';

export const authForRateLimit = (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies.visitorId) {
        res.cookie("visitorId", uuidv4(), {httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7, sameSite: "strict"})
    }
    next()
}

//5 registrations per 10 minutes
export const registrationLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        status: 'error',
        msg: 'Too many registration attempts, try again later.',
    },
    keyGenerator: (req: Request) => {
        return req.cookies.visitorId || req.ip
    },
    handler: (req: Request, res: Response) => {
        res.status(200).json({
            status: 'error',
            msg: 'Too many registration attempts. Please try again later.',
        })
    }
})

// max 10 registration attempts per minute
export const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 6,
    message: {
        status: 'error',
        msg: 'Too many login attempts, try again later.',
    },
    keyGenerator: (req: Request) => {
        return req.cookies.visitorId || req.ip
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 'error',
            msg: 'Too many login attempts. Please try again later.',
        })
    }
})

//limiter for saving keybindings - max 5 attempts per minute
export const keyBindingSaveLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: {
        status: 'error',
        msg: 'Too many save attempts. Try it again later',
    },
    keyGenerator: (req: Request) => {
        return (req.user as IUser)._id.toString() || req.cookies.visitorId
    },
    handler: (req: Request, res: Response) => {
        res.status(200).json({
            status: 'error',
            msg: 'You’re saving too fast. Take a short break before trying again.',
        })
    }
})

export const keyBindingUpdateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        status: 'error',
        msg: 'Too many updates attempts. Try it again later',
    },
    keyGenerator: (req: Request) => {
        return (req.user as IUser)._id.toString() || req.cookies.visitorId
    },
    handler: (req: Request, res: Response) => {
        res.status(200).json({
            status: 'error',
            msg: 'You’re updating too fast. Take a short break before trying again.',
        })
    }
})

//profile edits rate limiter
export const usernameChangeRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 3,
    message: {
        status: 'error',
        msg: 'Too many username changes.',
    },
    keyGenerator: (req: Request) => {
        return (req.user as IUser)._id.toString() || req.cookies.visitorId
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 'error',
            msg: 'Username change limit reached (max 3 per 24 hours). Please try again later.'
        })
    }
})

export const profilePicRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 2,
    message: {
        status: 'error',
        msg: 'Too many profile picture chagnes.',
    },
    keyGenerator: (req: Request) => {
        return (req.user as IUser)._id.toString() || req.cookies.visitorId
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 'error',
            msg: 'Profile picture change limit reached (max 2 per 24 hours). Please try again later.'
        })
    }
})

export const passwordChangeLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 4,
    message: {
        status: 'error',
        msg: 'Too many password changes.',
    },
    keyGenerator: (req: Request) => {
        return (req.user as IUser)._id.toString() || req.cookies.visitorId
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 'error',
            msg: 'Password change limit reached (max 4 per 24 hours). Please try again later.'
        })
    }
})

//limit the general app usage to 100 requests per minute
export const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        status: 'error',
        msg: 'Too many requests.',
    },
    standardHeaders: true,
    keyGenerator: (req: Request) => {
        return req.cookies.visitorId || req.ip
    },
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            status: 'error',
            msg: 'Too many requests.',
            retryAfter: 60
        })
    }
})

