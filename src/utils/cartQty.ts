export function clampCartQty(qty: number, stock: number): number {
  if (stock < 1) {
    return Math.max(0, qty)
  }
  const max = stock
  const min = 1
  return Math.min(Math.max(qty, min), max)
}

export function canDecreaseQty(qty: number): boolean {
  return qty > 1
}

export function canIncreaseQty(qty: number, stock: number): boolean {
  return stock > 0 && qty < stock
}
