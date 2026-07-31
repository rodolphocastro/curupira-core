import { ref } from 'vue'
import { defineStore } from 'pinia'
import { pb } from '@/lib/pocketbase'

/**
 * Tracks whether Curupira's first user has already been created, per
 * docs/specs/first-user-creation.md. Backed by the public-readable `settings.firstUserCreated`
 * flag rather than the `users` collection, since `users` isn't listable before login.
 */
export const useBootStatusStore = defineStore('bootStatus', () => {
  /** `null` = not checked yet, `false` = no settings record (or flag unset), `true` = set. */
  const firstUserCreated = ref<boolean | null>(null)

  /** Fetches the current `firstUserCreated` flag from PocketBase and updates local state. */
  async function refresh() {
    try {
      const record = await pb.collection('settings').getFirstListItem('')
      firstUserCreated.value = Boolean(record.firstUserCreated)
    } catch {
      firstUserCreated.value = false
    }
    return firstUserCreated.value
  }

  /** Sets local state to `true` without a round-trip, right after the flag was just written. */
  function markFirstUserCreated() {
    firstUserCreated.value = true
  }

  return { firstUserCreated, refresh, markFirstUserCreated }
})
