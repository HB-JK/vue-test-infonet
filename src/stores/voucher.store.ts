import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFetchStore } from './fetch.store'
import { useErrorStore } from './error.store'
import type { PromoApi } from '@/types/cart'
import { useCartStore } from './cart.store'

const currentDate = new Date();

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    availableVouchers: null as PromoApi[] | null,
    deliveryPromo: null as PromoApi | null,
    fetchStore: useFetchStore(),
    errorStore: useErrorStore(),
    cartStore: useCartStore(),
  }),
  actions: {
    async fetchAvailableVouchers() {
      const res = await this.fetchStore.fetchData('vouchers')

      if (!res || res?.error) {
        this.errorStore.setError(res.error || { message: "Terjadi Kesalahan Pada Sistem! Tidak dapat mendapatkan data voucher!", status: 500 })
        return
      }

      this.availableVouchers = res.data.filter((promo: PromoApi) =>
        promo.active && new Date(promo.expires_at).toISOString() > currentDate.toISOString()
      )
    },
    async validatePromo(promo: PromoApi) {
      const res = await this.fetchStore.postData('vouchers/validate', {
        code: promo.code,
        subtotal: this.cartStore.subtotal,
      })

      if (!res || res?.error) {
        this.errorStore.setError(res.error || { message: "Terjadi Kesalahan Pada Sistem! Tidak dapat memvalidasi voucher!", status: 500 })
        return
      }

      return res.data
    },
  }
})
