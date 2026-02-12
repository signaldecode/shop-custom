/**
 * 공지사항 API composable
 * GET /api/v1/notices - 공지사항 목록 조회
 * GET /api/v1/notices/{id} - 공지사항 상세 조회
 */
export const useNotices = () => {
  const { get } = useApi()

  const notices = ref([])
  const notice = ref(null)
  const totalCount = ref(0)
  const totalPages = ref(0)
  const pending = ref(false)
  const error = ref(null)

  // 날짜 포맷 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  /**
   * 공지사항 목록 조회
   * @param {Object} params - 조회 파라미터
   * @param {string} params.type - 카테고리 (NOTICE, INSPECTION, GUIDELINES, EVENT)
   * @param {string} params.keyword - 검색어 (제목/내용)
   * @param {number} params.page - 페이지 (0-based)
   * @param {number} params.size - 페이지 크기
   * @param {string} params.sort - 정렬 (예: createdAt,DESC)
   */
  const fetchNotices = async (params = {}) => {
    pending.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()

      if (params.type) {
        queryParams.append('type', params.type)
      }
      if (params.keyword) {
        queryParams.append('keyword', params.keyword)
      }
      if (params.page !== undefined) {
        queryParams.append('page', params.page)
      }
      if (params.size) {
        queryParams.append('size', params.size)
      }
      if (params.sort) {
        queryParams.append('sort', params.sort)
      }

      const queryString = queryParams.toString()
      const url = queryString ? `/notices?${queryString}` : '/notices'

      const response = await get(url)
      const data = response.data || response

      // 공지사항 데이터 변환
      notices.value = (data.content || data.items || []).map(notice => ({
        id: notice.id,
        type: notice.type,
        typeDescription: notice.typeDescription || getTypeDescription(notice.type),
        title: notice.title,
        isPinned: notice.isPinned,
        date: formatDate(notice.createdAt)
      }))

      totalCount.value = data.totalElements || data.total_elements || data.total || notices.value.length
      totalPages.value = data.totalPages || data.total_pages || Math.ceil(totalCount.value / (params.size || 10))

      return {
        notices: notices.value,
        totalCount: totalCount.value,
        totalPages: totalPages.value
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err)
      error.value = err.data?.message || err.message || '공지사항을 불러오는데 실패했습니다.'
      throw err
    } finally {
      pending.value = false
    }
  }

  // 타입 한글명
  const getTypeDescription = (type) => {
    const typeMap = {
      NOTICE: '공지사항',
      INSPECTION: '점검',
      GUIDELINES: '안내',
      EVENT: '이벤트'
    }
    return typeMap[type] || type || '공지'
  }

  /**
   * 공지사항 상세 조회
   * @param {number} id - 공지사항 ID
   */
  const fetchNotice = async (id) => {
    pending.value = true
    error.value = null

    try {
      const response = await get(`/notices/${id}`)
      const data = response.data || response

      notice.value = {
        id: data.id,
        type: data.type,
        typeDescription: data.typeDescription || getTypeDescription(data.type),
        title: data.title,
        content: data.content,
        isPinned: data.isPinned,
        viewCount: data.viewCount || 0,
        date: formatDate(data.createdAt)
      }

      return notice.value
    } catch (err) {
      console.error('Failed to fetch notice:', err)
      error.value = err.data?.message || err.message || '공지사항을 불러오는데 실패했습니다.'
      throw err
    } finally {
      pending.value = false
    }
  }

  return {
    notices,
    notice,
    totalCount,
    totalPages,
    pending,
    error,
    fetchNotices,
    fetchNotice,
    getTypeDescription
  }
}
