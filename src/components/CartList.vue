<template>
    <div class="px-3">
        <h1 class="text-2xl font-bold">Cart List</h1>
        <div v-if="isFetching">
            <p>Loading...</p>
        </div>
        <div v-else-if="cartStore.cart.length > 0" class="flex flex-col gap-2">
            <div v-for="item in cartStore.cart" :key="item.sku">
                <ItemCard :item="item" />
            </div>
        </div>
        <div v-else>
            <p>No items in cart</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart.store'
import ItemCard from './ItemCard.vue'
import { onMounted, ref } from 'vue'
import { useFetchStore } from '../stores/fetch.store'

const fetchStore = useFetchStore()
const cartStore = useCartStore()

const isFetching = ref(true)

onMounted(async () => {
    await cartStore.fetchCart()
    isFetching.value = false
})
</script>

<style scoped>
</style>
