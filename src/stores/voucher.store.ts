import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useFetchStore } from './fetch.store'
import { useErrorStore } from './error.store'
import type { PromoApi } from '@/types/cart'

const currentDate = new Date();

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    availableVouchers: null as PromoApi[] | null,
    deliveryPromo: null as PromoApi | null,
    fetchStore: useFetchStore(),
    errorStore: useErrorStore()
  }),
  actions: {
    async fetchAvailableVouchers() {
      const res = await this.fetchStore.fetchData('vouchers')
      if (!res || res?.error) {
        this.errorStore.setError(res.error || { message: "Terjadi Kesalahan Pada Sistem! Tidak dapat mendapatkan data voucher!", status: 500 })
        return
      }
      this.availableVouchers = res.promos.filter((promo: PromoApi) =>
        promo.active &&
        new Date(promo.expires_at) < currentDate
      )
    }
  }
})
