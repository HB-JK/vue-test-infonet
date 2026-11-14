<template>
    <div class="p-4 border border-gray-300 rounded-md shadow-md flex flex-col gap-2">
        <h1 class="text-lg font-bold">Order Summary</h1>
        <div class="flex items-center justify-between">
            <p class="text-sm text-gray-500">Subtotal</p>
            <p class="text-sm text-gray-500">{{ priceFormat(cartStore.subtotal) }}</p>
        </div>

        <div
            class="my-2 p-2 border-2 border-gray-300 cursor-pointer hover:shadow-md transition-all duration-300 relative rounded-sm"
            @click="togglePromoModal"
        >
            <div class="flex items-center justify-between">
                <p class="text-sm text-gray-500">Harga Diskon</p>
                <p class="text-sm text-gray-500 flex items-center gap-1">
                    {{ priceFormat(cartStore.discountPrice) }}
                    <ChevronRightIcon class="w-4 h-4 text-gray-500" />
                </p>
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
                class="absolute -bottom-41 left-0 w-full min-h-40 h-full bg-white p-2 border border-gray-300 rounded-sm hidden transition-all duration-300"
                ref="promoPopoverRef"
            >
                <div class="p-2 h-full overflow-y-auto flex flex-col gap-1">
                    <div
                        class="flex justify-between items-center p-1"
                        v-for="promo in voucherStore.availableVouchers"
                        :key="promo.code"
                    >
                        <div
                            class="pr-2 py-1"
                            :class="{
                                'opacity-50 cursor-not-allowed': !isPromoApplicable(promo),
                            }"
                        >
                            <!-- Showing the promo code -->
                            <p class="text-sm" v-if="promo.type === 'free_shipping'">
                                {{ promo.code }} - Gratis ongkir
                            </p>
                            <p class="text-sm" v-else>
                                {{ promo.code }} - Diskon
                                {{
                                    promo.type === 'percent' || promo.type === 'percentage'
                                        ? `${promo.value}%`
                                        : priceFormat(promo.value ?? 0)
                                }}
                            </p>

                            <!-- showing the promo detail -->
                            <div
                                v-if="promo.min_spend != null || promo.max_discount != null"
                                class="text-xs"
                            >
                                <p v-if="promo.min_spend != null">
                                    Min.Pembelian {{ priceFormat(promo.min_spend) }}
                                </p>
                                <p v-if="promo.max_discount != null">
                                    Max Diskon {{ priceFormat(promo.max_discount) }}
                                </p>
                            </div>
                        </div>
                        <div class="pr-2">
                            <button
                                type="button"
                                class="px-2 py-1 bg-amber-500 text-white rounded-md"
                                @click.stop="togglePromo(promo)"
                                :disabled="!isPromoApplicable(promo)"
                                :class="{
                                    'opacity-50 cursor-not-allowed': !isPromoApplicable(promo),
                                    'opacity-100 cursor-pointer': isPromoApplicable(promo),
                                }"
                            >
                                {{ isPromoSelected(promo) ? 'Applied' : 'Apply' }}
                            </button>
                        </div>
                    </div>
                </div>
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
import type { PromoApi } from '@/types/cart'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const cartStore = useCartStore()
const voucherStore = useVoucherStore()

const promoPopoverRef = ref<HTMLElement | null>(null)

const togglePromoModal = () => {
    if (promoPopoverRef.value) {
        promoPopoverRef.value.classList.toggle('hidden')
    }
}

const isPromoSelected = (promo: PromoApi) =>
    cartStore.selectedPromo.some((p) => p.code === promo.code)

const togglePromo = async (promo: PromoApi) => {
    if (isPromoSelected(promo)) {
        cartStore.unselectPromo(promo)
        return
    }
    if (!isPromoApplicable(promo)) return

    const result = await cartStore.selectPromo(promo)
    if (!result?.ok) return
}

const isPromoApplicable = (promo: PromoApi) => {
    if (cartStore.selectedItems.length === 0) return false

    return (
        cartStore.subtotal >= (promo?.min_spend ?? 0) &&
        (cartStore.selectedPromo.length === 0 ||
            cartStore.selectedPromo.some((p) => p.code === promo.code))
    )
}

onMounted(async () => {
    await voucherStore.fetchAvailableVouchers()
})
</script>

<style scoped>
</style>
