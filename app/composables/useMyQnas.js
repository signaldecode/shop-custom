/**
 * 내 Q&A 관리 Composable
 */
export const useMyQnas = () => {
  const { get, del } = useApi()
  const { success, error } = useToast()

  const qnas = ref([])
  const loading = ref(true)
  const page = ref(1)
  const totalElements = ref(0)
  const size = 10

  const totalPages = computed(() => Math.ceil(totalElements.value / size))

  // 날짜 포맷 함수
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  // Q&A 유형 한글명
  const getQnaTypeName = (type) => {
    const typeMap = {
      PRODUCT: '상품',
      ORDER: '주문',
      GENERAL: '일반',
      SHIPPING: '배송',
      PAYMENT: '결제',
      MEMBERSHIP: '회원'
    }
    return typeMap[type] || type || '문의'
  }

  /**
   * 내 Q&A 목록 조회
   */
  const fetchMyQnas = async () => {
    loading.value = true
    try {
      const response = await get('/qnas/me', {
        page: page.value - 1,
        size,
        sort: 'createdAt,DESC'
      })

      const data = response?.data || response
      qnas.value = (data.content || []).map(q => ({
        id: q.id,
        userId: q.userId,
        productId: q.productId,
        qnaType: q.qnaType,
        qnaTypeName: getQnaTypeName(q.qnaType),
        title: q.title,
        question: q.question,
        isSecret: q.isSecret,
        isAnswered: q.isAnswered,
        answer: q.answer,
        answeredAt: q.answeredAt ? formatDate(q.answeredAt) : null,
        date: formatDate(q.createdAt)
      }))
      totalElements.value = data.total_elements || 0
    } catch (error) {
      console.error('Failed to fetch my Q&A:', error)
      qnas.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 페이지 변경
   */
  const changePage = (newPage) => {
    page.value = newPage
    fetchMyQnas()
  }

  /**
   * Q&A 삭제
   */
  const deleteQna = async (qnaId, messages) => {
    try {
      await del(`/qnas/${qnaId}`)
      success(messages.deleteSuccess)

      // 현재 페이지의 마지막 Q&A 삭제 시 이전 페이지로 이동
      if (qnas.value.length === 1 && page.value > 1) {
        page.value -= 1
      }

      await fetchMyQnas()
      return true
    } catch (err) {
      console.error('Failed to delete Q&A:', err)
      error(messages.deleteError)
      return false
    }
  }

  return {
    qnas,
    loading,
    page,
    totalPages,
    fetchMyQnas,
    changePage,
    deleteQna
  }
}
