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

const label = iconsData.user.label
</script>

<template>
  <BaseIcon :size="size" :color="color" :label="label">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="9.33301" r="4" stroke="currentColor" stroke-width="1.5"/>
      <path
        d="M5.33301 22.667C5.33301 20.4579 7.12387 18.667 9.33301 18.667H22.6663C24.8755 18.667 26.6663 20.4579 26.6663 22.667V26.667H5.33301V22.667Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
  </BaseIcon>
</template>
