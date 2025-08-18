import { type AuthResponse } from "./auth_token"

export interface AuthUser {
    id: string
    username: string
}

let inMemoryAccessToken: string | null = null

export class AuthService {
    private static readonly STORAGE_KEYS = {
        USER: 'user'
    } as const

    //token management
    static saveAuthData(data: AuthResponse['data']): void {
        if (data && data.tokens) {
            inMemoryAccessToken = data.tokens.accessToken
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(data.user))            
        }
    }

    static getAccessToken(): string | null{
        return inMemoryAccessToken
    }

    static getUser(): AuthUser | null {
        const userStr = localStorage.getItem(this.STORAGE_KEYS.USER)
        return userStr ? JSON.parse(userStr) : null
    }

    static isLoggedIn(): boolean {
        return !!this.getAccessToken() && !!this.getUser()
    }

    static logout() {
        inMemoryAccessToken = null
        localStorage.removeItem(this.STORAGE_KEYS.USER)
    }

}