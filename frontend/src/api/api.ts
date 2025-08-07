import axios from "axios";
import { authApi } from "./auth/auth_token";
import { useAuth } from "@/composables/useAuth";
import { AuthService } from "./auth/auth_service";

export const api = axios.create({
    baseURL: '/api'
})

const {logout} = useAuth()

//add auth token to header with each request
api.interceptors.request.use(
    (config) => {
        const token = AuthService.getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

//handle token refresh automaticlly
api.interceptors.response.use(
    (response) => {
        return response // if there is not error dont do anything
    },
    async (error) => {
        const originalRequest = error.config // get the original reqest that produced the error

        //if token is expired and we havent tryed tried to refresh
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // try to refresh the token - it is send automatically in the cookie
                const refreshResponse = await authApi.refreshToken()

                if (refreshResponse.status === 'success') {                    
                    AuthService.saveAuthData(refreshResponse.data)

                    //send the orignal requst with correct auth headers
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`

                    return api(originalRequest)
                }
            } catch (error) {                
                //refresh failed
                console.log("Token refresh failed");
                logout()
                return Promise.reject(error)
            }
        }
        //handle too many requests
        if (error.response?.status === 429) {
            console.log("Too many requests, slow down little")
        }
        return Promise.reject(error)
    }
)