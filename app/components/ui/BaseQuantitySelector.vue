<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  min: {
    type: Number,
    default: 1
  },
  max: {
    type: Number,
    default: 99
  }
})

const emit = defineEmits(['update:modelValue'])

const decrease = () => {
  if (props.modelValue > props.min) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

const increase = () => {
  if (props.modelValue < props.max) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

const onInput = (e) => {
  let value = parseInt(e.target.value) || props.min
  value = Math.max(props.min, Math.min(props.max, value))
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="quantity-selector">
    <button
      type="button"
      class="quantity-selector__btn"
      :disabled="modelValue <= min"
      aria-label="수량 감소"
      @click="decrease"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <input
      type="number"
      class="quantity-selector__input"
      :value="modelValue"
      :min="min"
      :max="max"
      @input="onInput"
    />
    <button
      type="button"
      class="quantity-selector__btn"
      :disabled="modelValue >= max"
      aria-label="수량 증가"
      @click="increase"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 3V13M3 8H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>
