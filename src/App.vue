<template>
    <Alert />
    <div class="flex flex-wrap m-4 max-w-7xl mx-auto">
        <div class="w-2/3">
            <CartList />
        </div>
        <div class="w-1/3">
            <OrderSummary />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Alert from './components/Alert.vue'
import CartList from './components/CartList.vue'
import OrderSummary from './components/OrderSummary.vue'

const count = ref(0)
</script>

<style scoped>
h1 {
    color: red;
}
</style>
