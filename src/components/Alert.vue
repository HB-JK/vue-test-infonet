<template>
    <div
        v-if="errorStore.error"
        class="mx-4 mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-800 top-20 right-5 absolute flex items-center gap-2"
        role="alert"
    >
        <div class="px-2">
            <p class="font-medium">{{ errorStore.error.message }}</p>
            <p v-if="errorStore.error.reason" class="mt-1 text-sm opacity-90">
                Alasan: {{ errorStore.error.reason }}
            </p>
        </div>

        <button class="cursor-pointer" @click="errorStore.clearError">
            <XMarkIcon name="mdi:close" class="h-4 w-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useErrorStore } from '../stores/error.store'
import { watch } from 'vue'

const errorStore = useErrorStore()

let hideTimer: ReturnType<typeof setTimeout> | null = null

watch(
    () => errorStore.error,
    (err) => {
        if (hideTimer) clearTimeout(hideTimer)
        if (!err) return
        hideTimer = setTimeout(() => errorStore.clearError(), 3000)
    },
    { immediate: true }
)
</script>

<style scoped>
</style>
