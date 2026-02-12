<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.qna.seo.title })
useSeoMeta({
  title: mypageData.pages.qna.seo.title,
  description: mypageData.pages.qna.seo.description
})

const {
  qnas,
  loading,
  page,
  totalPages,
  fetchMyQnas,
  changePage,
  deleteQna
} = useMyQnas()

// 삭제 모달 상태
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleteModalData = mypageData.pages.qna.deleteModal
const messages = mypageData.pages.qna.messages
const labels = mypageData.pages.qna.labels

onMounted(() => {
  fetchMyQnas()
})

// 삭제 모달 열기
const handleDeleteClick = (qna) => {
  deleteTarget.value = qna
  showDeleteModal.value = true
}

// 삭제 확정
const confirmDelete = async () => {
  if (!deleteTarget.value) return

  showDeleteModal.value = false
  await deleteQna(deleteTarget.value.id, messages)
  deleteTarget.value = null
}

// 삭제 취소
const cancelDelete = () => {
  deleteTarget.value = null
}

// 문의 작성 모달
const showWriteModal = ref(false)

const handleWriteSubmitted = () => {
  fetchMyQnas()
}
</script>

<template>
  <div class="mypage-qna">
    <div class="mypage-qna__header">
      <h2 class="mypage-qna__title">{{ mypageData.pages.qna.title }}</h2>
      <BaseButton
        :label="mypageData.pages.qna.labels.write"
        variant="bg"
        color="green"
        size="small"
        @click="showWriteModal = true"
      />
    </div>

    <QnaList
      :qnas="qnas"
      :loading="loading"
      :empty-message="mypageData.pages.qna.empty"
      :show-delete="true"
      :delete-label="labels.delete"
      @delete="handleDeleteClick"
    />

    <BasePagination
      v-if="totalPages > 1"
      :current-page="page"
      :total-pages="totalPages"
      class="mypage-qna__pagination"
      @update:current-page="changePage"
    />

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      v-model="showDeleteModal"
      :title="deleteModalData.title"
      :message="deleteModalData.message"
      :confirm-label="deleteModalData.confirm"
      :cancel-label="deleteModalData.cancel"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- 문의 작성 모달 -->
    <QnaWriteModal
      v-model="showWriteModal"
      qna-type="GENERAL"
      @submitted="handleWriteSubmitted"
    />
  </div>
</template>
