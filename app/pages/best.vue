<script setup>
import mainData from '~/data/main.json'
import bestData from '~/data/best.json'

// SEO
useHead({ title: bestData.seo.title })
useSeoMeta({
  title: bestData.seo.title,
  description: bestData.seo.description,
  ogTitle: bestData.seo.title,
  ogDescription: bestData.seo.description,
  ogImage: bestData.seo.ogImage
})

// 상품 API (tag=best)
const {
  products: apiProducts,
  pagination,
  pending,
  setPage,
  setSortByValue
} = useProducts({ tag: 'best', size: 40 })

const sortValue = ref('latest')

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
    :title="bestData.page.title"
    :total-count="totalProducts"
    :labels="bestData.page"
    :sort-options="bestData.page.sortOptions"
    :loading="pending"
    v-model:sort="sortValue"
    v-model:current-page="currentPage"
  >
    <ProductCard
      v-for="product in paginatedProducts"
      :key="product.id"
      :product="product"
    />

    <template #pagination>
      <BasePagination
        v-if="totalPages > 1"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :prev-label="bestData.page.pagination.prevLabel"
        :next-label="bestData.page.pagination.nextLabel"
        class="layout-product-list__pagination"
      />
    </template>

    <template #footer>
      <Footer :data="mainData.footer" />
    </template>
  </LayoutProductList>
</template>
