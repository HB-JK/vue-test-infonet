import { defineStore } from 'pinia'
import type { CartItem, PromoApi, ShippingApi } from '../types/cart'
import { clampCartQty } from '../utils/cartQty'
import { useFetchStore } from './fetch.store'
import { useErrorStore } from './error.store'
import { useVoucherStore } from './voucher.store'
import type { ValidatePromoResult } from '@/utils/handleVoucherValidateResponse'

const QTY_PATCH_DEBOUNCE_MS = 400
const qtyPatchTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [] as CartItem[],
    availablePromos: [] as PromoApi[],
    selectedItems: [] as CartItem[],
    selectedPromo: [] as PromoApi[],
    shipping: null as ShippingApi | null,
    subtotal: 0,
    discountPrice: 0,
    deliveryFee: 0,
    total: 0,
    errorStore: useErrorStore(),
    fetchStore: useFetchStore(),
  }),
  actions: {
    async fetchCart() {
      const res = await this.fetchStore.fetchData('cart')

      if (!res || res?.error) {
        this.errorStore.setError(res?.error || { message: "Terjadi Kesalahan Pada Sistem! Tidak dapat mendapatkan data keranjang!", status: 500 })
        return
      }
      this.cart = res.items
      this.shipping = res.shipping
    },
    recalculateTotal() {
      this.subtotal = this.selectedItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0)

      const hasFreeShippingPromo = this.selectedPromo.some((p: PromoApi) => p.type === 'free_shipping')

      if (hasFreeShippingPromo) {
        this.deliveryFee = 0
      } else if (this.shipping) {
        const { fee, free_above } = this.shipping
        this.deliveryFee = this.subtotal < free_above ? fee : 0
      } else {
        this.deliveryFee = 0
      }

      this.calculateDiscountPrice()
      this.total = this.subtotal - this.discountPrice + this.deliveryFee;
      this.total = this.total < 0 ? 0 : this.total;
    },
    setCartQty(sku: string, rawQty: number) {
      const item = this.cart.find((i) => i.sku === sku)
      if (!item) return

      const qty = clampCartQty(rawQty, item.stock)
      if (qty === item.qty) return

      this.cart = this.cart.map((i) => (i.sku === sku ? { ...i, qty } : i))
      this.selectedItems = this.selectedItems.map((i) => (i.sku === sku ? { ...i, qty } : i))
      this.recalculateTotal()
      this.scheduleQtyPatch(sku, qty)
    },
    scheduleQtyPatch(sku: string, qty: number) {
      const existing = qtyPatchTimers.get(sku)
      if (existing !== undefined) {
        clearTimeout(existing)
      }

      qtyPatchTimers.set(
        sku,
        setTimeout(() => {
          qtyPatchTimers.delete(sku)
          void this.syncQtyToApi(sku, qty)
        }, QTY_PATCH_DEBOUNCE_MS),
      )
    },
    async syncQtyToApi(sku: string, qty: number) {
      const fetchStore = useFetchStore()
      await fetchStore.patchData(`cart/items/${sku}`, { qty })
    },
    addToCart(item: CartItem) {
      this.cart.push(item)
      this.recalculateTotal()
    },
    removeFromCart(item: CartItem) {
      this.cart = this.cart.filter((i) => i.sku !== item.sku)
      this.recalculateTotal()
    },
    updateCart(item: CartItem, qty: number) {
      this.setCartQty(item.sku, qty)
    },
    selectItem(item: CartItem) {
      this.selectedItems.push(item)
      this.recalculateTotal()
    },
    unselectItem(item: CartItem) {
      this.selectedItems = this.selectedItems.filter((i) => i.sku !== item.sku)
      if (this.selectedItems.length < 1) {
        this.selectedPromo = []
      } else {
        this.selectedPromo = this.selectedPromo.filter(
          (p: PromoApi) => p?.min_spend && p.min_spend < this.selectedItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0)
        )
      }
      this.recalculateTotal()
    },
    async selectPromo(promo: PromoApi): Promise<ValidatePromoResult> {
      const voucherStore = useVoucherStore()
      const result = await voucherStore.validatePromo(promo)
      if (!result.ok) {
        return result
      }
      this.applyPromo(result.voucher)
      return result
    },
    applyPromo(voucher: PromoApi) {
      if (this.selectedPromo.some((p) => p.code === voucher.code)) {
        return
      }
      this.selectedPromo.push(voucher)
      this.recalculateTotal()
    },
    unselectPromo(promo: PromoApi) {
      this.selectedPromo = this.selectedPromo.filter((p: PromoApi) => p.code !== promo.code)
      this.recalculateTotal()
    },
    calculateDiscountPrice() {
      this.discountPrice = this.selectedPromo.reduce((acc: number, curr: PromoApi) => {
        if (curr.type === 'percent' || curr.type === 'percentage') {
          if (curr.max_discount && Math.floor(this.subtotal * Number(curr.value) / 100) > curr.max_discount) {
            return acc + curr.max_discount
          }
          return acc + Math.floor(this.subtotal * Number(curr.value) / 100)
        }
        if (curr.type === 'fixed') {
          return acc + Math.floor(Number(curr.value))
        }
        return acc
      }, 0)
    },
  },
})
