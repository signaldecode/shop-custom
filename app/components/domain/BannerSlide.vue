<script setup>
const props = defineProps({
  banners: {
    type: Array,
    required: true
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  }
})

const currentIndex = ref(0)
let timer = null

// 스와이프 관련
const isDragging = ref(false)
let startX = 0
let currentX = 0
const threshold = 50

// 터치 스와이프 (수직 스크롤 방지)
const { swipeEvents: bannerSwipeEvents } = useSwipe({
  onSwipeLeft: () => { goNext(); startAutoPlay() },
  onSwipeRight: () => { goPrev(); startAutoPlay() }
})

const goTo = (index) => {
  currentIndex.value = index
}

const goPrev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.banners.length) % props.banners.length
}

const goNext = () => {
  currentIndex.value = (currentIndex.value + 1) % props.banners.length
}

const startAutoPlay = () => {
  if (props.autoPlay && props.banners.length > 1) {
    timer = setInterval(goNext, props.interval)
  }
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 터치/마우스 이벤트
const handleDragStart = (e) => {
  if (props.banners.length <= 1) return
  isDragging.value = true
  startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
  stopAutoPlay()
}

const handleDragMove = (e) => {
  if (!isDragging.value) return
  currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
}

const handleDragEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false

  const diff = startX - currentX

  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      goNext()
    } else {
      goPrev()
    }
  }

  startX = 0
  currentX = 0
  startAutoPlay()
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <section class="banner-slide">
    <div
      class="banner-slide__inner"
      @mouseenter="stopAutoPlay"
      @mouseleave="startAutoPlay"
    >
      <div v-if="banners.length > 1" class="banner-slide__dots">
        <button
          v-for="(banner, index) in banners"
          :key="index"
          type="button"
          class="banner-slide__dot"
          :class="{ 'banner-slide__dot--active': index === currentIndex }"
          :aria-label="`${index + 1}번 슬라이드`"
          @click="goTo(index)"
        />
      </div>
      <div
        class="banner-slide__track"
        :class="{ 'banner-slide__track--dragging': isDragging }"
        @mousedown="handleDragStart"
        @mousemove="handleDragMove"
        @mouseup="handleDragEnd"
        @mouseleave="handleDragEnd"
        @touchstart="(e) => { stopAutoPlay(); bannerSwipeEvents.touchstart(e) }"
        @touchmove="bannerSwipeEvents.touchmove"
        @touchend="bannerSwipeEvents.touchend"
      >
        <div
          v-for="(banner, index) in banners"
          :key="index"
          class="banner-slide__item"
          :class="{ 'banner-slide__item--active': index === currentIndex }"
        >
          <NuxtLink v-if="banner.href" :to="banner.href" class="banner-slide__link">
            <NuxtImg
              :src="banner.image"
              :alt="banner.imageAlt"
              class="banner-slide__image"
              loading="lazy"
              draggable="false"
            />
          </NuxtLink>
          <NuxtImg
            v-else
            :src="banner.image"
            :alt="banner.imageAlt"
            class="banner-slide__image"
            loading="lazy"
            draggable="false"
          />
        </div>
      </div>
    </div>
  </section>
</template>
