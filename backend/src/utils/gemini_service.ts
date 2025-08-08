import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY || ""
const genModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"
const MAX_NODES = parseInt(process.env.AI_MAX_NODES || "20", 10)

const ai = new GoogleGenAI({apiKey: apiKey})

const SYSTEM_RULES = `
You convert a user's macro description into a flat ordered list of action tokens.

FORMAT RULES:
- OUTPUT: ONLY a raw JSON array of strings. NO markdown fences. NO text outside JSON.
- Each element string starts with its zero-based index, then an underscore, then an action identifier.
- Action identifier: lowercase, words separated by underscores; allowed chars: a–z 0–9 underscore.
- Max ${MAX_NODES} items. If more would be needed, merge or skip minor steps.
- Examples:
  ["0_write_hello_world","1_press_ctrl_s","2_delay_300","3_press_enter"]
- Delay action must be: index_delay_<milliseconds>
- Key presses: index_press_<KeyName> (KeyName in original casing if important, else uppercase single key)
- Writing text: index_write_<short_snake_case_excerpt> (strip spaces/punctuation, truncate long text)
- NEVER include explanations, comments, objects, numbers alone, or nested arrays.
- NEVER wrap in backticks.
- If ambiguous, guess reasonable typical sequence.
- If nothing actionable, return [].
`

// Promise<{actions: String[], raw: string}>
const generateKeybinding = async (prompt: string): Promise<String>  => {
    if (!apiKey) throw new Error("Gemini API key not provided")

    const fullPrompt = `User request:\n${prompt}\nReturn ONLY the JSON array`

    const aiResponse = await ai.models.generateContent({
        model: genModel,
        contents: fullPrompt,
        config: {
            systemInstruction: SYSTEM_RULES,
            thinkingConfig: {
                thinkingBudget: 1 //disable thinking
            }
        }
    })

    return aiResponse.text || ""
    
}   


export {generateKeybinding}