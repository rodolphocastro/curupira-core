import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'
import { useBootStatusStore } from '@/stores/bootStatus'
import { pb } from '@/lib/pocketbase'
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
      {
        path: '/login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
      },
      {
        path: '/setup-defaults',
        name: 'setup-defaults',
        component: () => import('@/views/SetupDefaultsView.vue'),
      },
    ],
  })

  /**
   * Gates every route on the combined firstUserCreated x readyToWork x auth-state matrix,
   * per docs/specs/first-user-creation.md, docs/specs/login.md, and docs/specs/set-up-defaults.md.
   * Each branch resolves the correct next state directly rather than relying on Vue Router
   * chasing successive redirects, which keeps the logic easy to unit test.
   */
  router.beforeEach(async (to) => {
    const bootStatus = useBootStatusStore()

    if (bootStatus.firstUserCreated === null) {
      await bootStatus.refresh()
    }

    if (!bootStatus.firstUserCreated) {
      if (to.name !== 'welcome' && to.name !== 'setup-account') {
        return { name: 'welcome' }
      }
      return true
    }

    if (to.name === 'welcome' || to.name === 'setup-account') {
      return { name: pb.authStore.isValid ? 'all-set' : 'login' }
    }

    if (!pb.authStore.isValid) {
      return to.name === 'login' ? true : { name: 'login' }
    }

    if (!bootStatus.readyToWork) {
      return to.name === 'setup-defaults' ? true : { name: 'setup-defaults' }
    }

    if (to.name === 'login' || to.name === 'setup-defaults') {
      return { name: 'all-set' }
    }

    return true
  })

  return router
}

export default createAppRouter(createWebHistory(import.meta.env.BASE_URL))
