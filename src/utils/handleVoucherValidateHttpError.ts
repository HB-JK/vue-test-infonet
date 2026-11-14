import { useErrorStore } from '../stores/error.store'

type VoucherHttpErrorBody = {
  message?: string
  reason?: string
}

export function handleVoucherValidateHttpError(
  body: VoucherHttpErrorBody | null,
  httpStatus: number,
): void {
  const errorStore = useErrorStore()
  errorStore.setError({
    message:
      body?.message ??
      (httpStatus === 400
        ? 'Permintaan validasi voucher tidak valid.'
        : 'Terjadi kesalahan saat memvalidasi voucher.'),
    status: httpStatus,
    reason: body?.reason,
  })
}
