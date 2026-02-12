/**
 * 배송지 관리 API composable
 * GET    /users/addresses           - 배송지 목록 조회
 * GET    /users/addresses/:id       - 배송지 상세 조회
 * POST   /users/addresses           - 배송지 등록
 * PUT    /users/addresses/:id       - 배송지 수정
 * DELETE /users/addresses/:id       - 배송지 삭제
 * PATCH  /users/addresses/:id/default - 기본 배송지 설정
 */
// 상태를 컴포저블 외부에 선언하여 싱글톤으로 관리
const addresses = ref([])
const pending = ref(false)
const error = ref(null)
const fetched = ref(false)

export const useAddress = () => {
  const { get, post, put, patch, del } = useApi()

  /**
   * 배송지 목록 조회
   * 기본 배송지가 먼저 노출, 이후 최신순 정렬
   */
  const fetchAddresses = async (force = false) => {
    // 이미 로딩 중이거나 이미 조회된 경우 스킵 (force가 아닌 경우)
    if (pending.value) return addresses.value
    if (fetched.value && !force) return addresses.value

    pending.value = true
    error.value = null

    try {
      const response = await get('/users/addresses')
      addresses.value = response.data || response || []
      fetched.value = true
      return addresses.value
    } catch (e) {
      error.value = e
      console.error('Failed to fetch addresses:', e)
      return []
    } finally {
      pending.value = false
    }
  }

  /**
   * 배송지 상세 조회
   * @param {number} addressId - 배송지 ID
   */
  const getAddress = async (addressId) => {
    try {
      const response = await get(`/users/addresses/${addressId}`)
      return response.data || response
    } catch (e) {
      error.value = e
      throw e
    }
  }

  /**
   * 배송지 등록
   * @param {object} address - 배송지 정보
   */
  const addAddress = async (address) => {
    try {
      const response = await post('/users/addresses', address)
      await fetchAddresses(true) // 목록 갱신 (force)
      return response
    } catch (e) {
      error.value = e
      throw e
    }
  }

  /**
   * 배송지 수정
   * @param {number} addressId - 배송지 ID
   * @param {object} address - 배송지 정보
   */
  const updateAddress = async (addressId, address) => {
    try {
      const response = await put(`/users/addresses/${addressId}`, address)
      await fetchAddresses(true) // 목록 갱신 (force)
      return response
    } catch (e) {
      error.value = e
      throw e
    }
  }

  /**
   * 배송지 삭제
   * @param {number} addressId - 배송지 ID
   */
  const deleteAddress = async (addressId) => {
    try {
      await del(`/users/addresses/${addressId}`)
      await fetchAddresses(true) // 목록 갱신 (force)
    } catch (e) {
      error.value = e
      throw e
    }
  }

  /**
   * 기본 배송지로 설정
   * @param {number} addressId - 배송지 ID
   */
  const setDefaultAddress = async (addressId) => {
    try {
      const response = await patch(`/users/addresses/${addressId}/default`)
      await fetchAddresses(true) // 목록 갱신 (force)
      return response
    } catch (e) {
      error.value = e
      throw e
    }
  }

  /**
   * 배송지 데이터 변환 (API → UI)
   */
  const transformAddress = (address) => ({
    id: address.id,
    name: address.addressName || address.name,
    recipient: address.recipientName,
    phone: address.recipientPhone,
    zipcode: address.postalCode,
    address: address.address1,
    addressDetail: address.address2,
    isDefault: address.isDefault || address.is_default || false
  })

  /**
   * 변환된 배송지 목록
   */
  const transformedAddresses = computed(() => {
    return addresses.value.map(transformAddress)
  })

  /**
   * 기본 배송지
   */
  const defaultAddress = computed(() => {
    return transformedAddresses.value.find(addr => addr.isDefault) || null
  })

  /**
   * 상태 초기화 (로그아웃 등에서 사용)
   */
  const resetAddresses = () => {
    addresses.value = []
    fetched.value = false
    error.value = null
  }

  return {
    // 상태
    addresses,
    transformedAddresses,
    defaultAddress,
    pending,
    error,
    // 메서드
    fetchAddresses,
    getAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    transformAddress,
    resetAddresses
  }
}
