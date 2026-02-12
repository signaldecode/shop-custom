<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.reviews.seo.title })
useSeoMeta({
  title: mypageData.pages.reviews.seo.title,
  description: mypageData.pages.reviews.seo.description
})

const {
  reviews,
  loading,
  page,
  totalPages,
  fetchMyReviews,
  changePage,
  deleteReview
} = useMyReviews()

// 삭제 모달 상태
const showDeleteModal = ref(false)
const deleteTarget = ref(null)
const deleteModalData = mypageData.pages.reviews.deleteModal
const messages = mypageData.pages.reviews.messages

onMounted(() => {
  fetchMyReviews()
})

// 리뷰 상세 모달
const showDetailModal = ref(false)
const detailTarget = ref(null)

const handleReviewDetail = (review) => {
  detailTarget.value = review
  showDetailModal.value = true
}

// 수정 모달 상태
const showEditModal = ref(false)
const editTarget = ref(null)

const handleEditClick = (review) => {
  editTarget.value = review
  showEditModal.value = true
}

const handleEditSubmitted = () => {
  editTarget.value = null
  fetchMyReviews()
}

// 삭제 모달 열기
const handleDeleteClick = (review) => {
  deleteTarget.value = review
  showDeleteModal.value = true
}

// 삭제 확정
const confirmDelete = async () => {
  if (!deleteTarget.value) return

  showDeleteModal.value = false
  await deleteReview(deleteTarget.value.id, messages)
  deleteTarget.value = null
}

// 삭제 취소
const cancelDelete = () => {
  deleteTarget.value = null
}
</script>

<template>
  <div>
    <MyPageReviews
      :reviews="reviews"
      :loading="loading"
      :current-page="page"
      :total-pages="totalPages"
      @detail="handleReviewDetail"
      @update:current-page="changePage"
      @edit="handleEditClick"
      @delete="handleDeleteClick"
    />

    <!-- 리뷰 상세 모달 -->
    <ReviewDetailModal
      v-model="showDetailModal"
      :review="detailTarget"
    />

    <!-- 리뷰 수정 모달 -->
    <ReviewWriteModal
      v-model="showEditModal"
      :review="editTarget"
      @submitted="handleEditSubmitted"
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
  </div>
</template>
