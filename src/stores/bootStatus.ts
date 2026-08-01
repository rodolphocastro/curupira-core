import { ref } from 'vue'
import { defineStore } from 'pinia'
import { pb } from '@/lib/pocketbase'

/**
 * Tracks the instance-wide gates from the `settings` singleton — whether the first user has
 * been created (docs/specs/first-user-creation.md) and whether instance defaults have been set
 * (docs/specs/set-up-defaults.md). Backed by public-readable `settings` fields rather than the
 * `users` collection, since `users` isn't listable before login.
 */
export const useBootStatusStore = defineStore('bootStatus', () => {
  /** `null` = not checked yet, `false` = no settings record (or flag unset), `true` = set. */
  const firstUserCreated = ref<boolean | null>(null)
  /** `null` = not checked yet, `false` = defaults not set, `true` = instance is ready to work. */
  const readyToWork = ref<boolean | null>(null)

  /** Fetches the current `settings` flags from PocketBase and updates local state. */
  async function refresh() {
    try {
      const record = await pb.collection('settings').getFirstListItem('')
      firstUserCreated.value = Boolean(record.firstUserCreated)
      readyToWork.value = Boolean(record.readyToWork)
    } catch {
      firstUserCreated.value = false
      readyToWork.value = false
    }
    return firstUserCreated.value
  }

  /** Sets local state to `true` without a round-trip, right after the flag was just written. */
  function markFirstUserCreated() {
    firstUserCreated.value = true
  }

  /** Sets local state to `true` without a round-trip, right after the flag was just written. */
  function markReadyToWork() {
    readyToWork.value = true
  }

  return { firstUserCreated, readyToWork, refresh, markFirstUserCreated, markReadyToWork }
})
