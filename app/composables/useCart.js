/**
 * 장바구니 전역 상태 (Nuxt useState 기반)
 * - count는 "리스트 length" 기준 (요구사항)
 */
export const useCart = () => {
  const authStore = useAuthStore()
  const { apiFetch } = useApi()

  const items = useState('cart-items', () => [])
  const pending = useState('cart-pending', () => false)
  const error = useState('cart-error', () => null)

  const count = computed(() => items.value.length)

  const getOrCreateGuestSessionId = () => {
    // guest 식별용 (요구사항: X-Session-Id)
    const cookie = useCookie('x-session-id', {
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30d
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

    // member: token 기반이라고 되어있어서 대응(있으면 Bearer로)
    const tokenCookie = useCookie('access_token')
    const token =
      authStore.user?.accessToken ||
      authStore.user?.token ||
      tokenCookie.value ||
      ''

    if (token) headers.Authorization = `Bearer ${token}`

    // guest
    if (!authStore.isLoggedIn) {
      headers['X-Session-Id'] = getOrCreateGuestSessionId()
    }

    return headers
  }

  // 엔드포인트: /api 프록시 또는 apiBaseUrl에 /api/v1이 포함되어 있으므로 /cart만 사용
  const cartEndpoint = '/cart'

  const fetchCart = async () => {
    pending.value = true
    error.value = null
    try {
      const endpoint = cartEndpoint
      const res = await apiFetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      })

      // 다양한 응답 형태 대응
      const data = res?.data ?? res
      const nextItems = data?.items ?? data?.cartItems ?? data?.content ?? []
      items.value = Array.isArray(nextItems) ? nextItems : []

      return items.value
    } catch (e) {
      error.value = e?.data?.message || e?.message || '장바구니 조회에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  const setItems = (next) => {
    items.value = Array.isArray(next) ? next : []
  }

  /**
   * 장바구니에 상품 추가 (API 호출)
   * POST /api/v1/cart/items
   * @param {Object} params - 추가할 상품 정보
   * @param {string|number} params.productId - 상품 ID
   * @param {string|number} params.variantId - 옵션 variant ID (선택)
   * @param {number} params.quantity - 수량
   */
  const addToCart = async ({ productId, variantId, quantity = 1 }) => {
    pending.value = true
    error.value = null
    try {
      const baseEndpoint = cartEndpoint
      const endpoint = `${baseEndpoint}/items`

      const item = {
        productId,
        quantity
      }
      if (variantId) {
        item.variantId = variantId
      }

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: [item] // 배열로 전송
      })

      // 응답에서 장바구니 갱신
      const data = res?.data ?? res
      const nextItems = data?.items ?? data?.cartItems ?? data?.content ?? []
      if (Array.isArray(nextItems) && nextItems.length > 0) {
        items.value = nextItems
      } else {
        // 응답에 items가 없으면 다시 fetch
        await fetchCart()
      }

      return res
    } catch (e) {
      error.value = e?.data?.message || e?.message || '장바구니 추가에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 장바구니 상품 수량 변경 (API 호출)
   * PATCH /api/v1/cart/items/{itemId}
   * @param {string|number} itemId - 장바구니 아이템 ID
   * @param {number} quantity - 변경할 수량
   */
  const updateQuantity = async (itemId, quantity) => {
    pending.value = true
    error.value = null
    try {
      const baseEndpoint = cartEndpoint
      const endpoint = `${baseEndpoint}/items/${itemId}`

      const res = await apiFetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: { quantity }
      })

      // 로컬 상태 업데이트
      const index = items.value.findIndex(it => (it.id ?? it.cartItemId) === itemId)
      if (index > -1) {
        items.value[index] = { ...items.value[index], quantity }
        items.value = [...items.value]
      }

      return res
    } catch (e) {
      error.value = e?.data?.message || e?.message || '수량 변경에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 장바구니 상품 삭제 (API 호출)
   * DELETE /api/v1/cart/items
   * @param {string|number|Array} itemIds - 삭제할 아이템 ID(들)
   */
  const removeFromCart = async (itemIds) => {
    pending.value = true
    error.value = null
    try {
      const baseEndpoint = cartEndpoint
      const ids = Array.isArray(itemIds) ? itemIds : [itemIds]

      // 배열 형태로 body에 전달 (개별 삭제, 선택 삭제 모두 동일)
      const endpoint = `${baseEndpoint}/items`
      await apiFetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: ids
      })

      // 로컬 상태에서 삭제
      items.value = items.value.filter(it => {
        const id = it.id ?? it.cartItemId
        return !ids.includes(id)
      })

      return true
    } catch (e) {
      error.value = e?.data?.message || e?.message || '삭제에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 장바구니 전체 비우기 (API 호출)
   * DELETE /api/v1/cart
   */
  const clearCart = async () => {
    pending.value = true
    error.value = null
    try {
      const endpoint = cartEndpoint
      await apiFetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      // 로컬 상태 비우기
      items.value = []

      return true
    } catch (e) {
      error.value = e?.data?.message || e?.message || '장바구니 비우기에 실패했습니다.'
      throw e
    } finally {
      pending.value = false
    }
  }

  /**
   * 비회원 장바구니를 회원 장바구니로 머지 (로그인 시 호출)
   * POST /api/v1/cart/merge
   */
  const mergeCart = async () => {
    pending.value = true
    error.value = null
    try {
      const baseEndpoint = cartEndpoint
      const endpoint = `${baseEndpoint}/merge`

      // 비회원 세션 ID 가져오기
      const sessionCookie = useCookie('x-session-id')
      const sessionId = sessionCookie.value

      if (!sessionId) {
        // 세션 ID가 없으면 머지할 장바구니가 없음
        await fetchCart()
        return true
      }

      await apiFetch(endpoint, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'X-Session-Id': sessionId
        }
      })

      // 머지 후 장바구니 다시 조회
      await fetchCart()

      return true
    } catch (e) {
      error.value = e?.data?.message || e?.message || '장바구니 머지에 실패했습니다.'
      // 머지 실패해도 장바구니 조회는 시도
      try {
        await fetchCart()
      } catch {}
      throw e
    } finally {
      pending.value = false
    }
  }

  const addItem = (product) => {
    if (!product) return
    items.value = [...items.value, product]
  }

  const removeItemById = (id) => {
    items.value = items.value.filter((p) => p?.id !== id)
  }

  const clear = () => {
    items.value = []
  }

  /**
   * 상품이 장바구니에 있는지 확인
   * @param {number} productId - 상품 ID
   * @param {number} variantId - 옵션 ID (선택)
   */
  const isInCart = (productId, variantId = null) => {
    return items.value.some(item => {
      if (variantId) {
        return item.productId === productId && item.variantId === variantId
      }
      return item.productId === productId
    })
  }

  return {
    items,
    count,
    pending,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    mergeCart,
    setItems,
    addItem,
    removeItemById,
    clear,
    isInCart
  }
}

