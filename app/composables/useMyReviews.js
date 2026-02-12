/**
 * 내 리뷰 관리 Composable
 */
export const useMyReviews = () => {
  const { get, del, put } = useApi()
  const { success, error } = useToast()

  const reviews = ref([])
  const loading = ref(true)
  const page = ref(1)
  const totalElements = ref(0)
  const size = 10

  const totalPages = computed(() => Math.ceil(totalElements.value / size))

  /**
   * 내 리뷰 목록 조회
   */
  const fetchMyReviews = async () => {
    loading.value = true
    try {
      const response = await get('/reviews/me', {
        page: page.value - 1,
        size,
        sort: 'createdAt,DESC'
      })
      reviews.value = response?.data?.content || []
      totalElements.value = response?.data?.total_elements || 0
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      reviews.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 페이지 변경
   */
  const changePage = (newPage) => {
    page.value = newPage
    fetchMyReviews()
  }

  /**
   * 리뷰 삭제
   */
  const deleteReview = async (reviewId, messages) => {
    try {
      await del(`/reviews/${reviewId}`)
      success(messages.deleteSuccess)

      // 현재 페이지의 마지막 리뷰 삭제 시 이전 페이지로 이동
      if (reviews.value.length === 1 && page.value > 1) {
        page.value -= 1
      }

      await fetchMyReviews()
      return true
    } catch (err) {
      console.error('Failed to delete review:', err)
      error(messages.deleteError)
      return false
    }
  }

  /**
   * 리뷰 수정
   * @param {number} reviewId - 리뷰 ID
   * @param {Object} reviewData - 리뷰 데이터 { rating, title, content }
   * @param {Array} existingImages - 유지할 기존 이미지 URL 배열
   * @param {Array} newImages - 새로 추가할 이미지 파일 배열
   * @param {Object} messages - 메시지 객체
   */
  const updateReview = async (reviewId, reviewData, existingImages = [], newImages = [], messages) => {
    try {
      const formData = new FormData()

      // review 객체를 JSON Blob으로 추가
      const reviewPayload = {
        rating: reviewData.rating,
        title: reviewData.title || null,
        content: reviewData.content,
        existingImages
      }
      formData.append('review', new Blob([JSON.stringify(reviewPayload)], { type: 'application/json' }))

      // 새 이미지 파일 추가
      newImages.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file)
        }
      })

      await put(`/reviews/${reviewId}`, formData)
      success(messages.updateSuccess)

      await fetchMyReviews()
      return true
    } catch (err) {
      console.error('Failed to update review:', err)
      error(messages.updateError)
      return false
    }
  }

  return {
    reviews,
    loading,
    page,
    totalPages,
    fetchMyReviews,
    changePage,
    deleteReview,
    updateReview
  }
}
