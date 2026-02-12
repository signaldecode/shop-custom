<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  review: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const hasImages = computed(() => (props.review?.images?.length || 0) > 0)
const imageCount = computed(() => props.review?.images?.length || 0)

const close = () => {
  isOpen.value = false
}

// 이미지 스와이프
const currentImageIndex = ref(0)

const currentImage = computed(() => props.review?.images?.[currentImageIndex.value] || '')

const goToImage = (index) => {
  currentImageIndex.value = index
}

const nextImage = () => {
  if (currentImageIndex.value < imageCount.value - 1) {
    currentImageIndex.value++
  }
}

const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const { swipeEvents: imageSwipeEvents } = useSwipe({
  onSwipeLeft: () => nextImage(),
  onSwipeRight: () => prevImage()
})

// 모달 열릴 때 첫 이미지로 초기화
watch(isOpen, (val) => {
  if (val) {
    currentImageIndex.value = 0
  }
})

// 상품 정보
const hasProduct = computed(() => !!props.review?.product?.name || !!props.review?.productName)
const productName = computed(() => props.review?.product?.name || props.review?.productName || '')
const productImage = computed(() => props.review?.product?.image || props.review?.productImage || props.review?.productThumbnailUrl || '')
const productUrl = computed(() => {
  const id = props.review?.product?.id || props.review?.productId
  return id ? `/products/${id}` : ''
})
</script>

<template>
  <BaseModal
    v-model="isOpen"
    class="review-modal"
    size="large"
    :title="''"
    :show-close="false"
  >
    <div v-if="review" :class="['review-modal__layout', { 'review-modal__layout--no-image': !hasImages }]">
      <!-- Left: Image with swipe -->
      <div
        v-if="hasImages"
        class="review-modal__left"
        aria-hidden="true"
        v-on="imageSwipeEvents"
      >
        <NuxtImg :src="currentImage" alt="" loading="lazy" />
        <!-- Dots indicator -->
        <div v-if="imageCount > 1" class="review-modal__dots">
          <button
            v-for="(_, idx) in imageCount"
            :key="idx"
            type="button"
            :class="['review-modal__dot', { 'review-modal__dot--active': idx === currentImageIndex }]"
            @click="goToImage(idx)"
          />
        </div>
      </div>

      <!-- Right: Content -->
      <div class="review-modal__right">
        <div class="review-modal__top">
          <div class="review-modal__score">
            <div class="review-modal__stars" aria-hidden="true">
              <IconStar v-for="i in 5" :key="i" size="md" :active="i <= (review.rating || 0)" />
            </div>
            <span class="review-modal__score-text">{{ review.scoreText }}</span>
          </div>
          <button type="button" class="review-modal__close" :aria-label="common.close" @click="close">
            ×
          </button>
        </div>

        <div class="review-modal__meta">
          <span class="review-modal__username">{{ review.username }}</span>
          <span class="review-modal__date">{{ review.date }}</span>
        </div>

        <h3 v-if="review.title" class="review-modal__title">{{ review.title }}</h3>

        <div class="review-modal__divider" aria-hidden="true" />

        <p class="review-modal__content">{{ review.content }}</p>

        <!-- 상품 정보 -->
        <NuxtLink
          v-if="hasProduct && productUrl"
          :to="productUrl"
          class="review-modal__product"
          @click="close"
        >
          <div v-if="productImage" class="review-modal__product-thumb">
            <NuxtImg :src="productImage" :alt="productName" loading="lazy" />
          </div>
          <span class="review-modal__product-name">{{ productName }}</span>
          <IconArrow direction="right" size="sm" />
        </NuxtLink>
      </div>
    </div>
  </BaseModal>
</template>
