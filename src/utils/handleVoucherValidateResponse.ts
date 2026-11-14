import type { PromoApi } from '@/types/cart'
import { useErrorStore } from '../stores/error.store'
import { priceFormat } from './priceFormat'

export type VoucherValidateReason =
  | 'NOT_FOUND'
  | 'INACTIVE'
  | 'EXPIRED'
  | 'MIN_SPEND'

export type VoucherValidateBody = {
  valid: boolean
  reason?: VoucherValidateReason | string
  voucher?: PromoApi
  min_spend?: number
  expires_at?: string
  message?: string
}

export type ValidatePromoResult =
  | { ok: true; voucher: PromoApi }
  | { ok: false }

function messageForVoucherReason(
  reason: string,
  body: VoucherValidateBody,
): string {
  switch (reason) {
    case 'NOT_FOUND':
      return 'Kode voucher tidak ditemukan.'
    case 'INACTIVE':
      return 'Voucher tidak aktif.'
    case 'EXPIRED':
      return body.expires_at
        ? `Voucher sudah kedaluwarsa (berlaku sampai ${body.expires_at}).`
        : 'Voucher sudah kedaluwarsa.'
    case 'MIN_SPEND':
      return typeof body.min_spend === 'number'
        ? `Subtotal belum mencapai minimal belanja ${priceFormat(body.min_spend)}.`
        : 'Subtotal belum mencapai minimal belanja untuk voucher ini.'
    default:
      return body.message ?? 'Voucher tidak dapat digunakan.'
  }
}

/** Handles POST /vouchers/validate (HTTP 200 with valid true/false). */
export function handleVoucherValidateResponse(
  body: VoucherValidateBody,
  httpStatus: number,
): ValidatePromoResult {
  const errorStore = useErrorStore()

  if (body.valid === true && body.voucher) {
    errorStore.clearError()
    return { ok: true, voucher: body.voucher }
  }

  if (body.valid === false && body.reason) {
    const reason = body.reason
    errorStore.setError({
      message: messageForVoucherReason(reason, body),
      status: httpStatus,
      reason,
    })
    return { ok: false }
  }

  errorStore.setError({
    message: body.message ?? 'Respons validasi voucher tidak dikenali.',
    status: httpStatus,
    reason: body.reason,
  })
  return { ok: false }
}