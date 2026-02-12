<script setup>
const props = defineProps({
  current: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const progressWidth = computed(() => {
  return `${(props.current / props.total) * 100}%`
})

const formatNumber = (num) => {
  return num.toString().padStart(2, '0')
}
</script>

<template>
  <div class="slide-indicator">
    <span class="slide-indicator__current">{{ formatNumber(current) }}</span>
    <div class="slide-indicator__bar">
      <div
        class="slide-indicator__progress"
        :style="{ width: progressWidth }"
      />
    </div>
    <span class="slide-indicator__total">{{ formatNumber(total) }}</span>
  </div>
</template>
