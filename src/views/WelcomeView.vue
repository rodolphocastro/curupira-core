<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const appVersion = __APP_VERSION__

function goToSetup() {
  router.push('/setup-account')
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div class="space-y-1 text-center">
        <h1 class="text-2xl font-semibold text-slate-900">Welcome to Curupira</h1>
        <p class="text-sm text-slate-500">Let's get your instance set up.</p>
      </div>

      <dl class="space-y-2 rounded-md bg-slate-50 p-4 text-sm">
        <div class="flex justify-between">
          <dt class="text-slate-500">Current Curupira Version</dt>
          <dd class="font-medium text-slate-900">{{ appVersion }}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-slate-500">Status of Migrations</dt>
          <dd class="font-medium text-green-600">Healthy</dd>
        </div>
      </dl>

      <button
        type="button"
        class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        @click="goToSetup"
      >
        Set Curupira Up
      </button>
    </div>
  </main>
</template>
