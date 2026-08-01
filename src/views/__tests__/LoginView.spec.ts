import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginView from '../LoginView.vue'

const pushMock = vi.fn<(path: string) => void>()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
}))

const usersAuth = vi.fn<(email: string, password: string) => Promise<unknown>>()

vi.mock('@/lib/pocketbase', () => ({
  pb: {
    collection: (name: string) => {
      if (name === 'users') return { authWithPassword: usersAuth }
      throw new Error(`unexpected collection "${name}"`)
    },
  },
}))

async function fillAndSubmit(
  wrapper: ReturnType<typeof mount>,
  options: { email?: string; password?: string } = {},
) {
  const email = options.email ?? 'tester@test.com'
  const password = options.password ?? 'Not_S@f3_!!'
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
  await wrapper.find('form').trigger('submit.prevent')
  await flushPromises()
}

describe('LoginView', () => {
  beforeEach(() => {
    pushMock.mockReset()
    usersAuth.mockReset()
  })

  it('authenticates and navigates home on valid credentials', async () => {
    usersAuth.mockResolvedValue({})

    const wrapper = mount(LoginView)
    await fillAndSubmit(wrapper)

    expect(usersAuth).toHaveBeenCalledWith('tester@test.com', 'Not_S@f3_!!')
    expect(pushMock).toHaveBeenCalledWith('/')
  })

  it('shows a generic error and stays on the page on invalid credentials', async () => {
    usersAuth.mockRejectedValue(new Error('Failed to authenticate.'))

    const wrapper = mount(LoginView)
    await fillAndSubmit(wrapper, { password: 'wrong-password' })

    expect(wrapper.text()).toContain('Invalid email or password.')
    expect(wrapper.text()).not.toContain('Failed to authenticate.')
    expect(pushMock).not.toHaveBeenCalled()
  })
})
