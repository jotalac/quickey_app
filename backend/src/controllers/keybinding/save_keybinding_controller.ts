import {Request, Response} from "express"
import KeyBinding from "../../models/keybinding_model"
import { IUser } from "../../@types/user"
import { bindingNameValid } from "./keybinding_user_controller"
import { KEYBINDING_CATEGORIES } from "../../constants/keybinding_categories"
import { isPassportNumber } from "validator"

const saveKeyBinding = async (req: Request, res: Response) => {
    const {bindingData, name, description = "", category} = req.body
    //check if all data is provided
    if (!bindingData || !name) {        
        res.status(400).json({
            status: "error",
            msg: "Some data are not provided"
        })
        return
    }
    //check if user is authenticated and valid
    const user = req.user as IUser
    if (!user) {
        res.status(401).json({
            status: "error",
            msg: "User not authenticated"
        })
        return
    }
    //validate single values
    const nameValid = await validateName(name, user._id)
    const descriptionValid = validateDescription(description)
    const keyBindingDataValid = validateKeybindingData(bindingData)
    const categoryValid = validateCategory(category)

    if (!nameValid || !descriptionValid || !keyBindingDataValid || !categoryValid) {
        res.status(400).json({
            status: "error",
            msg: "Invalid data provided"
        })
        return
    }

    //save the binding to database
    try {
        await KeyBinding.create({
            userId: user._id,
            keyBinding: bindingData,
            name: name.trim(),
            description: (description || "").trim(),
            category: category
        })

        res.status(201).json({
            status: "success",
            msg: "Data successfully saved"
        })

    } catch (error) {
        res.status(500).json({status: "error", msg: "Error saving key binding"})
    }
}

const getCategories = (req: Request, res: Response) => {
    res.status(200).json({
        status: 'successfull',
        categories: KEYBINDING_CATEGORIES
    })
    return
}

//helper functions
const validateName = async (name: string, userId: string): Promise<boolean> => {
    if (name.length > 50 || name.length < 3) {
        return false
    }
    if (!await bindingNameValid(userId, name)) return false

    return true
} 

const validateDescription = (description: string): boolean => {
    if (description.length > 3000) return false
    return true
}

const validateKeybindingData = (keyBinding: any) => {
    if (!Array.isArray(keyBinding)) return false
    if (keyBinding.length !== 28) return false

    //check that every item has requiered structure
    // return keyBinding.every((item: any) => 
    //     item &&
    //     typeof item.id === 'string' &&
    //     Array.isArray(item.value) 
    // )

    let knobCount = 0
    const numericIds = new Set<number>()

    for (const item of keyBinding) {
        if (!item || typeof item.id !== 'string' || !Array.isArray(item.value)) return false

        //validate the values
        if (item.value.length > 0) {
            for (const v of item.value) {
                if (typeof v !== 'string') return false
                if (v.length > 700) return false
            }
        }

        //validate the IDs
        if (item.id === "knob") {
            knobCount++
            if (knobCount > 1) return false
            continue
        }

        if (!/^(?:[1-9]|1[0-9]|2[0-7])$/.test(item.id)) return false
        const num = parseInt(item.id, 10)
        if (numericIds.has(num)) return false
        numericIds.add(num)
    }

    //check if ids and knob is correct
    if (knobCount !== 1) return false
    if (numericIds.size !== 27) return false

    return true
}

const validateCategory = (category: string): boolean => {
    if (!category) return false

    return (KEYBINDING_CATEGORIES as readonly string[]).includes(category)
}

export {saveKeyBinding, getCategories}