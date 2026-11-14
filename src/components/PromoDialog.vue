<template>
    <Dialog>
        <DialogPanel>
            <DialogTitle>Promo Dialog</DialogTitle>
        </DialogPanel>
    </Dialog>
</template>

<script setup lang="ts">
import { useVoucherStore } from '@/stores/voucher.store'

const voucherStore = useVoucherStore()

onMounted(async () => {
    await voucherStore.fetchAvailableVouchers()
})
</script>

<style scoped>
</style>
