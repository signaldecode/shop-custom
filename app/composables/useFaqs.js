/**
 * FAQ API composable
 * GET /api/v1/faqs/categories - 카테고리 목록 조회
 * GET /api/v1/faqs - FAQ 목록 조회
 */
export const useFaqs = () => {
  const { get } = useApi()

  const faqs = ref([])
  const categories = ref([])
  const totalCount = ref(0)
  const totalPages = ref(0)
  const pending = ref(false)
  const error = ref(null)
  const categoryPending = ref(false)
  const categoryError = ref(null)

  /**
   * FAQ 카테고리 목록 조회
   */
  const fetchCategories = async () => {
    categoryPending.value = true
    categoryError.value = null

    try {
      const response = await get('/faqs/categories')
      const data = response.data || response

      categories.value = (Array.isArray(data) ? data : [])
        .filter(c => c.isActive)
        .map(c => ({
          id: c.id,
          name: c.name
        }))

      return categories.value
    } catch (err) {
      console.error('Failed to fetch FAQ categories:', err)
      categoryError.value = err.data?.message || err.message
      throw err
    } finally {
      categoryPending.value = false
    }
  }

  /**
   * FAQ 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {number} params.categoryId - 카테고리 ID (선택)
   * @param {number} params.page - 페이지 (0-based)
   * @param {number} params.size - 페이지 크기
   */
  const fetchFaqs = async (params = {}) => {
    pending.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      if (params.categoryId) {
        queryParams.append('categoryId', params.categoryId)
      }
      if (params.page !== undefined) {
        queryParams.append('page', params.page)
      }
      if (params.size) {
        queryParams.append('size', params.size)
      }

      const queryString = queryParams.toString()
      const url = queryString ? `/faqs?${queryString}` : '/faqs'

      const response = await get(url)
      const data = response.data || response

      faqs.value = (data.content || []).map(item => ({
        id: item.id,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        question: item.question,
        answer: item.answer
      }))

      totalCount.value = data.totalElements || data.total_elements || data.total || faqs.value.length
      totalPages.value = data.totalPages || data.total_pages || Math.ceil(totalCount.value / (params.size || 10))

      return {
        faqs: faqs.value,
        totalCount: totalCount.value,
        totalPages: totalPages.value
      }
    } catch (err) {
      console.error('Failed to fetch FAQs:', err)
      error.value = err.data?.message || err.message
      throw err
    } finally {
      pending.value = false
    }
  }

  return {
    faqs,
    categories,
    totalCount,
    totalPages,
    pending,
    error,
    categoryPending,
    categoryError,
    fetchCategories,
    fetchFaqs
  }
}
