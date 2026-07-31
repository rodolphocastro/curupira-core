import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useBootStatusStore } from '../bootStatus'

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: vi.fn<(name: string) => unknown>(),
  },
}))

import { pb } from '@/lib/pocketbase'

type SettingsCollection = ReturnType<typeof pb.collection>

/** Builds a fake `settings` RecordService backed only by the `getFirstListItem` behavior under test. */
function fakeSettingsCollection(
  getFirstListItem: () => Promise<{ firstUserCreated: boolean }>,
): SettingsCollection {
  return { getFirstListItem } as unknown as SettingsCollection
}

describe('bootStatus store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(pb.collection).mockReset()
  })

  it('resolves true when a settings record exists', async () => {
    vi.mocked(pb.collection).mockReturnValue(
      fakeSettingsCollection(() => Promise.resolve({ firstUserCreated: true })),
    )

    const store = useBootStatusStore()
    const result = await store.refresh()

    expect(result).toBe(true)
    expect(store.firstUserCreated).toBe(true)
  })

  it('resolves false when no settings record exists', async () => {
    vi.mocked(pb.collection).mockReturnValue(
      fakeSettingsCollection(() => Promise.reject(new Error('404'))),
    )

    const store = useBootStatusStore()
    const result = await store.refresh()

    expect(result).toBe(false)
    expect(store.firstUserCreated).toBe(false)
  })

  it('markFirstUserCreated sets state to true without querying PocketBase', () => {
    const store = useBootStatusStore()
    store.markFirstUserCreated()

    expect(store.firstUserCreated).toBe(true)
    expect(pb.collection).not.toHaveBeenCalled()
  })
})
