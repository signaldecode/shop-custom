<script setup>
const { shopNameEn } = useShopInfo()

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)
const visibleItems = 2
const containerRef = ref(null)
const itemWidth = ref(0)
const gap = 24

// Touch/Swipe
const { swipeEvents: sliderSwipeEvents } = useSwipe({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
})

const maxIndex = computed(() => {
  return Math.max(0, props.products.length - visibleItems)
})

const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < maxIndex.value)

const sliderStyle = computed(() => ({
  transform: `translateX(-${currentIndex.value * (itemWidth.value + gap)}px)`
}))

const nextSlide = () => {
  if (canGoNext.value) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (canGoPrev.value) {
    currentIndex.value--
  }
}

const calculateItemWidth = () => {
  nextTick(() => {
    if (containerRef.value) {
      const containerWidth = containerRef.value.offsetWidth
      itemWidth.value = (containerWidth - gap) / visibleItems
    }
  })
}

let resizeTimer = null
const debouncedCalculate = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(calculateItemWidth, 150)
}

onMounted(() => {
  calculateItemWidth()
  window.addEventListener('resize', debouncedCalculate, { passive: true })
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', debouncedCalculate)
})
</script>

<template>
  <section class="section-md-pick">
    <div class="section-md-pick__inner">
      <div class="section-md-pick__header">
        <h2 class="section-md-pick__title">{{ data.title }}</h2>
        <p class="section-md-pick__subtitle">{{ data.subtitle }}</p>
      </div>

      <div class="section-md-pick__content">
        <div class="section-md-pick__image-card">
          <img
            :src="data.mainImage"
            :alt="data.mainImageAlt"
            class="section-md-pick__main-image"
            loading="lazy"
            width="588"
            height="588"
          />
        </div>

        <div class="section-md-pick__info">
          <p class="section-md-pick__brand">{{ shopNameEn || data.brandName }}</p>
          <h3 class="section-md-pick__recommend-title">{{ data.recommendTitle }}</h3>

          <div
            class="section-md-pick__slider-wrap"
            v-on="sliderSwipeEvents"
          >
            <IconSlideButton
              direction="prev"
              class="section-md-pick__arrow section-md-pick__arrow--prev"
              :disabled="!canGoPrev"
              :aria-label="data.arrowLabels?.prev"
              @click="prevSlide"
            />
            <div ref="containerRef" class="section-md-pick__slider-container">
              <div class="section-md-pick__slider" :style="sliderStyle">
                <ProductCardSmall
                  v-for="product in products"
                  :key="product.id"
                  :product="product"
                  class="section-md-pick__item"
                  :style="{ width: itemWidth > 0 ? `${itemWidth}px` : undefined }"
                />
              </div>
            </div>
            <IconSlideButton
              direction="next"
              class="section-md-pick__arrow section-md-pick__arrow--next"
              :disabled="!canGoNext"
              :aria-label="data.arrowLabels?.next"
              @click="nextSlide"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
