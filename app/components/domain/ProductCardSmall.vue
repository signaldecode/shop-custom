<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const formattedPrice = computed(() => {
  return props.product.price?.toLocaleString()
})

const formattedOriginalPrice = computed(() => {
  return props.product.originalPrice?.toLocaleString()
})

const hasDiscount = computed(() => {
  return props.product.originalPrice && props.product.originalPrice > props.product.price
})

const discountRate = computed(() => {
  if (props.product.discountRate) return props.product.discountRate
  if (!hasDiscount.value) return 0
  return Math.round((1 - props.product.price / props.product.originalPrice) * 100)
})

const formattedReviewCount = computed(() => {
  return props.product.reviewCount?.toLocaleString()
})
</script>

<template>
  <article class="product-card-small">
    <NuxtLink :to="product.href" class="product-card-small__link">
      <div class="product-card-small__image-wrap">
        <img
          :src="product.image"
          :alt="product.imageAlt"
          class="product-card-small__image"
          loading="lazy"
        />
      </div>
      <div class="product-card-small__info">
        <h3 class="product-card-small__name">{{ product.name }}</h3>
        <div class="product-card-small__price-wrap">
          <BaseBadge
            v-if="hasDiscount"
            :label="`${discountRate}%`"
            variant="discount"
            size="product"
          />
          <p class="product-card-small__price">{{ formattedPrice }}{{ product.currency }}</p>
        </div>
        <div v-if="product.rating" class="product-card-small__rating">
          <IconStar size="lg" color="filled" :label="common.rating" decorative />
          <span class="product-card-small__rating-value">{{ product.rating }}</span>
          <span class="product-card-small__rating-divider">|</span>
          <span class="product-card-small__review-count">{{ formattedReviewCount }}{{ common.reviewCountSuffix }}</span>
        </div>
      </div>
    </NuxtLink>
  </article>
</template>
