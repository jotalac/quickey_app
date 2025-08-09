import { Request, Response } from "express";
import { generateKeybinding } from "../../utils/gemini_service";
import { IUser } from "../../@types/user";
import AiGenerationKeybinding from "../../models/ai_generation_keybinding_model"
import { getTimeRemaining } from "../../middleware/ai_generation/ai_limit_middleware";

const aiGenerateKeybinding = async (req: Request, res: Response) => {
    try {
        const prompt = req.body?.prompt.trim()
        const user = req.user as IUser
        const usageData = (req as any).aiUsage

        if (!promptValid(prompt)) {
            res.status(400).json({status: "error", msg: "Prompt length invalid"})
            return
        }
        else if (!user._id) {
            res.status(429).json({status: "error", msg: "User not authorized"})
            return
        }

        const {actions, model} = await generateKeybinding(prompt)

        //add the generation to database
        await AiGenerationKeybinding.create({
            userId: user._id,
            prompt: prompt,
            generatedNodes: actions,
            model: model
        })

        //check if there is any output from the model
        if (actions.length === 0) {
            res.status(502).json({
                status: "error",
                msg: "Model returned empty output, try improving your prompt!",
                data: {
                    remaining: usageData?.remaining ?? null
                }
            })
            return
        }
        res.status(200).json({
            status: "success",
            msg: "Keybinding generated",
            data: {
                actions: actions,
                remaining: usageData.remaining,
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({status: "error", msg: "Error generating keybinding"})
    }
}

const getAiLimits = async (req: Request, res: Response) => {
    const DAILY_LIMIT = parseInt(process.env.AI_DAILY_LIMIT || '10', 10)
    try {
        const user = req.user as IUser
        if (!user._id) {
            res.status(401).json({status: "error", msg: "User not authorized"})
            return
        }

        // const dateLastDay = new Date(Date.now() - 1000 * 60 * 60 * 24)
        // getting all records for user, assume that the old ones are deleted 
        const usedNumber = await AiGenerationKeybinding.countDocuments({userId: user._id})

        if (usedNumber >= DAILY_LIMIT) {
            const minutesUntilNext = await getTimeRemaining(user._id)
            res.status(200).json({
                status: "success",
                msg: "AI generation daily limit reached",
                data: {
                    dailyLimit: DAILY_LIMIT,
                    remaining: 0,
                    availibleIn: minutesUntilNext
                }
            })
        } else {
            res.status(200).json({
                status: "success",
                msg: "AI generation availible",
                data: {
                    dailyLimit: DAILY_LIMIT,
                    remaining: DAILY_LIMIT - usedNumber,
                    availibleIn: 0
                }
            })
        } 
    } catch (error) {
        res.status(500).json({status: "error", msg: "Error getting daily limit"})
    }
}

//ony for now for TESTING
const aiGenerateKeybindingTesting = async (req: Request, res: Response) => {

    try {
        let {prompt} = req.body
        prompt = prompt.trim()

        if (!promptValid(prompt)) {
            res.status(400).json({status: "error", msg: "Prompt length invalid"})
            return
        }


        const {actions, model} = await generateKeybinding(prompt)


        //check if there is any output from the model
        if (actions.length === 0) {
            res.status(502).json({
                status: "error",
                msg: "Model returned empty output, try improving your prompt!",
            })
            return
        }

        res.status(200).json({
            status: "success",
            msg: "Keybinding generated",
            data: {
                actions: actions,
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({status: "error", msg: "Error generating keybinding"})
    }
}

//helper functions
const promptValid = (prompt: string): boolean => {
    if (prompt.length < 5 || prompt.length > 400) return false
    return true
}

export {aiGenerateKeybinding, aiGenerateKeybindingTesting, getAiLimits}