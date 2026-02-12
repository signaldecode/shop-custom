<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'].includes(v)
  },
  color: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'light', 'disabled', 'primary', 'muted'].includes(v)
  },
  label: {
    type: String,
    required: true
  },
  decorative: {
    type: Boolean,
    default: false
  }
})

const ariaAttrs = computed(() => {
  if (props.decorative) {
    return { 'aria-hidden': 'true' }
  }
  return { 'role': 'img', 'aria-label': props.label }
})
</script>

<template>
  <span
    class="base-icon"
    :class="[`base-icon--size-${size}`, `base-icon--color-${color}`]"
    v-bind="ariaAttrs"
  >
    <slot />
  </span>
</template>
