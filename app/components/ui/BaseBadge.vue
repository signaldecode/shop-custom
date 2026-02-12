<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'primary', 'secondary', 'success', 'best', 'best-dark', 'new', 'sale', 'discount'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'product'].includes(v)
  }
})

const badgeClasses = computed(() => [
  'base-badge',
  `base-badge--variant-${props.variant}`,
  `base-badge--size-${props.size}`
])
</script>

<template>
  <span :class="badgeClasses">{{ label }}</span>
</template>
