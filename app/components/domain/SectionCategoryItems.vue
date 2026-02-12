<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  },
  fallbackProducts: {
    type: Array,
    default: () => []
  }
})

// 탭 목록 (API 카테고리만 사용)
const tabs = computed(() => {
  if (props.categories?.length) {
    return props.categories.map(cat => ({
      label: cat.label,
      value: String(cat.id)
    }))
  }
  return []
})

// 카테고리 로딩 여부
const isCategoriesLoaded = computed(() => tabs.value.length > 0)

const activeTab = ref('')
const sliderRef = ref(null)
const currentIndex = ref(0)
const itemWidth = ref(0)
const visibleItems = ref(4)
const gap = 32
const isReady = ref(false)

// Touch/Swipe
const { swipeEvents: sliderSwipeEvents } = useSwipe({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
})

// 상품 API 호출
const { products: apiProducts, pending, setCategory } = useProducts({ size: 8 })

// API 호출 완료 여부 (최초 로드 구분용)
const hasCalledApi = ref(false)

// 카테고리 로드 시 첫 번째 탭 선택 및 API 호출
watch(tabs, (newTabs) => {
  if (newTabs.length > 0) {
    // 첫 번째 탭 선택
    if (!activeTab.value || !newTabs.find(t => t.value === activeTab.value)) {
      activeTab.value = newTabs[0].value
    }
    // API 호출
    const categoryId = Number(activeTab.value)
    if (!isNaN(categoryId) && categoryId > 0) {
      setCategory(categoryId)
    }
  }
}, { immediate: true })

// 탭 변경 시 API 호출
watch(activeTab, (newTab, oldTab) => {
  if (newTab && newTab !== oldTab) {
    const categoryId = Number(newTab)
    if (!isNaN(categoryId) && categoryId > 0) {
      setCategory(categoryId)
      currentIndex.value = 0 // 슬라이더 초기화
    }
  }
})

// API 로딩 완료 시 플래그 설정
watch(pending, (isPending, wasPending) => {
  if (wasPending && !isPending) {
    hasCalledApi.value = true
  }
})

// 현재 상품 (API 호출 전에만 폴백 사용)
const currentProducts = computed(() => {
  // API 호출 완료 후에는 API 결과만 사용
  if (hasCalledApi.value) {
    return apiProducts.value || []
  }
  // API 호출 전에는 폴백 사용
  return apiProducts.value?.length ? apiProducts.value : props.fallbackProducts
})

// 뷰 상태: 'skeleton' | 'products' | 'empty'
const viewState = computed(() => {
  // 카테고리 미로드 또는 로딩 중
  if (!isCategoriesLoaded.value || pending.value || !isReady.value) {
    return 'skeleton'
  }
  // 상품이 있음
  if (currentProducts.value.length > 0) {
    return 'products'
  }
  // 상품이 없음
  return 'empty'
})

const maxIndex = computed(() => {
  return Math.max(0, currentProducts.value.length - visibleItems.value)
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

const updateItemWidth = () => {
  if (sliderRef.value) {
    const containerWidth = sliderRef.value.parentElement.offsetWidth
    if (window.innerWidth >= 1024) {
      visibleItems.value = 4
    } else if (window.innerWidth >= 768) {
      visibleItems.value = 3
    } else {
      visibleItems.value = 2
    }
    itemWidth.value = (containerWidth - gap * (visibleItems.value - 1)) / visibleItems.value
  }
}

// 상품 표시될 때 슬라이더 크기 재계산
watch(viewState, (state) => {
  if (state === 'products') {
    nextTick(() => {
      updateItemWidth()
    })
  }
})

let resizeTimer = null
const debouncedUpdate = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(updateItemWidth, 150)
}

onMounted(() => {
  updateItemWidth()
  isReady.value = true
  window.addEventListener('resize', debouncedUpdate, { passive: true })
})

onUnmounted(() => {
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', debouncedUpdate)
})
</script>

<template>
  <section class="section-category-items">
    <div class="section-category-items__inner">
      <div class="section-category-items__header">
        <div class="section-category-items__titles">
          <h2 class="section-category-items__title">{{ data.title }}</h2>
          <p class="section-category-items__subtitle">{{ data.subtitle }}</p>
        </div>
        <div class="section-category-items__controls">
          <IconSlideButton
            direction="prev"
            :disabled="!canGoPrev"
            :aria-label="data.arrowLabels?.prev"
            color="#222222"
            @click="prevSlide"
          />
          <IconSlideButton
            direction="next"
            :disabled="!canGoNext"
            :aria-label="data.arrowLabels?.next"
            color="#222222"
            @click="nextSlide"
          />
        </div>
      </div>
      <BaseTabs
        v-if="tabs.length"
        v-model="activeTab"
        :tabs="tabs"
        :aria-label="data.tabsAriaLabel"
        variant="chip"
        class="section-category-items__tabs"
      />
      <div
        class="section-category-items__slider-wrap"
        v-on="sliderSwipeEvents"
      >
        <!-- 스켈레톤 -->
        <div v-if="viewState === 'skeleton'" class="section-category-items__skeleton">
          <div
            v-for="i in visibleItems"
            :key="`skeleton-${i}`"
            class="section-category-items__skeleton-item"
          >
            <div class="section-category-items__skeleton-image" />
            <div class="section-category-items__skeleton-text" />
            <div class="section-category-items__skeleton-text--short" />
          </div>
        </div>
        <!-- 실제 슬라이더 -->
        <div
          v-if="viewState === 'products'"
          ref="sliderRef"
          class="section-category-items__slider"
          :style="sliderStyle"
        >
          <ProductCard
            v-for="product in currentProducts"
            :key="product.id"
            :product="product"
            class="section-category-items__item"
            :style="{ width: itemWidth + 'px' }"
          />
        </div>
        <!-- 빈 상태 -->
        <div
          v-if="viewState === 'empty'"
          class="section-category-items__empty-wrap"
        >
          <BaseEmpty :message="data.emptyMessage" />
        </div>
      </div>
    </div>
  </section>
</template>
