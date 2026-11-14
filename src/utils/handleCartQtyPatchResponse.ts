import { clampCartQty } from './cartQty'
import { useCartStore } from '../stores/cart.store'
import { useErrorStore } from '../stores/error.store'

type CartQtyPatchBody = {
  error?: string
  available?: number
  qty?: number
  quantity?: number
  message?: string
}

function messageForCartQtyReason(reason: string, body: CartQtyPatchBody): string {
  switch (reason) {
    case 'INSUFFICIENT_STOCK':
      return typeof body.available === 'number'
        ? `Stok tidak mencukupi. Tersedia ${body.available} item.`
        : 'Stok tidak mencukupi.'
    default:
      return body.message ?? 'Gagal memperbarui jumlah barang.'
  }
}

/** Handles PATCH /cart/items/:sku bodies (HTTP 200 success or business error). */
export function handleCartQtyPatchResponse(
  sku: string,
  body: CartQtyPatchBody,
  httpStatus: number,
): void {
  const cartStore = useCartStore()
  const errorStore = useErrorStore()

  if (body.error) {
    const reason = body.error
    if (reason === 'INSUFFICIENT_STOCK' && typeof body.available === 'number') {
      const stock = body.available
      const clamped = clampCartQty(stock, stock)
      cartStore.cart = cartStore.cart.map((i) =>
        i.sku === sku ? { ...i, qty: clamped, stock } : i,
      )
      cartStore.recalculateTotal()
    }
    errorStore.setError({
      message: messageForCartQtyReason(reason, body),
      status: httpStatus
    })
    return
  }

  errorStore.clearError()

  const serverQty = body.qty ?? body.quantity
  if (typeof serverQty === 'number') {
    cartStore.cart = cartStore.cart.map((i) =>
      i.sku === sku ? { ...i, qty: serverQty } : i,
    )
    cartStore.recalculateTotal()
  }
}
