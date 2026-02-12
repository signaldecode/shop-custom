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

const label = iconsData.search.label
</script>

<template>
  <BaseIcon :size="size" :color="color" :label="label">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.9997 22.6663C18.7861 22.6663 22.6663 18.7861 22.6663 13.9997C22.6663 9.21321 18.7861 5.33301 13.9997 5.33301C9.21321 5.33301 5.33301 9.21321 5.33301 13.9997C5.33301 18.7861 9.21321 22.6663 13.9997 22.6663Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-miterlimit="10"
      />
      <path
        d="M26.1363 27.197C26.4292 27.4899 26.9041 27.4899 27.197 27.197C27.4899 26.9041 27.4899 26.4292 27.197 26.1363L26.6667 26.6667L26.1363 27.197ZM20 20L19.4697 20.5303L26.1363 27.197L26.6667 26.6667L27.197 26.1363L20.5303 19.4697L20 20Z"
        fill="currentColor"
      />
    </svg>
  </BaseIcon>
</template>
