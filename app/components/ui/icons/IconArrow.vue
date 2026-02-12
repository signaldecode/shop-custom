<script setup>
import iconsData from '~/data/icons.json'

const props = defineProps({
  direction: {
    type: String,
    default: 'left',
    validator: (v) => ['left', 'right', 'up', 'down'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].includes(v)
  },
  color: {
    type: String,
    default: 'default'
  }
})

const label = computed(() => iconsData.arrow.label[props.direction])

const pathData = {
  left: 'M14.6663 3.66634L7.33301 10.9997L14.6663 18.333',
  right: 'M7.33366 3.66634L14.667 10.9997L7.33366 18.333',
  up: 'M18.3337 14.6663L11.0003 7.33301L3.66699 14.6663',
  down: 'M3.66732 7.33366L11.0007 14.667L18.334 7.33366'
}
</script>

<template>
  <BaseIcon :size="size" :color="color" :label="label">
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        :d="pathData[direction]"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </BaseIcon>
</template>
