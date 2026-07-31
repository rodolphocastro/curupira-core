import { ref } from 'vue'
import { defineStore } from 'pinia'
import { pb } from '@/lib/pocketbase'

export const useBootStatusStore = defineStore('bootStatus', () => {
  // null = not checked yet, false = no settings record (or firstUserCreated not set), true = set
  const firstUserCreated = ref<boolean | null>(null)

  async function refresh() {
    try {
      const record = await pb.collection('settings').getFirstListItem('')
      firstUserCreated.value = Boolean(record.firstUserCreated)
    } catch {
      firstUserCreated.value = false
    }
    return firstUserCreated.value
  }

  function markFirstUserCreated() {
    firstUserCreated.value = true
  }

  return { firstUserCreated, refresh, markFirstUserCreated }
})
