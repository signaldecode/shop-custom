<script setup>
import iconsData from '~/data/icons.json'

const props = defineProps({
  size: {
    type: String,
    default: '3xl',
    validator: (v) => ['xs', '3xl'].includes(v)
  },
  color: {
    type: String,
    default: 'default'
  }
})

const label = iconsData.close.label

const viewBox = computed(() => props.size === 'xs' ? '0 0 16 16' : '0 0 36 36')
const paths = computed(() => {
  if (props.size === 'xs') {
    return {
      path1: 'M13.3337 2.66699L2.66699 13.3337',
      path2: 'M13.3337 13.3337L2.66699 2.66699'
    }
  }
  return {
    path1: 'M30 6L6 30',
    path2: 'M30 30L6 6'
  }
})
</script>

<template>
  <BaseIcon :size="size" :color="color" :label="label">
    <svg :viewBox="viewBox" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        :d="paths.path1"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        :d="paths.path2"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  </BaseIcon>
</template>
