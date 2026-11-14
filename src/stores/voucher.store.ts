import { defineStore } from 'pinia'
import { useFetchStore } from './fetch.store'
import { useErrorStore } from './error.store'
import type { PromoApi } from '@/types/cart'
import { useCartStore } from './cart.store'
import {
  handleVoucherValidateResponse,
  type ValidatePromoResult,
  type VoucherValidateBody,
} from '@/utils/handleVoucherValidateResponse'

const currentDate = new Date()

export const useVoucherStore = defineStore('voucher', {
  state: () => ({
    availableVouchers: null as PromoApi[] | null,
    deliveryPromo: null as PromoApi | null,
  }),
  actions: {
    async fetchAvailableVouchers() {
      const fetchStore = useFetchStore()
      const errorStore = useErrorStore()
      const res = await fetchStore.fetchData('vouchers')

      if (!res || res?.error) {
        errorStore.setError(
          res?.error || {
            message:
              'Terjadi Kesalahan Pada Sistem! Tidak dapat mendapatkan data voucher!',
            status: 500,
          },
        )
        return
      }

      this.availableVouchers = res.data.filter(
        (promo: PromoApi) =>
          promo.active &&
          new Date(promo.expires_at).getTime() > currentDate.getTime(),
      )
    },
    async validatePromo(promo: PromoApi): Promise<ValidatePromoResult> {
      try {
        const cartStore = useCartStore()
        const fetchStore = useFetchStore()
        const res = await fetchStore.postData('vouchers/validate', {
          code: promo.code,
          subtotal: cartStore.subtotal,
        })

        if (res == null || typeof res !== 'object') {
          return { ok: false }
        }

        return handleVoucherValidateResponse(res as VoucherValidateBody, 200)
      } catch {
        return { ok: false }
      }
    },
  },
})