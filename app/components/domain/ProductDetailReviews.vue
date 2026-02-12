<script setup>
const props = defineProps({
  reviews: {
    type: Object,
    default: () => ({ summary: {}, items: [] })
  },
  labels: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['write'])

const handleWriteReview = () => {
  emit('write')
}

// 리뷰 상세 모달
const isDetailModalOpen = ref(false)
const selectedReview = ref(null)

const openReviewDetail = (review) => {
  selectedReview.value = {
    ...review,
    scoreText: review.rating ? `${review.rating}.0` : '0.0',
    otherImages: props.reviews.items
      .filter(r => r.id !== review.id && r.images?.length)
      .flatMap(r => r.images)
      .slice(0, 5)
  }
  isDetailModalOpen.value = true
}

const activeTab = ref('all')
const sortValue = ref('latest')
const currentPage = ref(1)
const itemsPerPage = 5

const filteredReviews = computed(() => {
  let items = props.reviews.items || []

  if (activeTab.value === 'photo') {
    items = items.filter(r => r.isPhoto)
  } else if (activeTab.value === 'best') {
    items = items.filter(r => r.isBest)
  }

  return items
})

const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredReviews.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredReviews.value.length / itemsPerPage))

const maxDistributionCount = computed(() => {
  const distribution = props.reviews.summary?.distribution || []
  return Math.max(...distribution, 1)
})

const getDistributionPercent = (count) => {
  return (count / maxDistributionCount.value) * 100
}

const getDistributionCount = (index) => {
  return props.reviews.summary?.distribution?.[index] || 0
}

const highestCountIndex = computed(() => {
  const distribution = props.reviews.summary?.distribution || []
  if (distribution.length === 0) return 0
  let maxIndex = 0
  let maxCount = distribution[0]
  distribution.forEach((count, index) => {
    if (count > maxCount) {
      maxCount = count
      maxIndex = index
    }
  })
  return maxIndex
})

const selectedBarIndex = ref(null)

const toggleBubble = (index) => {
  selectedBarIndex.value = selectedBarIndex.value === index ? null : index
}

const isBubbleVisible = (index) => {
  if (selectedBarIndex.value !== null) {
    return selectedBarIndex.value === index
  }
  return index === highestCountIndex.value
}

watch([activeTab, sortValue], () => {
  currentPage.value = 1
})
</script>

<template>
  <section id="section-reviews" class="product-detail-reviews">
    <div class="product-detail-reviews__header">
      <h2 class="product-detail-reviews__title">{{ labels.title }}</h2>
      <!-- <BaseButton
        variant="ghost"
        size="sm"
        @click="handleWriteReview"
      >
        <span class="write-btn-content">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12.146 1.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 4L12 4.793 13.793 3 13 2.207 11.207 4zm.586 1.5L10.5 4.207 4 10.707V11.5h.793l6.5-6.5z" fill="currentColor"/>
          </svg>
          {{ labels.writeLabel }}
        </span>
      </BaseButton> -->
    </div>

    <!-- Summary -->
    <div class="product-detail-reviews__summary">
      <!-- 평균 평점 -->
      <div class="product-detail-reviews__summary-item">
        <div class="product-detail-reviews__avg-stars">
          <IconStar v-for="i in 5" :key="i" size="2xl" :active="i <= Math.floor(reviews.summary?.average || 0)" />
        </div>
        <div class="product-detail-reviews__summary-value">
          <span class="product-detail-reviews__avg-score">{{ reviews.summary?.average }}</span>
          <span class="product-detail-reviews__avg-max">/ 5.0</span>
        </div>
      </div>

      <!-- 총 리뷰 수 -->
      <div class="product-detail-reviews__summary-item">
        <div class="product-detail-reviews__summary-value">
          <span class="product-detail-reviews__total-count">{{ reviews.summary?.total }}</span>
          <span class="product-detail-reviews__total-unit">{{ labels.totalUnit }}</span>
        </div>
        <IconReview size="lg" />
      </div>

      <!-- 평점 분포 (세로 바) -->
      <div class="product-detail-reviews__summary-item">
        <div class="product-detail-reviews__distribution">
          <button
            v-for="(count, index) in reviews.summary?.distribution"
            :key="index"
            type="button"
            class="product-detail-reviews__dist-bar"
            @click="toggleBubble(index)"
          >
            <span v-if="isBubbleVisible(index)" class="product-detail-reviews__dist-count">{{ count }}</span>
            <div class="product-detail-reviews__dist-track">
              <div
                class="product-detail-reviews__dist-fill"
                :style="{ height: `${getDistributionPercent(count)}%` }"
              />
            </div>
            <span class="product-detail-reviews__dist-label">{{ 5 - index }}점</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="product-detail-reviews__toolbar">
      <BaseTabs
        v-model="activeTab"
        :tabs="labels.tabs"
        variant="chip"
        class="product-detail-reviews__tabs"
      />
      <BaseSelect
        v-model="sortValue"
        :options="labels.sortOptions"
        class="product-detail-reviews__sort"
      />
    </div>

    <!-- Review List -->
    <div class="product-detail-reviews__list">
      <button
        v-for="review in paginatedReviews"
        :key="review.id"
        type="button"
        :class="['review-card', { 'review-card--has-images': review.images?.length }]"
        @click="openReviewDetail(review)"
      >
        <!-- 이미지 영역 (이미지가 있을 때만) -->
        <div v-if="review.images?.length" class="review-card__images">
          <img
            v-for="(img, idx) in review.images"
            :key="idx"
            :src="img"
            :alt="`리뷰 이미지 ${idx + 1}`"
            class="review-card__image"
          />
        </div>

        <!-- 텍스트 영역 -->
        <div class="review-card__body">
          <div class="review-card__header">
            <div class="review-card__rating">
              <IconStar
                v-for="i in 5"
                :key="i"
                size="sm"
                :active="i <= review.rating"
              />
            </div>
            <span class="review-card__username">{{ review.username }}</span>
            <span class="review-card__date">{{ review.date }}</span>
          </div>
          <h4 v-if="review.title" class="review-card__title">{{ review.title }}</h4>
          <p class="review-card__content">{{ review.content }}</p>
        </div>
      </button>

      <BaseEmpty v-if="paginatedReviews.length === 0" :message="labels.emptyMessage" />
    </div>

    <!-- Pagination -->
    <BasePagination
      v-if="totalPages > 1"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :prev-label="labels.pagination.prevLabel"
      :next-label="labels.pagination.nextLabel"
      class="product-detail-reviews__pagination"
    />

    <!-- Review Detail Modal -->
    <ReviewDetailModal
      v-model="isDetailModalOpen"
      :review="selectedReview"
    />
  </section>
</template>
