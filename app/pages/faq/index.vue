<script setup>
import mainData from '~/data/main.json'
import faqData from '~/data/faq.json'

useHead({ title: faqData.seo.title })
useSeoMeta({
  title: faqData.seo.title,
  description: faqData.seo.description
})

const { faqs, categories, totalPages, pending, error, categoryPending, categoryError, fetchCategories, fetchFaqs } = useFaqs()

const activeCategory = ref('')
const currentPage = ref(1)
const pageSize = 10

// 카테고리 탭 목록 (전체 + API 카테고리)
const categoryTabs = computed(() => {
  const allTab = { label: faqData.tabs.allLabel, value: faqData.tabs.allValue }
  return [allTab, ...categories.value.map(c => ({ label: c.name, value: String(c.id) }))]
})

const loadFaqs = async () => {
  try {
    await fetchFaqs({
      categoryId: activeCategory.value || undefined,
      page: currentPage.value - 1,
      size: pageSize
    })
  } catch (e) {
    console.error('Failed to load FAQ:', e)
  }
}

// 카테고리 변경 시 첫 페이지로
watch(activeCategory, () => {
  currentPage.value = 1
  loadFaqs()
})

// 페이지 변경 시 재조회
watch(currentPage, () => {
  loadFaqs()
})

// 초기 로드
onMounted(async () => {
  try {
    await fetchCategories()
  } catch (e) {
    console.error('Failed to load categories:', e)
  }
  loadFaqs()
})
</script>

<template>
  <div>
    <LayoutPage :title="faqData.page.title">
      <!-- 카테고리 탭 -->
      <div class="faq-page__tabs">
        <BaseTabs
          v-model="activeCategory"
          :tabs="categoryTabs"
          :aria-label="faqData.tabs.ariaLabel"
          variant="chip"
        />
      </div>

      <!-- FAQ 목록 -->
      <div class="faq-page__list">
        <FaqList
          :faqs="faqs"
          :loading="pending"
          :empty-message="faqData.empty.message"
        />
      </div>

      <div class="faq-page__pagination">
        <BasePagination
          v-if="faqs.length > 0"
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :prev-label="faqData.pagination.prevLabel"
          :next-label="faqData.pagination.nextLabel"
        />
      </div>

      <template #footer>
        <Footer :data="mainData.footer" />
      </template>
    </LayoutPage>
  </div>
</template>
