import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/LibraryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/views/StatsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/book/:id',
      name: 'BookDetails',
      component: () => import('@/views/BookDetails.vue'),
      props: true
    },
    {
      path: '/library/book/:id',
      name: 'LibrarySingleBook',
      component: () => import('@/views/LibrarySingleBook.vue'),
      props: true
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'password-reset',
      component: () => import('@/views/PasswordReset.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/update-password',
      name: 'update-password',
      component: () => import('@/views/UpdatePassword.vue'),
      meta: { requiresGuest: true }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.user) {
    next('/login')
  } else {
    next()
  }
})

export default router
