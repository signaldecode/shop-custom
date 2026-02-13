/**
 * 네비게이션 유틸리티
 * 자주 사용하는 페이지 이동 함수 모음
 */
export const useNavigation = () => {
  const router = useRouter()

  // 상품 상세
  const goToProduct = (productId, options = {}) => {
    navigateTo(`/products/${productId}`, options)
  }

  // 카테고리
  const goToCategory = (categoryId = '', options = {}) => {
    const path = categoryId ? `/category/${categoryId}` : '/category'
    navigateTo(path, options)
  }

  // 장바구니
  const goToCart = (options = {}) => {
    navigateTo('/cart', options)
  }

  // 주문
  const goToOrder = (options = {}) => {
    navigateTo('/order', options)
  }

  // 주문 완료
  const goToOrderComplete = (orderNumber, amount, options = {}) => {
    navigateTo({
      path: '/order-complete',
      query: { orderNumber, amount }
    }, options)
  }

  // 주문 상세 (회원)
  const goToOrderDetail = (orderId, options = {}) => {
    navigateTo(`/mypage/orders/${orderId}`, options)
  }

  // 주문 상세 (비회원)
  const goToGuestOrder = (orderNumber, options = {}) => {
    navigateTo(`/guest-order/${orderNumber}`, options)
  }

  // 로그인
  const goToLogin = (redirect = '', options = {}) => {
    const query = redirect ? { redirect } : {}
    navigateTo({ path: '/login', query }, options)
  }

  // 회원가입
  const goToSignup = (options = {}) => {
    navigateTo('/signup', options)
  }

  // 마이페이지
  const goToMypage = (options = {}) => {
    navigateTo('/mypage', options)
  }

  // 홈
  const goToHome = (options = {}) => {
    navigateTo('/', options)
  }

  // 검색
  const goToSearch = (keyword = '', options = {}) => {
    const query = keyword ? { q: keyword } : {}
    navigateTo({ path: '/search', query }, options)
  }

  // 뒤로가기
  const goBack = () => {
    router.back()
  }

  // 히스토리 교체 (replace)
  const replaceTo = (path, options = {}) => {
    navigateTo(path, { replace: true, ...options })
  }

  return {
    goToProduct,
    goToCategory,
    goToCart,
    goToOrder,
    goToOrderComplete,
    goToOrderDetail,
    goToGuestOrder,
    goToLogin,
    goToSignup,
    goToMypage,
    goToHome,
    goToSearch,
    goBack,
    replaceTo
  }
}
