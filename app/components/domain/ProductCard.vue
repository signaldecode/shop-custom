<script setup>
import uiData from '~/data/ui.json'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showBadge: {
    type: Boolean,
    default: true
  },
  showRating: {
    type: Boolean,
    default: true
  },
  badgeVariant: {
    type: String,
    default: 'best-dark'
  }
})

const badgeLabel = uiData.badge.best

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
  // API에서 제공하는 discountRate 우선 사용
  if (props.product.discountRate) return props.product.discountRate
  if (!hasDiscount.value) return 0
  return Math.round((1 - props.product.price / props.product.originalPrice) * 100)
})
</script>

<template>
  <article class="product-card">
    <NuxtLink :to="product.href" class="product-card__link">
      <div class="product-card__image-wrap">
        <img
          :src="product.image"
          :alt="product.imageAlt"
          class="product-card__image"
          loading="lazy"
        />
        <div v-if="showBadge && product.isBest" class="product-card__badges">
          <BaseBadge
            :label="badgeLabel"
            :variant="badgeVariant"
            size="product"
          />
        </div>
      </div>

      <div class="product-card__info">
        <h3 class="product-card__name">{{ product.name }}</h3>

        <div class="product-card__divider"></div>

        <div class="product-card__price-wrap">
          <BaseBadge
            v-if="hasDiscount"
            :label="`${discountRate}%`"
            variant="discount"
            size="product"
          />
          <span class="product-card__price">{{ formattedPrice }}{{ product.currency }}</span>
          <span v-if="hasDiscount" class="product-card__original-price">{{ formattedOriginalPrice }}{{ product.currency }}</span>
        </div>

        <BaseRating
          v-if="showRating && product.rating"
          :rating="product.rating"
          :review-count="product.reviewCount"
          variant="simple"
          size="md"
          show-divider
          class="product-card__rating"
        />
      </div>
    </NuxtLink>
  </article>
</template>
