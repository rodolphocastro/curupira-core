<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { pb } from '@/lib/pocketbase'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

async function onSubmit() {
  error.value = null
  submitting.value = true

  try {
    await pb.collection('users').authWithPassword(email.value, password.value)
    router.push('/')
  } catch {
    // Deliberately generic: never reveal whether the email or the password was wrong.
    error.value = 'Invalid email or password.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <form
      class="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-semibold text-slate-900">Log In</h1>
        <p class="text-sm text-slate-500">Sign in to your Curupira account.</p>
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
            autocomplete="current-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        Log In
      </button>
    </form>
  </main>
</template>
