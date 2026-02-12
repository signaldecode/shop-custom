<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 5
  },
  size: {
    type: String,
    default: 'lg',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  descriptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])

const hoveredRating = ref(0)

const displayRating = computed(() => {
  if (props.readonly) return props.modelValue
  return hoveredRating.value || props.modelValue
})

const ratingDescription = computed(() => {
  const index = displayRating.value
  return props.descriptions[index] || ''
})

const handleClick = (rating) => {
  if (props.disabled || props.readonly) return
  emit('update:modelValue', rating)
}

const handleMouseEnter = (rating) => {
  if (props.disabled || props.readonly) return
  hoveredRating.value = rating
}

const handleMouseLeave = () => {
  hoveredRating.value = 0
}

const handleKeyDown = (e, rating) => {
  if (props.disabled || props.readonly) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    emit('update:modelValue', rating)
  }
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
  xl: 40
}

const starSize = computed(() => sizeMap[props.size] || 32)
</script>

<template>
  <div
    class="base-star-rating"
    :class="[
      `base-star-rating--${size}`,
      {
        'base-star-rating--disabled': disabled,
        'base-star-rating--readonly': readonly
      }
    ]"
    role="radiogroup"
    :aria-label="label"
  >
    <div class="base-star-rating__stars" @mouseleave="handleMouseLeave">
      <button
        v-for="i in max"
        :key="i"
        type="button"
        class="base-star-rating__star"
        :class="{ 'base-star-rating__star--active': i <= displayRating }"
        :disabled="disabled"
        :aria-label="`${i}점`"
        :aria-checked="i === modelValue"
        role="radio"
        @click="handleClick(i)"
        @mouseenter="handleMouseEnter(i)"
        @keydown="handleKeyDown($event, i)"
      >
        <svg
          :width="starSize"
          :height="starSize"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            :fill="i <= displayRating ? 'currentColor' : 'none'"
            :stroke="i <= displayRating ? 'currentColor' : '#D1D5DB'"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
    <span v-if="ratingDescription" class="base-star-rating__description">
      {{ ratingDescription }}
    </span>
  </div>
</template>
