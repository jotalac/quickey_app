import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import DiscoverView from '@/views/DiscoverView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import AvailableSoonView from '@/views/AvailableSoonView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import EmailVerifyView from '@/views/EmailVerifyView.vue'
import ProfileView from '@/views/ProfileView.vue'
import { AuthService } from '@/api/auth/auth_service'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/app',
      name: 'app',
      component: HomeView,
    },
    {
      path: '/discover',
      name: 'discover',
      component: AvailableSoonView,
    },
    {
      path: '/firmware',
      name: 'firmware',
      component: AvailableSoonView,
    },
    {
      path: '/login',
      name: 'login',
      component: AvailableSoonView,
    },
    {
      path: '/faq',
      name: 'faq',
      component: AvailableSoonView,
    },
    {
      path: '/shop',
      name: 'shop',
      component: AvailableSoonView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/register-verify',
      name: 'register-verify',
      component: EmailVerifyView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

//simple auth guard
// router.beforeEach(async(to, from, next) => {
//   const {hasCheckedAuth, initializeAuth, isLoggedIn} = useAuth()

//   if (!hasCheckedAuth) {
//     await initializeAuth()
//   }

//   const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

//   console.log(isLoggedIn.value)
//   if (requiresAuth && !isLoggedIn.value) {
//     next('/login')
//     return
//   }
//   next()
// })

export default router
