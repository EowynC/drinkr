<template>
    <button @click="emit('sold')">
        {{ name }}
    </button>
</template>

<script setup lang="ts">
    defineProps<{
        name:  string
    }>()

    const emit = defineEmits<{
        sold: []
    }>()
</script>