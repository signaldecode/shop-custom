/**
 * 팝업 API composable
 * GET /popups - 활성 팝업 목록 조회
 */
export const usePopup = () => {
  const { get } = useApi()

  const centerPopups = ref([])
  const floatingPopups = ref([])
  const pending = ref(false)
  const error = ref(null)

  /**
   * 날짜 문자열 (YYYY-MM-DD)
   */
  const toDateStr = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  /**
   * 팝업이 숨김 상태인지 확인
   */
  const isHidden = (popupId) => {
    if (!import.meta.client) return false

    const hideUntil = localStorage.getItem(`popup_hide_${popupId}`)
    if (!hideUntil) return false

    return toDateStr(new Date()) <= hideUntil
  }

  /**
   * 팝업 목록 조회
   */
  const fetchPopups = async () => {
    pending.value = true
    error.value = null

    try {
      const response = await get('/popups')
      const data = response.data || response || {}

      // 타입별 분리 + 숨김 필터링
      const allCenter = data.CENTER || data.center || []
      const allFloating = data.FLOATING || data.floating || []

      centerPopups.value = allCenter.filter(p => !isHidden(p.id))
      floatingPopups.value = allFloating.filter(p => !isHidden(p.id))
    } catch (e) {
      console.error('Failed to fetch popups:', e)
      error.value = e
    } finally {
      pending.value = false
    }
  }

  /**
   * 팝업 닫기
   * @param {number} id - 팝업 ID
   * @param {string} type - 'close' | 'day' | 'week'
   */
  const dismissPopup = (id, type = 'close') => {
    if (import.meta.client && type !== 'close') {
      const now = new Date()
      const days = type === 'WEEK' ? 7 : 1
      const hideUntil = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days - 1)
      localStorage.setItem(`popup_hide_${id}`, toDateStr(hideUntil))
    }

    // 목록에서 제거
    centerPopups.value = centerPopups.value.filter(p => p.id !== id)
    floatingPopups.value = floatingPopups.value.filter(p => p.id !== id)
  }

  return {
    centerPopups,
    floatingPopups,
    pending,
    error,
    fetchPopups,
    dismissPopup
  }
}
