<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  rating: {
    type: Number,
    required: true
  },
  reviewCount: {
    type: Number,
    default: null
  },
  variant: {
    type: String,
    default: 'simple',
    validator: (v) => ['simple', 'full'].includes(v)
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  showDivider: {
    type: Boolean,
    default: false
  },
  reviewUnit: {
    type: String,
    default: ''
  }
})

const reviewUnitText = computed(() => props.reviewUnit || common.reviewCountSuffix)

const formattedReviewCount = computed(() => {
  if (props.reviewCount === null) return null
  return props.reviewCount.toLocaleString()
})

const starSize = computed(() => {
  const sizeMap = { sm: 'sm', md: 'md', lg: 'lg' }
  return sizeMap[props.size]
})
</script>

<template>
  <div
    class="base-rating"
    :class="[
      `base-rating--${variant}`,
      `base-rating--size-${size}`
    ]"
  >
    <!-- Simple: 별 1개 -->
    <template v-if="variant === 'simple'">
      <IconStar :size="starSize" color="filled" decorative />
    </template>

    <!-- Full: 별 5개 -->
    <template v-else>
      <div class="base-rating__stars">
        <IconStar
          v-for="i in 5"
          :key="i"
          :size="starSize"
          :color="i <= Math.floor(rating) ? 'filled' : 'default'"
          decorative
        />
      </div>
    </template>

    <span class="base-rating__value">{{ rating }}</span>

    <template v-if="reviewCount !== null">
      <span v-if="showDivider" class="base-rating__divider">|</span>
      <span class="base-rating__count">
        {{ showDivider ? '' : '(' }}{{ formattedReviewCount }}{{ reviewUnitText }}{{ showDivider ? '' : ')' }}
      </span>
    </template>
  </div>
</template>
