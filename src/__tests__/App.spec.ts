import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'

import App from '../App.vue'

function mockFetchResponse(url: string): { ok: true; json: () => Promise<unknown> } {
  if (url.includes('/cart') && !url.includes('/cart/items/')) {
    return {
      ok: true,
      json: async () => ({
        items: [
          {
            sku: 'SKU-001',
            name: 'Kaos Polos Katun',
            price: 85000,
            qty: 1,
            stock: 10,
          },
        ],
        shipping: { fee: 20000, free_above: 450000 },
      }),
    }
  }

  if (url.includes('/vouchers') && !url.includes('/validate')) {
    return {
      ok: true,
      json: async () => ({ data: [] }),
    }
  }

  return {
    ok: true,
    json: async () => ({}),
  }
}

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) =>
        Promise.resolve(mockFetchResponse(String(input))),
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('mounts renders properly', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Cart List')
    expect(wrapper.text()).toContain('Order Summary')
    expect(wrapper.text()).toContain('Kaos Polos Katun')
  })
})