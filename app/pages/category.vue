<script setup>
import categoryData from '~/data/category.json'

const route = useRoute()
const router = useRouter()

// SEO
useHead({ title: categoryData.seo.title })
useSeoMeta({
  title: categoryData.seo.title,
  description: categoryData.seo.description,
  ogTitle: categoryData.seo.title,
  ogDescription: categoryData.seo.description,
  ogImage: categoryData.seo.ogImage
})

// API에서 카테고리 목록 가져오기
const { categories: apiCategories } = useMain()

// 상품 API
const {
  products: apiProducts,
  pagination,
  pending,
  setCategory,
  setPage,
  setSortByValue
} = useProducts({ size: 40 })

// 탭 목록 (API 카테고리 기반 + 전체)
const tabs = computed(() => {
  const allTab = { label: '전체', value: 'all' }
  // API 카테고리가 로드되면 해당 데이터 사용
  if (apiCategories.value.length) {
    const categoryTabs = apiCategories.value.map(cat => ({
      label: cat.label,
      value: String(cat.id)
    }))
    return [allTab, ...categoryTabs]
  }
  // 로드 전에는 전체 탭만 표시 (fallback 탭은 value가 달라서 매칭 안됨)
  return [allTab]
})

// URL에서 탭 값 가져오기
const getTabFromUrl = () => {
  return route.query.tab ? String(route.query.tab) : 'all'
}

// 활성 탭 - URL 쿼리 파라미터와 동기화 (초기값도 URL에서)
const activeTab = ref(getTabFromUrl())
const sortValue = ref('latest')

// 탭 변경 핸들러 - URL 업데이트
const handleTabChange = (tabValue) => {
  activeTab.value = tabValue
  const query = tabValue === 'all' ? {} : { tab: tabValue }
  router.replace({ query })

  // API 호출
  if (tabValue === 'all') {
    setCategory(null)
  } else {
    setCategory(Number(tabValue))
  }
}

// URL 변경 감지 (브라우저 뒤로가기 등)
watch(() => route.query.tab, (newTab) => {
  const tabValue = newTab ? String(newTab) : 'all'
  if (activeTab.value !== tabValue) {
    activeTab.value = tabValue
    if (tabValue === 'all') {
      setCategory(null)
    } else {
      setCategory(Number(tabValue))
    }
  }
})

// 초기 로드 시 URL 기반으로 설정
onMounted(() => {
  const initialTab = getTabFromUrl()
  activeTab.value = initialTab
  if (initialTab === 'all') {
    setCategory(null)
  } else {
    setCategory(Number(initialTab))
  }
})

// 정렬 변경
watch(sortValue, (newSort) => {
  setSortByValue(newSort)
})

// 현재 페이지 (1-based for UI, 0-based for API)
const currentPage = computed({
  get: () => pagination.value.page + 1,
  set: (val) => setPage(val - 1)
})

// 상품 데이터
const paginatedProducts = computed(() => apiProducts.value)

const totalProducts = computed(() => pagination.value.totalElements)
const totalPages = computed(() => pagination.value.totalPages)
</script>

<template>
  <LayoutProductList
    :title="categoryData.page.title"
    :total-count="totalProducts"
    :labels="categoryData.page"
    :sort-options="categoryData.page.sortOptions"
    :tabs="tabs"
    :tabs-aria-label="categoryData.page.tabsAriaLabel"
    :loading="pending"
    :active-tab="activeTab"
    v-model:sort="sortValue"
    v-model:current-page="currentPage"
    @tab-change="handleTabChange"
  >
    <template v-if="paginatedProducts.length > 0">
      <ProductCard
        v-for="product in paginatedProducts"
        :key="product.id"
        :product="product"
      />
    </template>
    <BaseEmpty
      v-else-if="!pending"
      :message="categoryData.page.emptyMessage || '상품이 없습니다.'"
    />

    <template #pagination>
      <BasePagination
        v-if="totalPages > 1"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :prev-label="categoryData.page.pagination.prevLabel"
        :next-label="categoryData.page.pagination.nextLabel"
        class="layout-product-list__pagination"
      />
    </template>
  </LayoutProductList>
</template>
