<script setup>
const props = defineProps({
  review: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click'])

const hasImage = computed(() => (props.review.images?.length || 0) > 0)
const heroImage = computed(() => props.review.images?.[0] || '')
</script>

<template>
  <button
    type="button"
    class="review-grid-card"
    :class="{ 'review-grid-card--no-image': !hasImage }"
    @click="emit('click', review)"
  >
    <div class="review-grid-card__hero">
      <NuxtImg
        v-if="hasImage"
        class="review-grid-card__hero-image"
        :src="heroImage"
        alt=""
        loading="lazy"
      />
      <div v-else class="review-grid-card__hero-text">
        <p class="review-grid-card__hero-content">
          {{ review.content }}
        </p>
      </div>
    </div>

    <div class="review-grid-card__body">
      <div class="review-grid-card__score">
        <div class="review-grid-card__stars" aria-hidden="true">
          <IconStar
            v-for="i in 5"
            :key="i"
            size="md"
            :active="i <= (review.rating || 0)"
          />
        </div>
        <span class="review-grid-card__score-text">{{ review.scoreText }}</span>
      </div>

      <div class="review-grid-card__meta">
        <span class="review-grid-card__username">{{ review.username }}</span>
        <span class="review-grid-card__date">{{ review.date }}</span>
      </div>

      <div class="review-grid-card__divider" aria-hidden="true" />

      <div class="review-grid-card__product">
        <div class="review-grid-card__thumb" aria-hidden="true">
          <NuxtImg :src="review.product?.thumb" alt="" loading="lazy" />
        </div>
        <div class="review-grid-card__product-texts">
          <p class="review-grid-card__product-name">{{ review.product?.name }}</p>
          <div class="review-grid-card__product-sub">
            <div class="review-grid-card__product-rating">
              <IconStar size="sm" :active="true" />
              <span class="review-grid-card__product-rating-text">
                {{ review.product?.rating }}
              </span>
            </div>
            <span class="review-grid-card__product-sub-divider" aria-hidden="true" />
            <span class="review-grid-card__product-count">
              {{ review.product?.reviewCountText }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </button>
</template>

