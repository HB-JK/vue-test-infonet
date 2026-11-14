<template>
    <div class="p-4 border border-gray-300 rounded-md shadow-md flex flex-col gap-2">
        <h1 class="text-lg font-bold">Order Summary</h1>
        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Subtotal</p>
            <p class="text-sm text-gray-500">{{ priceFormat(cartStore.subtotal) }}</p>
        </div>

        <div
            class="my-2 p-2 border-2 border-gray-300 cursor-pointer hover:shadow-md transition-all duration-300 relative"
            @click="openPromoModal"
        >
            <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">Harga Diskon</p>
                <p class="text-sm text-gray-500">{{ priceFormat(cartStore.discountPrice) }}</p>
            </div>
            <div class="flex items-center justify-between gap-1">
                <p class="text-sm text-gray-500">
                    {{ cartStore.selectedPromo.length }} Promo yang terpilih
                </p>
                <p class="text-sm text-gray-500">
                    {{ cartStore.selectedPromo.map((p) => p.code).join(', ') }}
                </p>
            </div>

            <div
                class="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                ref="promoPopoverRef"
            >
                <p class="text-sm text-white">
                    {{ cartStore.selectedPromo.length }}
                </p>
            </div>
        </div>

        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Biaya Pengiriman</p>
            <p class="text-sm text-gray-500">{{ priceFormat(cartStore.deliveryFee) }}</p>
        </div>

        <div class="flex items-center justify-between">
            <p class="text-l font-semibold text-gray-500">Total</p>
            <p class="text-sm text-gray-500 font-semibold">
                {{ priceFormat(cartStore.total) }}
            </p>
        </div>

        <button type="button" class="px-4 py-2 bg-blue-500 text-white rounded-md">Checkout</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useCartStore } from '../stores/cart.store'
import { priceFormat } from '../utils/priceFormat'
import { useVoucherStore } from '@/stores/voucher.store'

const cartStore = useCartStore()
const voucherStore = useVoucherStore()

const promoPopoverRef = ref<HTMLElement | null>(null)

const openPromoModal = () => {
    console.log('openPromoModal')
    if (promoPopoverRef.value) {
        promoPopoverRef.value.style.display = 'block'
    }
}

onMounted(async () => {
    await voucherStore.fetchAvailableVouchers()
})
</script>

<style scoped>
</style>
