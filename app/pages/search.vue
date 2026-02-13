<script setup>
import searchData from '~/data/search.json'

const route = useRoute()

// 검색어 (URL query에서)
const searchQuery = computed(() => route.query.q || '')

// SEO
useHead({ title: searchQuery.value
  ? `'${searchQuery.value}' ${searchData.seo.title}`
  : searchData.page.titleWithoutQuery })
useSeoMeta({
  title: searchQuery.value
    ? `'${searchQuery.value}' ${searchData.seo.title}`
    : searchData.page.titleWithoutQuery,
  description: searchData.seo.description
})

// API
const { products, totalCount, pending, searchProducts } = useSearch()

// 검색 실행
const loadResults = async () => {
  if (!searchQuery.value) return
  await searchProducts({
    keyword: searchQuery.value,
    limit: 30
  })
}

// 검색어 변경 시 재검색
watch(searchQuery, () => {
  loadResults()
}, { immediate: true })
</script>

<template>
  <div class="page-search">
    <main class="page-search__main">
      <div class="page-search__container">
        <div class="page-search__header">
          <h1 class="page-search__title">
            <template v-if="searchQuery">
              '<strong>{{ searchQuery }}</strong>' {{ searchData.page.titleWithQuery }}
            </template>
            <template v-else>
              {{ searchData.page.titleWithoutQuery }}
            </template>
          </h1>
          <p v-if="searchQuery" class="page-search__count">{{ totalCount }}{{ searchData.page.countSuffix }}</p>
        </div>

        <div v-if="pending" class="page-search__loading">
          <BaseSpinner />
        </div>

        <template v-else>
          <div v-if="products.length > 0" class="page-search__grid">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
            />
          </div>

          <BaseEmpty
            v-if="searchQuery && products.length === 0"
            :message="searchData.page.emptyResult"
          />

          <div v-if="!searchQuery" class="page-search__empty">
            <p>{{ searchData.page.emptyQuery }}</p>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
