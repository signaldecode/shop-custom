<script setup>
import iconsData from '~/data/icons.json'

const props = defineProps({
  direction: {
    type: String,
    default: 'prev',
    validator: (v) => ['prev', 'next'].includes(v)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'minimal'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const label = computed(() =>
  iconsData.slideButton.label[props.direction]
)

const arrowDirection = computed(() =>
  props.direction === 'prev' ? 'left' : 'right'
)

const pathData = {
  left: 'M45.3333 11.3337L22.6667 34.0003L45.3333 56.667',
  right: 'M22.6667 11.3337L45.3333 34.0003L22.6667 56.667'
}

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<template>
  <button
    type="button"
    class="slide-button"
    :class="[
      `slide-button--${variant}`,
      { 'slide-button--disabled': disabled }
    ]"
    :style="color ? { color: color } : {}"
    :aria-label="label"
    :disabled="disabled"
    @click="handleClick"
  >
    <svg viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        :d="pathData[arrowDirection]"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</template>
