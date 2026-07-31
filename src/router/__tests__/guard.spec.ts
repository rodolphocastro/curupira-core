import { describe, it, expect, beforeEach } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { createAppRouter } from '../index'
import { useBootStatusStore } from '@/stores/bootStatus'

/** Builds an isolated router instance (in-memory history) so tests don't share navigation state. */
function freshRouter() {
  return createAppRouter(createMemoryHistory())
}

describe('router guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('redirects /welcome to / once the first user has been created', async () => {
    useBootStatusStore().markFirstUserCreated()

    const router = freshRouter()
    await router.push('/welcome')

    expect(router.currentRoute.value.name).toBe('all-set')
  })

  it('redirects /setup-account to / once the first user has been created', async () => {
    useBootStatusStore().markFirstUserCreated()

    const router = freshRouter()
    await router.push('/setup-account')

    expect(router.currentRoute.value.name).toBe('all-set')
  })

  it('redirects / to /welcome while no first user exists yet', async () => {
    useBootStatusStore().firstUserCreated = false

    const router = freshRouter()
    await router.push('/')

    expect(router.currentRoute.value.name).toBe('welcome')
  })

  it('allows /setup-account while no first user exists yet', async () => {
    useBootStatusStore().firstUserCreated = false

    const router = freshRouter()
    await router.push('/setup-account')

    expect(router.currentRoute.value.name).toBe('setup-account')
  })
})
