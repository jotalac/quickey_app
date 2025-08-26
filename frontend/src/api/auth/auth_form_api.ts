import {api} from "@/api/api"


export const authFormApi = {
    async checkEmailAvailible(email: string): Promise<boolean>{
        try {
            const response = await api.get(`/auth/form/check-email?email=${encodeURIComponent(email)}`)
            
            return response.data.availible || false
        } catch (error) {
            console.log("Error checking email availibility:" + error);
            return false
        }
    },

    async checkUsernameAvailible(username: string): Promise<boolean>{
        try {
            const response = await api.get(`/auth/form/check-username?username=${username}`)
            
            return response.data.availible || false
        } catch (error) {
            console.log("Error checking email availibility:" + error);
            return false
        }
    },

    async sendRegisterForm(username: string, email: string, password: string, passwordConfirm: string) {
        try {
            const response = await api.post('/auth/register', {username, email, password, passwordConfirm})            

            return response.data
        } catch (error: any) {
            console.log("Error loggin in!");
            return {msg: error.response?.data?.msg || 'Something went wrong. Try again later.'}
        }
    },

    async sendLoginForm(name: string, password: string) {
        try {            
            const response = await api.post('/auth/login', {name, password})
            return response.data
        } catch (error: any) {
            console.log(error)
            return {msg: error.response?.data?.msg || 'Something went wrong. Try again later.'}
            
        }
    },

    async forgotPassword(email: string) {
        try {            
            const response = await api.post('/auth/forgot-password', {email})
            return response.data
        } catch (error: any) {
            return {status: "error", msg: error.response?.data?.msg }
            
        }
    }
}