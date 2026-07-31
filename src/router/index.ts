import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'
import { useBootStatusStore } from '@/stores/bootStatus'
import AllSetView from '@/views/AllSetView.vue'

/**
 * Builds the app router with the boot-status guard attached. Takes the history mode as a
 * parameter (rather than hardcoding `createWebHistory`) so tests can pass `createMemoryHistory`
 * and get an isolated instance instead of sharing the singleton default-exported below.
 */
export function createAppRouter(history: RouterHistory) {
  const router = createRouter({
    history,
    routes: [
      {
        path: '/',
        name: 'all-set',
        component: AllSetView,
      },
      {
        path: '/welcome',
        name: 'welcome',
        component: () => import('@/views/WelcomeView.vue'),
      },
      {
        path: '/setup-account',
        name: 'setup-account',
        component: () => import('@/views/SetupAccountView.vue'),
      },
    ],
  })

  router.beforeEach(async (to) => {
    const bootStatus = useBootStatusStore()

    if (bootStatus.firstUserCreated === null) {
      await bootStatus.refresh()
    }

    if (bootStatus.firstUserCreated && (to.name === 'welcome' || to.name === 'setup-account')) {
      return { name: 'all-set' }
    }

    if (!bootStatus.firstUserCreated && to.name === 'all-set') {
      return { name: 'welcome' }
    }

    return true
  })

  return router
}

export default createAppRouter(createWebHistory(import.meta.env.BASE_URL))
