// Types for the cart API response
export type CartItemApi = {
  sku: string
  name: string
  price: number | string
  qty?: number
  quantity?: number
  stock?: number
  stok?: number
}

export type PromoApi = {
  code: string
  type: 'percent' | 'fixed'
  value: number | string
  max_discount: number | null
  min_spend: number
  expires_at: string
  active: boolean
}

export type ShippingApi = {
  fee: number
  free_above: number
}

export type CartApiResponse = {
  items: CartItemApi[]
  shipping: ShippingApi
}

/** What the UI and cart store should use after normalization */
export type CartItem = {
  sku: string
  name: string
  price: number
  qty: number
  stock: number
}

export type Cart = {
  items: CartItem[]
  shipping: ShippingApi
}
