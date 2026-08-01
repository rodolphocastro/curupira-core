import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { createAppRouter } from '../index'
import { useBootStatusStore } from '@/stores/bootStatus'

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: vi.fn<(name: string) => unknown>(),
    authStore: { isValid: false },
  },
}))

import { pb } from '@/lib/pocketbase'

/** Builds an isolated router instance (in-memory history) so tests don't share navigation state. */
function freshRouter() {
  return createAppRouter(createMemoryHistory())
}

/** `pb.authStore.isValid` is a readonly getter on the real type; the mock object is plain and mutable. */
function setAuthenticated(value: boolean) {
  ;(pb.authStore as { isValid: boolean }).isValid = value
}

describe('router guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    setAuthenticated(false)
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

  it('redirects /welcome to /login once the first user exists and no one is authenticated', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = false

    const router = freshRouter()
    await router.push('/welcome')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects /welcome to / once the first user exists and someone is authenticated', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = true
    setAuthenticated(true)

    const router = freshRouter()
    await router.push('/welcome')

    expect(router.currentRoute.value.name).toBe('all-set')
  })

  it('redirects / to /login while unauthenticated', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = true

    const router = freshRouter()
    await router.push('/')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects /setup-defaults to /login while unauthenticated', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = false

    const router = freshRouter()
    await router.push('/setup-defaults')

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('redirects authenticated users to /setup-defaults while instance defaults are not set', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = false
    setAuthenticated(true)

    const router = freshRouter()
    await router.push('/')

    expect(router.currentRoute.value.name).toBe('setup-defaults')
  })

  it('allows /setup-defaults for an authenticated user while instance defaults are not set', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = false
    setAuthenticated(true)

    const router = freshRouter()
    await router.push('/setup-defaults')

    expect(router.currentRoute.value.name).toBe('setup-defaults')
  })

  it('redirects /setup-defaults to / once instance defaults are already set', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = true
    setAuthenticated(true)

    const router = freshRouter()
    await router.push('/setup-defaults')

    expect(router.currentRoute.value.name).toBe('all-set')
  })

  it('redirects /login to / for an already-authenticated, fully set-up user', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = true
    setAuthenticated(true)

    const router = freshRouter()
    await router.push('/login')

    expect(router.currentRoute.value.name).toBe('all-set')
  })

  it('allows / for a fully authenticated, fully set-up user', async () => {
    const bootStatus = useBootStatusStore()
    bootStatus.firstUserCreated = true
    bootStatus.readyToWork = true
    setAuthenticated(true)

    const router = freshRouter()
    await router.push('/')

    expect(router.currentRoute.value.name).toBe('all-set')
  })
})
