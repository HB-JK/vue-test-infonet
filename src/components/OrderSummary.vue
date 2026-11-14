<template>
    <div class="p-4 border border-gray-300 rounded-md shadow-md flex flex-col gap-2">
        <h1 class="text-lg font-bold">Order Summary</h1>
        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Subtotal</p>
            <p class="text-sm text-gray-500">{{ priceFormat(cartStore.subtotal) }}</p>
        </div>

        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Pilih Promo</p>
            <p class="text-sm text-gray-500">{{ priceFormat(cartStore.discountPrice) }}</p>
        </div>

        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Biaya Pengiriman</p>
            <p class="text-sm text-gray-500">{{ priceFormat(cartStore.deliveryFee) }}</p>
        </div>

        <button type="button" class="px-4 py-2 bg-blue-500 text-white rounded-md">Checkout</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useCartStore } from '../stores/cart.store'
import { priceFormat } from '../utils/priceFormat'
import { useVoucherStore } from '@/stores/voucher.store'

const cartStore = useCartStore()
const voucherStore = useVoucherStore()

onMounted(async () => {
    await voucherStore.fetchAvailableVouchers()
})
</script>

<style scoped>
</style>
