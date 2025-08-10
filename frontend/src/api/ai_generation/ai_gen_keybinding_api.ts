import { api } from "../api"

export const aiGenKeybindingApi = {
    async generateKeybinding(prompt: string) {
        try {
            const response = await api.post("/ai/keybinding-generate", {prompt})
            
            return response.data
        } catch (error: any) {
            return {
                status: "error", 
                msg: error.response?.data?.msg,
                data: {
                    remaining: error.response?.data?.remaining,
                    availibleIn: error.response?.data?.availibleIn
                }
            }
        }
    },

    async getGenerationLimits() {
        try {
            const response = await api.get("/ai/get-generation-limits")

            return response.data
        } catch (error: any) {
            return {status: "error", msg: error.response?.data?.msg,}
        }
    }
}