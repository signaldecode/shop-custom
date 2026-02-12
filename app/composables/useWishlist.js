/**
 * 위시리스트 전역 상태 (Nuxt useState 기반)
 */
export const useWishlist = () => {
  const authStore = useAuthStore()
  const { apiFetch } = useApi()

  const items = useState('wishlist-items', () => [])
  const pending = useState('wishlist-pending', () => false)
  const error = useState('wishlist-error', () => null)

  const count = computed(() => items.value.length)

  const getOrCreateGuestSessionId = () => {
    const cookie = useCookie('x-session-id', {
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    })

    if (!cookie.value) {
      const uuid =
        globalThis.crypto?.randomUUID?.() ||
        `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`
      cookie.value = uuid
    }

    return cookie.value
  }

  const getAuthHeaders = () => {
    const headers = {}

    const tokenCookie = useCookie('access_token')
    const token =
      authStore.user?.accessToken ||
      authStore.user?.token ||
      tokenCookie.value ||
      ''

    if (token) headers.Authorization = `Bearer ${token}`

    if (!authStore.isLoggedIn) {
      headers['X-Session-Id'] = getOrCreateGuestSessionId()
    }

    return headers
  }

  // 엔드포인트: /api 프록시 또는 apiBaseUrl에 /api/v1이 포함되어 있으므로 /wishlist만 사용
  const wishlistEndpoint = '/wishlist'

  /**
   * 위시리스트 조회
   * GET /api/v1/wishlist
   */
  const fetchWishlist = async () => {
    pending.value = true
    error.value = null
    try {
      const endpoint = wishlistEndpoint
      const res = await apiFetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      const data = res?.data ?? res
      const nextItems = data?.items ?? []
      items.value = Array.isArray(nextItems) ? nextItems : []

      return items.value
    } catch (e) {
      error.value = e?.data?.message || e?.message || '위시리스트 조회에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 위시리스트에 상품 추가
   * POST /api/v1/wishlist/items
   * @param {number} productId - 상품 ID
   */
  const addToWishlist = async (productId) => {
    pending.value = true
    error.value = null
    try {
      const baseEndpoint = wishlistEndpoint
      const endpoint = `${baseEndpoint}/items`

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: { productId }
      })

      const data = res?.data ?? res
      if (data) {
        items.value = [...items.value, data]
      }

      return res
    } catch (e) {
      error.value = e?.data?.message || e?.message || '위시리스트 추가에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 위시리스트에서 상품 삭제 (단일 또는 복수)
   * DELETE /api/v1/wishlist/items
   * @param {number|number[]} itemIds - 위시리스트 아이템 ID (단일 또는 배열)
   */
  const removeFromWishlist = async (itemIds) => {
    pending.value = true
    error.value = null
    try {
      const baseEndpoint = wishlistEndpoint
      const endpoint = `${baseEndpoint}/items`

      // 단일 ID도 배열로 변환
      const idsArray = Array.isArray(itemIds) ? itemIds : [itemIds]

      await apiFetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: idsArray
      })

      items.value = items.value.filter(item => !idsArray.includes(item.id))

      return true
    } catch (e) {
      error.value = e?.data?.message || e?.message || '위시리스트 삭제에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 위시리스트 전체 비우기
   * DELETE /api/v1/wishlist
   */
  const clearWishlist = async () => {
    pending.value = true
    error.value = null
    try {
      const endpoint = wishlistEndpoint

      await apiFetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      items.value = []

      return true
    } catch (e) {
      error.value = e?.data?.message || e?.message || '위시리스트 비우기에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 상품이 위시리스트에 있는지 확인
   * @param {number} productId - 상품 ID
   */
  const isInWishlist = (productId) => {
    return items.value.some(item => item.productId === productId)
  }

  /**
   * 상품 ID로 위시리스트 아이템 찾기
   * @param {number} productId - 상품 ID
   */
  const getWishlistItem = (productId) => {
    return items.value.find(item => item.productId === productId)
  }

  return {
    items,
    count,
    pending,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistItem
  }
}
