import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SetupDefaultsView from '../SetupDefaultsView.vue'

const pushMock = vi.fn<(path: string) => void>()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const settingsGetFirstListItem = vi.fn<() => Promise<{ id: string }>>()
const settingsUpdate =
  vi.fn<
    (
      id: string,
      data: { instanceName: string; allowUserSignUp: boolean; readyToWork: boolean },
    ) => Promise<unknown>
  >()

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: (name: string) => {
      if (name === 'settings') {
        return { getFirstListItem: settingsGetFirstListItem, update: settingsUpdate }
      }
      throw new Error(`unexpected collection "${name}"`)
    },
  },
}))

async function fillAndSubmit(
  wrapper: ReturnType<typeof mount>,
  options: { instanceName?: string; allowUserSignUp?: boolean } = {},
) {
  const instanceName = options.instanceName ?? 'Acme-Corp_1.0'
  await wrapper.find('#instance-name-input').setValue(instanceName)
  if (options.allowUserSignUp) {
    await wrapper.find('#self-sign-up-input').setValue(true)
  }
  await wrapper.find('form').trigger('submit.prevent')
  await flushPromises()
}

describe('SetupDefaultsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockReset()
    settingsGetFirstListItem.mockReset()
    settingsUpdate.mockReset()
  })

  it('saves the defaults and navigates home on valid input', async () => {
    settingsGetFirstListItem.mockResolvedValue({ id: 'settings-record-id' })
    settingsUpdate.mockResolvedValue({})

    const wrapper = mount(SetupDefaultsView)
    await fillAndSubmit(wrapper, { allowUserSignUp: true })

    expect(settingsUpdate).toHaveBeenCalledWith('settings-record-id', {
      instanceName: 'Acme-Corp_1.0',
      allowUserSignUp: true,
      readyToWork: true,
    })
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('rejects a blank instance name without calling PocketBase', async () => {
    const wrapper = mount(SetupDefaultsView)
    await fillAndSubmit(wrapper, { instanceName: '' })

    expect(wrapper.text()).toContain('Instance Name is required')
    expect(settingsGetFirstListItem).not.toHaveBeenCalled()
    expect(settingsUpdate).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('rejects an instance name with disallowed characters without calling PocketBase', async () => {
    const wrapper = mount(SetupDefaultsView)
    await fillAndSubmit(wrapper, { instanceName: 'Acme Corp!' })

    expect(wrapper.text()).toContain('Instance Name is required')
    expect(settingsUpdate).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
