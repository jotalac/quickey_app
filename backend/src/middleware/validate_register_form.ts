import {Request, Response, NextFunction} from 'express'
import User from '../models/user_model'
import validator from "validator"

interface ValidationError {
    field: string,
    message: string
}

interface RegisterRequest extends Request {
    body: {
        username: string,
        email: string,
        password: string,
        passwordConfirm: string
    }
}

const registerFormValidation = async (req: RegisterRequest, res: Response, next: NextFunction) => {
    try {        
        let {username , email, password, passwordConfirm} = req.body
        let errors: ValidationError[] = []
                
        username = username?.trim()
        email = email?.trim()
    
        //validate inputs
        if (!(await usernameUnique(username)) || !usernameValid(username)) {
            errors.push({field: 'username', message: 'Username is not valid'})
        }
        
        if (!(await emailUnique(email)) || !emailValid(email)) {
            errors.push({field: 'email', message: 'Email is not valid'})
        }
        
        if (!passwordValid(password)) {
            errors.push({field: 'password', message: 'Password is not valid'})
        }
        
        if (password !== passwordConfirm) {
            errors.push({field: 'passwordConfirm', message: 'Passwords do not match'})
        }
    
        //check if there were some erros in the validaiton
        if (errors.length > 0) {
            res.status(400).json({status: 'error', msg: 'Invalid data', errorData: errors})
        } else {
            //validation passed - create pending user
            next()
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            msg: "Data validation failed",
            error: error
        })
    }
}

//username validation
const usernameUnique = async (username: string) => {
    const user = await User.findByUsername(username)
    return !user;
}
const usernameValid = (username: string) => {
    if (username.length < 3 || username.length > 20) {
        return false
    } else {
        return true
    }
}

//email validation
const emailUnique = async (email: string) => {
    const user = await User.findByEmail(email)
    return !user
}

const emailValid = (email: string) => {
    return validator.isEmail(email)
}

//password validation
const passwordValid = (password: string) => {
    if (password.length < 7 || password.length > 256) {
        return false
    }

    const hasUppercase = /[A-Z]/.test(password);  // Checks for at least one uppercase letter
    const hasNumber = /\d/.test(password);        // Checks for at least one digit
    const hasLowercase = /[a-z]/.test(password)
    if (!hasNumber || !hasUppercase || !hasLowercase) {
        return false
    }
    return true
}

export {registerFormValidation, passwordValid}