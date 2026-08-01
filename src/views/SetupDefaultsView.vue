<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClientResponseError } from 'pocketbase'
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'
import { pb } from '@/lib/pocketbase'
import { useBootStatusStore } from '@/stores/bootStatus'

const INSTANCE_NAME_PATTERN = /^[a-zA-Z0-9._-]+$/

const router = useRouter()
const bootStatus = useBootStatusStore()

const instanceName = ref('')
const allowUserSignUp = ref(false)
const error = ref<string | null>(null)
const submitting = ref(false)

async function onSubmit() {
  error.value = null

  if (!INSTANCE_NAME_PATTERN.test(instanceName.value)) {
    error.value =
      'Instance Name is required and may only contain letters, numbers, "-", "_", and ".".'
    return
  }

  submitting.value = true

  try {
    const settings = await pb.collection('settings').getFirstListItem('')
    await pb.collection('settings').update(settings.id, {
      instanceName: instanceName.value,
      allowUserSignUp: allowUserSignUp.value,
      readyToWork: true,
    })
    bootStatus.markReadyToWork()
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

  return err instanceof Error ? err.message : 'Failed to save the instance defaults.'
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <TooltipProvider>
      <form
        class="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200"
        @submit.prevent="onSubmit"
      >
        <div class="space-y-1 text-center">
          <h1 class="text-2xl font-semibold text-slate-900">Set Up Your Instance</h1>
          <p class="text-sm text-slate-500">
            These defaults can still be changed later, but need a starting value now.
          </p>
        </div>

        <p v-if="error" class="rounded-md bg-red-50 p-3 text-sm text-red-700">{{ error }}</p>

        <div class="space-y-4">
          <div class="space-y-1">
            <div class="flex items-center gap-1.5">
              <label for="instance-name-input" class="block text-sm font-medium text-slate-700">
                Instance Name
              </label>
              <TooltipRoot>
                <TooltipTrigger
                  type="button"
                  class="flex size-4 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
                >
                  ?
                </TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent
                    class="max-w-xs rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
                    :side-offset="5"
                  >
                    What should we call your Curupira instance?
                    <TooltipArrow class="fill-slate-900" />
                  </TooltipContent>
                </TooltipPortal>
              </TooltipRoot>
            </div>
            <input
              id="instance-name-input"
              v-model="instanceName"
              type="text"
              required
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div class="flex items-center gap-1.5">
            <input
              id="self-sign-up-input"
              v-model="allowUserSignUp"
              type="checkbox"
              class="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label for="self-sign-up-input" class="block text-sm font-medium text-slate-700">
              Allow Users to Sign-up?
            </label>
            <TooltipRoot>
              <TooltipTrigger
                type="button"
                class="flex size-4 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600"
              >
                ?
              </TooltipTrigger>
              <TooltipPortal>
                <TooltipContent
                  class="max-w-xs rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
                  :side-offset="5"
                >
                  Should we allow users to sign-up on their own?
                  <TooltipArrow class="fill-slate-900" />
                </TooltipContent>
              </TooltipPortal>
            </TooltipRoot>
          </div>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          Save
        </button>
      </form>
    </TooltipProvider>
  </main>
</template>
