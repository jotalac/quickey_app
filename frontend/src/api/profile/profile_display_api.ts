import {api} from "../api"


export const profileDisplayApi = {
    async getAccountData() {
        try {
            const response = await api.get(`/profile/get-account-data`)
            console.log(response.data);
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }
    },

    async getProfileBindingStats() {
        try {
            const response = await api.get('/profile/get-binding-stats')
            console.log(response.data);
            
            return response.data
        } catch (error: any) {
            console.log(error)
            return {status: "error", msg: error.response?.data?.msg}
        }
    }
}