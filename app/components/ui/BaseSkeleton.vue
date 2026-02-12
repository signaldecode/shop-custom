<script setup>
const props = defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  borderRadius: {
    type: String,
    default: '0'
  }
})

const style = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.borderRadius
}))
</script>

<template>
  <div class="skeleton" :style="style" />
</template>
