<script setup>
defineProps({
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  label: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="base-spinner" :class="`base-spinner--${size}`" role="status" aria-live="polite">
    <span class="base-spinner__circle" aria-hidden="true" />
    <span v-if="label" class="base-spinner__label">{{ label }}</span>
    <span class="sr-only">{{ label || '로딩 중' }}</span>
  </div>
</template>
