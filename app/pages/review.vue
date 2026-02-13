<script setup>
import reviewData from '~/data/review.json'

useHead({ title: reviewData.seo.title })
useSeoMeta({
  title: reviewData.seo.title,
  description: reviewData.seo.description
})

// API 연동
const { categories } = useMain()
const { reviews, totalPages, pending, fetchReviews } = useReviews()

// 필터 상태
const activeTab = ref('all')
const categoryFilter = ref('')
const sortValue = ref('LATEST')
const currentPage = ref(1)
const pageSize = 12

// 카테고리 옵션 (API에서 가져온 카테고리 목록)
const categoryOptions = computed(() => {
  const options = [{ label: reviewData.filters.category.placeholder, value: '' }]
  categories.value.forEach(cat => {
    options.push({ label: cat.label, value: String(cat.id) })
  })
  return options
})

// 리뷰 목록 조회
const loadReviews = async () => {
  try {
    await fetchReviews({
      categoryId: categoryFilter.value || undefined,
      sort: sortValue.value,
      page: currentPage.value - 1, // API는 0-based
      size: pageSize
    })
  } catch (e) {
    console.error('Failed to load reviews:', e)
  }
}

// 필터 변경 시 첫 페이지로 이동 및 재조회
watch([activeTab, categoryFilter, sortValue], () => {
  currentPage.value = 1
  loadReviews()
})

// 페이지 변경 시 재조회
watch(currentPage, () => {
  loadReviews()
})

// 초기 로드
onMounted(() => {
  loadReviews()
})

// 탭별 필터링 (클라이언트 사이드)
const filteredReviews = computed(() => {
  let items = reviews.value

  if (activeTab.value === 'photo') {
    items = items.filter((r) => (r.images?.length || 0) > 0)
  } else if (activeTab.value === 'best') {
    items = items.filter((r) => r.isBest)
  }

  return items
})

// 모달 상태
const isModalOpen = ref(false)
const selectedReview = ref(null)

const openDetail = (review) => {
  selectedReview.value = review
  isModalOpen.value = true
}
</script>

<template>
  <div>
    <LayoutPage
      :title="reviewData.page.title"
    >
    <div class="review-page__toolbar">
      <BaseTabs
        v-model="activeTab"
        :tabs="reviewData.tabs"
        aria-label="리뷰 탭"
        variant="chip"
        class="review-page__tabs"
      />

      <div class="review-page__filters">
        <BaseSelect
          v-model="categoryFilter"
          :options="categoryOptions"
          :placeholder="reviewData.filters.category.placeholder"
          class="review-page__select review-page__select--category"
        />
        <BaseSelect
          v-model="sortValue"
          :options="reviewData.filters.sort.options"
          class="review-page__select review-page__select--sort"
        />
      </div>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="pending" class="review-page__loading">
      <BaseSpinner />
    </div>

    <!-- 리뷰 목록 -->
    <template v-else>
      <div v-if="filteredReviews.length > 0" class="review-page__grid">
        <ReviewGridCard
          v-for="r in filteredReviews"
          :key="r.id"
          :review="r"
          @click="openDetail"
        />
      </div>
      <BaseEmpty v-else :message="reviewData.empty.message" />
    </template>

    <div class="review-page__pagination">
      <BasePagination
        v-if="totalPages > 1"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :prev-label="reviewData.pagination.prevLabel"
        :next-label="reviewData.pagination.nextLabel"
      />
    </div>
  </LayoutPage>

    <ReviewDetailModal
      v-model="isModalOpen"
      :review="selectedReview"
    />
  </div>
</template>
