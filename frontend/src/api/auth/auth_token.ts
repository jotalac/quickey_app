import {api} from '@/api/api'
import axios from 'axios'

export interface AuthResponse{
    status: string
    msg: string
    data: {
        user: {
            id: string
            username: string
            role: string
        }
        tokens: {
            accessToken: string
            tokenType: string
        }
    }
}

export const authApi = {
    async refreshToken() {
        //uses axios to prevert axios loop with automatic token refresh
        const response = await axios.post('/api/auth/refresh-token', {}, {withCredentials: true})

        return response.data
    },

    async logoutServer() {
        await api.post('/auth/logout')
    },

    async googleSSO(credential: string) {
        
        const response = await api.post('/auth/sso/google/verify', {credential})
        return response.data
    }

}