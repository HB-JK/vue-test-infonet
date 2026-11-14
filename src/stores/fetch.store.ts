import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { AppError } from './error.store'
import { useErrorStore } from './error.store'
import { handleCartQtyPatchResponse } from '../utils/handleCartQtyPatchResponse'

const BASE_URL = import.meta.env.VITE_API_URL

export type PatchDataResponse<T = unknown> = {
  status: number
  body: T
}

export const useFetchStore = defineStore('fetch', {
  state: () => ({
    error: ref<AppError | null>(null)
  }),
  actions: {
    async fetchData(url: string) {
      try {
        const response = await fetch(`${BASE_URL}/${url}`)
        if (!response.ok) {
          throw new Error(`Terjadi Kesalahan Pada Sistem!`)
        }

        const res = await response.json()
        return res
      } catch (error: any) {
        console.log(error)
        this.error = { message: error.message, status: error.status }
        return null
      }
    },
    async postData(url: string, data: any) {
      try {
        const response = await fetch(`${BASE_URL}/${url}`, {
          method: 'POST',
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const res = await response.json()
        return res
      } catch (error: any) {
        this.error = error
      }
    },
    async putData(url: string, data: any) {
      try {
        const response = await fetch(`${BASE_URL}/${url}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const res = await response.json()
        return res
      } catch (error: any) {
        this.error = error
      }
    },
    async patchData(url: string, data: any): Promise<PatchDataResponse | null> {
      const errorStore = useErrorStore()
      try {
        const response = await fetch(`${BASE_URL}/${url}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })

        const body = await response.json()

        if (!response.ok) {
          const payload: AppError = {
            message:
              typeof body?.message === 'string'
                ? body.message
                : 'Terjadi Kesalahan Pada Sistem!',
            status: response.status,
            reason: body?.error ?? body?.reason,
          }
          this.error = payload
          errorStore.setError(payload)
          return null
        }

        if (url.startsWith('cart/items/')) {
          const sku = url.slice('cart/items/'.length)
          handleCartQtyPatchResponse(sku, body, response.status)
        }

        return { status: response.status, body }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Terjadi Kesalahan Pada Sistem!'
        const payload: AppError = { message, status: 0 }
        this.error = payload
        errorStore.setError(payload)
        return null
      }
    }
  }
})
