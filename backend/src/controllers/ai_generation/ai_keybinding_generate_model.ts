import { Request, Response } from "express";
import { generateKeybinding } from "../../utils/gemini_service";

const aiGenerateKeybinding = async (req: Request, res: Response) => {
    try {
        const {prompt} = req.body

        const generatedActions = await generateKeybinding(prompt)

        res.status(200).json({
            status: "success",
            msg: "Keybinding generated",
            data: {
                actions: generatedActions,
                remaining: 0
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({status: "error", msg: "Error generating keybinding"})
    }
}

export {aiGenerateKeybinding}