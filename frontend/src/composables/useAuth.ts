import { api } from "@/api/api";
import { AuthService, type AuthUser } from "@/api/auth/auth_service";
import { authApi } from "@/api/auth/auth_token";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const currentUser = ref<AuthUser | null>(null)
const isAuthLoading = ref(false)
const hasCheckedAuth = ref(false)
const router = useRouter()

export function useAuth() {
    const isLoggedIn = computed(() => !!currentUser.value)

    const initializeAuth = async (): Promise<boolean> => {
        isAuthLoading.value = true

        try {
            //get the new access token - it resets every page reload
            const response = await authApi.refreshToken()

            if (response.status === 'success') {
                AuthService.saveAuthData(response.data)
                currentUser.value = response.data.user
                console.log(response)
                return true
            }
            logout()
            return false
        } catch (error) {
            console.log("No active session found");
            logout()
            return false
        } finally {
            isAuthLoading.value = false
            hasCheckedAuth.value = true
        }
    }

    const setCurrentUser = (user: AuthUser) => {
        currentUser.value = user
    }

    const logout = async() => {
        try {
            await authApi.logoutServer()
        } catch (error) {
            console.log("Logout api call failed")
        } finally {
            AuthService.logout()
            currentUser.value = null
            hasCheckedAuth.value = true
        }

        //redirect to login
        // if (window.location.pathname === '/profile') {
        //     // window.location.href = '/login'
        //     const router = useRouter()
        //     router.push("/login")
        // }
    }



    return {
        currentUser: computed(() => currentUser.value),
        isLoggedIn,
        isAuthLoading: computed(() => isAuthLoading.value),
        hasCheckedAuth: computed(() => hasCheckedAuth.value),
        initializeAuth,
        setCurrentUser,
        logout
    }
}