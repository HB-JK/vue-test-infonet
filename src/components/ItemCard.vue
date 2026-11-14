<template>
    <div class="p-2 border border-gray-300 rounded-md shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-1">
            <div class="flex items-center gap-1">
                <input
                    type="checkbox"
                    class="w-4 h-4"
                    :checked="isSelected"
                    @change="toggleSelect"
                    :disabled="item.stock <= 0"
                    :class="{
                        'opacity-50 cursor-not-allowed': item.stock <= 0,
                        'cursor-pointer': item.stock > 0,
                    }"
                />
                <div class="px-1">
                    <h2 class="text-lg font-bold">
                        {{ item.name }}
                        <span :class="`text-sm text-${item.stock < 1 ? 'red' : 'green'}-500`"
                            >({{ item.stock < 1 ? 'Stok Habis' : `${item.stock} tersisa` }})</span
                        >
                    </h2>
                    <p class="text-sm text-gray-500">{{ priceFormat(item.price) }}</p>
                    <p class="text-left">
                        <span>Total Harga: {{ priceFormat(item.price * item.qty) }}</span>
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-1">
                <button
                    type="button"
                    class="px-2 py-1 bg-red-500 text-white rounded-md disabled:pointer-events-none"
                    @click="decreaseQty"
                    :disabled="!canDecrease"
                    :class="{ 'opacity-50 cursor-not-allowed': !canDecrease }"
                >
                    <MinusCircleIcon class="w-4 h-4" />
                </button>
                <p class="text-sm text-gray-500 border border-gray-300 rounded-md px-2 py-1">
                    {{ item.qty }}
                </p>
                <button
                    type="button"
                    class="px-2 py-1 bg-blue-500 text-white rounded-md disabled:pointer-events-none"
                    @click="increaseQty"
                    :disabled="!canIncrease"
                    :class="{ 'opacity-50 cursor-not-allowed': !canIncrease }"
                >
                    <PlusCircleIcon class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CartItem } from '../types/cart'
import { priceFormat } from '../utils/priceFormat'
import { canDecreaseQty, canIncreaseQty, clampCartQty } from '../utils/cartQty'
import { MinusCircleIcon, PlusCircleIcon } from '@heroicons/vue/24/outline'
import { useCartStore } from '../stores/cart.store'
import { computed } from 'vue'

const cartStore = useCartStore()

const props = defineProps<{
    item: CartItem
}>()

const canDecrease = computed(() => canDecreaseQty(props.item.qty))
const canIncrease = computed(() => canIncreaseQty(props.item.qty, props.item.stock))

const isSelected = computed(() =>
  cartStore.selectedItems.some((i) => i.sku === props.item.sku),
)

const increaseQty = () => {
    const next = clampCartQty(props.item.qty + 1, props.item.stock)
    if (next === props.item.qty) return
    cartStore.setCartQty(props.item.sku, next)
}

const decreaseQty = () => {
    const next = clampCartQty(props.item.qty - 1, props.item.stock)
    if (next === props.item.qty) return
    cartStore.setCartQty(props.item.sku, next)
}

const toggleSelect = () => {
    if (isSelected.value) {
        cartStore.unselectItem(props.item)
    } else if (props.item.stock > 0) {
        cartStore.selectItem(props.item)
    }
}
</script>

<style scoped>
</style>
