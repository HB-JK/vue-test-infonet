import { defineStore } from 'pinia'
import type { CartItem, PromoApi } from '../types/cart'
import { clampCartQty } from '../utils/cartQty'
import { useFetchStore } from './fetch.store'
import { useErrorStore } from './error.store'

const QTY_PATCH_DEBOUNCE_MS = 400
const qtyPatchTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [] as CartItem[],
    availablePromos: [] as PromoApi[],
    selectedItems: [] as CartItem[],
    selectedPromo: null as string | null,
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

      console.log(res)
      if (!res || res?.error) {
        this.errorStore.setError(res?.error || { message: "Terjadi Kesalahan Pada Sistem! Tidak dapat mendapatkan data keranjang!", status: 500 })
        return
      }
      this.cart = res.items
    },
    recalculateTotal() {
      this.subtotal = this.selectedItems.reduce((acc, curr) => acc + curr.price * curr.qty, 0)
      this.total = this.subtotal - this.discountPrice + this.deliveryFee
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
      this.recalculateTotal()
    },
    selectPromo(promo: string) {
      this.selectedPromo = promo
    },
  },
})
