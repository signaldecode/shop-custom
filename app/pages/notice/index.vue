<script setup>
import mainData from '~/data/main.json'
import noticesData from '~/data/notices.json'

useHead({ title: noticesData.seo.title })
useSeoMeta({
  title: noticesData.seo.title,
  description: noticesData.seo.description
})

// API 연동
const { notices, totalPages, pending, fetchNotices } = useNotices()

// 필터 상태
const typeFilter = ref('')
const sortValue = ref('createdAt,DESC')
const keyword = ref('')
const currentPage = ref(1)
const pageSize = 10

// 공지사항 목록 조회
const loadNotices = async () => {
  try {
    await fetchNotices({
      type: typeFilter.value || undefined,
      keyword: keyword.value || undefined,
      sort: sortValue.value,
      page: currentPage.value - 1,
      size: pageSize
    })
  } catch (e) {
    console.error('Failed to load notices:', e)
  }
}

// 필터 변경 시 첫 페이지로 이동 및 재조회
watch([typeFilter, sortValue], () => {
  currentPage.value = 1
  loadNotices()
})

// 페이지 변경 시 재조회
watch(currentPage, () => {
  loadNotices()
})

// 검색 실행
const handleSearch = () => {
  currentPage.value = 1
  loadNotices()
}

// 공지사항 클릭 (상세 페이지로 이동 또는 모달)
const handleNoticeClick = (notice) => {
  navigateTo(`/notice/${notice.id}`)
}

// 초기 로드
onMounted(() => {
  loadNotices()
})
</script>

<template>
  <LayoutPage
    :title="noticesData.page.title"
  >
    <div class="notice-page__toolbar">
      <div class="notice-page__search">
        <BaseInput
          v-model="keyword"
          type="text"
          :placeholder="noticesData.search.placeholder"
          class="notice-page__search-input"
          @keyup.enter="handleSearch"
        />
        <BaseButton
          :label="noticesData.search.button"
          variant="bg"
          color="green"
          size="small"
          @click="handleSearch"
        />
      </div>
      <div class="notice-page__filters">
        <BaseSelect
          v-model="typeFilter"
          :options="noticesData.filters.type.options"
          :placeholder="noticesData.filters.type.placeholder"
          class="notice-page__select"
        />
        <BaseSelect
          v-model="sortValue"
          :options="noticesData.filters.sort.options"
          class="notice-page__select"
        />
      </div>
    </div>

    <!-- 공지사항 목록 -->
    <div class="notice-page__list">
      <NoticeList
        :notices="notices"
        :loading="pending"
        :empty-message="noticesData.empty.message"
        @click="handleNoticeClick"
      />
    </div>

    <div class="notice-page__pagination">
      <BasePagination
        v-if="totalPages > 1"
        v-model:current-page="currentPage"
        :total-pages="totalPages"
        :prev-label="noticesData.pagination.prevLabel"
        :next-label="noticesData.pagination.nextLabel"
      />
    </div>

    <template #footer>
      <Footer :data="mainData.footer" />
    </template>
  </LayoutPage>
</template>
