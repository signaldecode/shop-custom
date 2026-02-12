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
  },
  count: {
    type: Number,
    default: 0
  }
})

const label = computed(() => {
  if (props.count > 0) {
    return `${iconsData.cart.label} (${props.count}개)`
  }
  return iconsData.cart.label
})
</script>

<template>
  <BaseIcon class="icon-cart" :size="size" :color="color" :label="label">
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.33301 10.667H26.6663V26.667H5.33301V10.667Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M10.667 14.6663C10.667 14.3463 10.667 9.73301 10.667 7.99967L13.3337 5.33301H18.667L21.3337 7.99967V14.6663"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <span v-if="count > 0" class="icon-cart__badge" aria-hidden="true">
      {{ count > 99 ? '99+' : count }}
    </span>
  </BaseIcon>
</template>
