import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY || ""
const genModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"
const MAX_NODES = parseInt(process.env.AI_MAX_NODES || "20", 10)

const ai = new GoogleGenAI({apiKey: apiKey})

const SYSTEM_RULES = `
Convert user macro description into a JSON array of strings.  

FORMAT:
- Raw JSON only. No markdown, comments, or text outside JSON.
- First element: "multi" (not counted in index).
- Others: "<index>_<action>_<valueIfAny>", index starts at 0.
- Max ${MAX_NODES} items after "multi" — merge/skip minor steps if needed.
- If unclear, pick common default. If nothing actionable, return [].

ACTIONS:
- pressRelease_<keyCode>
- hold_<keyCode>
- release_<keyCode>
- releaseAll_  (no value)
- mouseMove_<hDir>&<vDir>&<hVal>&<vVal>
- mouseClick_<left|right|middle>
- volumeUp_, volumeDown_, volumeMute_, playPause_, playNext_, playPrev_ (no value)
- delay_<ms>
- write_<text> (spaces allowed)

COMBO RULE:
- For key combinations, output in this order:
  1) hold each required key,
  2) perform the action (e.g., press another key, type text, etc.),
  3) releaseAll_ or release each key in reverse order.

EXAMPLE:
"open chrome go to chatgpt and paste clipboard, submit"
→ ["multi","0_pressRelease_MetaLeft","1_write_chrome","2_pressRelease_Enter","3_delay_300","4_write_chat.com","5_pressRelease_Enter","6_delay_3000","7_hold_ControlLeft","8_hold_KeyV","9_releaseAll_","10_pressRelease_Enter"]
`

// Promise<{actions: String[], raw: string}>
const generateKeybinding = async (prompt: string): Promise<{actions: String[], model: String}>  => {
    if (!apiKey) throw new Error("Gemini API key not provided")

    const fullPrompt = `User request:\n${prompt}\nReturn ONLY the JSON array`

    const aiResponse = await ai.models.generateContent({
        model: genModel,
        contents: fullPrompt,
        config: {
            systemInstruction: SYSTEM_RULES,
            // thinkingConfig: {
            //     thinkingBudget: 0 //disable thinking
            // }
        }
    })

    //convert the output data to string array
    const generatedOutput = aiResponse.text?.trim() || ''
    const cleaned = generatedOutput.replace(/```json|```/gi, "").trim()

    let actions: string[] = []
    try {
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) {
            //ensure all data are strings and the length is correct
            actions = parsed.filter((s) => typeof s === 'string').slice(0, MAX_NODES - 1) 
        }
    } catch (error) {
        actions = []
    }

    return {actions: actions, model: genModel}
}   


export {generateKeybinding}