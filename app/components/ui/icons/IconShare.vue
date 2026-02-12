<script setup>
import iconsData from '~/data/icons.json'

const props = defineProps({
  size: {
    type: String,
    default: 'lg'
  },
  color: {
    type: String,
    default: 'default'
  }
})

const label = iconsData.share.label
</script>

<template>
  <BaseIcon :size="size" :color="color" :label="label">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6.5" cy="12.5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="17.5" cy="6.5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M9 11L15 7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 14L15 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </BaseIcon>
</template>
