import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SetupAccountView from '../SetupAccountView.vue'

const pushMock = vi.fn<(path: string) => void>()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const usersCreate =
  vi.fn<(data: { email: string; password: string; passwordConfirm: string }) => Promise<unknown>>()
const usersAuth = vi.fn<(email: string, password: string) => Promise<unknown>>()
const settingsCreate = vi.fn<(data: { firstUserCreated: boolean }) => Promise<unknown>>()

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: (name: string) => {
      if (name === 'users') return { create: usersCreate, authWithPassword: usersAuth }
      if (name === 'settings') return { create: settingsCreate }
      throw new Error(`unexpected collection "${name}"`)
    },
  },
}))

/** Fills the Create User form (defaulting to valid credentials) and submits it. */
async function fillAndSubmit(
  wrapper: ReturnType<typeof mount>,
  options: { email?: string; password?: string; passwordConfirm?: string } = {},
) {
  const password = options.password ?? 'Not_S@f3_!!'
  const email = options.email ?? 'tester@test.com'
  const passwordConfirm = options.passwordConfirm ?? password
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
  await wrapper.find('#passwordConfirm').setValue(passwordConfirm)
  await wrapper.find('form').trigger('submit.prevent')
  await flushPromises()
}

describe('SetupAccountView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    pushMock.mockReset()
    usersCreate.mockReset()
    usersAuth.mockReset()
    settingsCreate.mockReset()
  })

  it('creates the user, logs them in, records the settings flag, and navigates home', async () => {
    usersCreate.mockResolvedValue({})
    usersAuth.mockResolvedValue({})
    settingsCreate.mockResolvedValue({})

    const wrapper = mount(SetupAccountView)
    await fillAndSubmit(wrapper)

    expect(usersCreate).toHaveBeenCalledWith({
      email: 'tester@test.com',
      password: 'Not_S@f3_!!',
      passwordConfirm: 'Not_S@f3_!!',
    })
    expect(usersAuth).toHaveBeenCalledWith('tester@test.com', 'Not_S@f3_!!')
    expect(settingsCreate).toHaveBeenCalledWith({ firstUserCreated: true })
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('shows an error and stays on the page when account creation fails', async () => {
    usersCreate.mockRejectedValue(new Error('Failed to create record.'))

    const wrapper = mount(SetupAccountView)
    await fillAndSubmit(wrapper, { password: '123', passwordConfirm: '123' })

    expect(wrapper.text()).toContain('Failed to create record.')
    expect(usersAuth).not.toHaveBeenCalled()
    expect(settingsCreate).not.toHaveBeenCalled()
    expect(pushMock).not.toHaveBeenCalled()
  })
})
