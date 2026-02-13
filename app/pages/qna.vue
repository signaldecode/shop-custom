<script setup>
import qnaData from '~/data/qna.json'

useHead({ title: qnaData.seo.title })
useSeoMeta({
  title: qnaData.seo.title,
  description: qnaData.seo.description
})

// API 연동
const { qnas, totalPages, pending, fetchQnas } = useQnas()

// 필터 상태
const typeFilter = ref('')
const sortValue = ref('createdAt,DESC')
const currentPage = ref(1)
const pageSize = 10

// Q&A 목록 조회
const loadQnas = async () => {
  try {
    await fetchQnas({
      qnaType: typeFilter.value || undefined,
      sort: sortValue.value,
      page: currentPage.value - 1,
      size: pageSize
    })
  } catch (e) {
    console.error('Failed to load Q&A:', e)
  }
}

// 필터 변경 시 첫 페이지로 이동 및 재조회
watch([typeFilter, sortValue], () => {
  currentPage.value = 1
  loadQnas()
})

// 페이지 변경 시 재조회
watch(currentPage, () => {
  loadQnas()
})

// 초기 로드
onMounted(() => {
  loadQnas()
})

// 문의 작성 모달
const showWriteModal = ref(false)

const handleWriteSubmitted = () => {
  loadQnas()
}
</script>

<template>
  <div>
    <LayoutPage
      :title="qnaData.page.title"
    >
      <div class="qna-page__toolbar">
        <BaseButton
          :label="qnaData.buttons.write"
          variant="bg"
          color="green"
          size="small"
          @click="showWriteModal = true"
        />
        <div class="qna-page__filters">
          <BaseSelect
            v-model="typeFilter"
            :options="qnaData.filters.type.options"
            :placeholder="qnaData.filters.type.placeholder"
            class="qna-page__select"
          />
          <BaseSelect
            v-model="sortValue"
            :options="qnaData.filters.sort.options"
            class="qna-page__select"
          />
        </div>
      </div>

      <!-- Q&A 목록 -->
      <div class="qna-page__list">
        <QnaList
          :qnas="qnas"
          :loading="pending"
          :empty-message="qnaData.empty.message"
        />
      </div>

      <div class="qna-page__pagination">
        <BasePagination
          v-if="totalPages > 1"
          v-model:current-page="currentPage"
          :total-pages="totalPages"
          :prev-label="qnaData.pagination.prevLabel"
          :next-label="qnaData.pagination.nextLabel"
        />
      </div>

    </LayoutPage>

    <!-- 문의 작성 모달 -->
    <QnaWriteModal
      v-model="showWriteModal"
      qna-type="GENERAL"
      @submitted="handleWriteSubmitted"
    />
  </div>
</template>
