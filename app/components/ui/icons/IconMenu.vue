<script setup>
import iconsData from '~/data/icons.json'

const props = defineProps({
  size: {
    type: String,
    default: '2xl'
  },
  color: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'light'].includes(v)
  }
})

const label = iconsData.menu.label
</script>

<template>
  <BaseIcon :size="size" :color="color" :label="label">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.33301 8H26.6663" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.33301 16H26.6663" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.33301 24H26.6663" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </BaseIcon>
</template>
