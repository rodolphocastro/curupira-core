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
  getFirstListItem: () => Promise<{ firstUserCreated: boolean; readyToWork: boolean }>,
): SettingsCollection {
  return { getFirstListItem } as unknown as SettingsCollection
}

describe('bootStatus store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(pb.collection).mockReset()
  })

  it('resolves both flags true when the settings record has them set', async () => {
    vi.mocked(pb.collection).mockReturnValue(
      fakeSettingsCollection(() => Promise.resolve({ firstUserCreated: true, readyToWork: true })),
    )

    const store = useBootStatusStore()
    const result = await store.refresh()

    expect(result).toBe(true)
    expect(store.firstUserCreated).toBe(true)
    expect(store.readyToWork).toBe(true)
  })

  it('resolves readyToWork false when the settings record has it unset', async () => {
    vi.mocked(pb.collection).mockReturnValue(
      fakeSettingsCollection(() => Promise.resolve({ firstUserCreated: true, readyToWork: false })),
    )

    const store = useBootStatusStore()
    await store.refresh()

    expect(store.firstUserCreated).toBe(true)
    expect(store.readyToWork).toBe(false)
  })

  it('resolves both flags false when no settings record exists', async () => {
    vi.mocked(pb.collection).mockReturnValue(
      fakeSettingsCollection(() => Promise.reject(new Error('404'))),
    )

    const store = useBootStatusStore()
    const result = await store.refresh()

    expect(result).toBe(false)
    expect(store.firstUserCreated).toBe(false)
    expect(store.readyToWork).toBe(false)
  })

  it('markFirstUserCreated sets state to true without querying PocketBase', () => {
    const store = useBootStatusStore()
    store.markFirstUserCreated()

    expect(store.firstUserCreated).toBe(true)
    expect(pb.collection).not.toHaveBeenCalled()
  })

  it('markReadyToWork sets state to true without querying PocketBase', () => {
    const store = useBootStatusStore()
    store.markReadyToWork()

    expect(store.readyToWork).toBe(true)
    expect(pb.collection).not.toHaveBeenCalled()
  })
})
