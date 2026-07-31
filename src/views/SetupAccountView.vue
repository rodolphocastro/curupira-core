<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClientResponseError } from 'pocketbase'
import { pb } from '@/lib/pocketbase'
import { useBootStatusStore } from '@/stores/bootStatus'

const router = useRouter()
const bootStatus = useBootStatusStore()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

async function onSubmit() {
  error.value = null
  submitting.value = true

  try {
    await pb.collection('users').create({
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
    })
    await pb.collection('users').authWithPassword(email.value, password.value)
    await pb.collection('settings').create({ firstUserCreated: true })
    bootStatus.markFirstUserCreated()
    router.push('/')
  } catch (err) {
    error.value = describeError(err)
  } finally {
    submitting.value = false
  }
}

function describeError(err: unknown): string {
  if (err instanceof ClientResponseError) {
    const fieldMessages = Object.values(err.response.data ?? {})
      .map((field) =>
        typeof field === 'object' && field && 'message' in field ? field.message : null,
      )
      .filter((message): message is string => typeof message === 'string')

    if (fieldMessages.length > 0) return fieldMessages.join(' ')
    return err.message
  }

  return err instanceof Error ? err.message : 'Failed to create the account.'
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <form
      class="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-semibold text-slate-900">Set Up Your Account</h1>
        <p class="text-sm text-slate-500">Create the first user for this Curupira instance.</p>
      </div>

      <p v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

      <div class="space-y-4">
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div class="space-y-1">
          <label for="passwordConfirm" class="block text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            id="passwordConfirm"
            v-model="passwordConfirm"
            type="password"
            required
            autocomplete="new-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        Create User
      </button>
    </form>
  </main>
</template>
