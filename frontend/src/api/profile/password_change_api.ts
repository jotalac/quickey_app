import { api } from "../api"

export const passwrodChnageApi = {
    async requestPasswordChange() {
        try {
            const response = await api.post('/profile/password-change-request')
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }        
    },

    async verifyResetToken(resetToken: string) {
        try {
            const response = await api.post('/profile/password-token-verify', {token: resetToken})
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }        
    },

    async changePassword(resetToken: string, newPassword: string) {
        try {
            const response = await api.patch('/profile/edit/password', {token: resetToken, newPassword: newPassword})
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }        
    },
}