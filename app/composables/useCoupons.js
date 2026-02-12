/**
 * 쿠폰 관리 API composable
 * GET /coupons/my - 내 쿠폰 목록 조회
 */

import {
  formatDate,
  formatDateTimeKorean,
  getDDay
} from '~/utils/dateFormat'

export const useCoupons = () => {
  const { get } = useApi()

  const coupons = ref([])
  const pending = ref(false)
  const error = ref(null)

  /**
   * 내 쿠폰 목록 조회
   * GET /coupons/my
   */
  const fetchCoupons = async () => {
    pending.value = true
    error.value = null

    try {
      const response = await get('/coupons/my')
      coupons.value = response.data || response || []
      return coupons.value
    } catch (e) {
      error.value = e.data?.message || '쿠폰 목록을 불러오는데 실패했습니다.'
      coupons.value = []
      return []
    } finally {
      pending.value = false
    }
  }

  /**
   * 할인 텍스트 생성
   */
  const getDiscountText = (coupon) => {
    // API: RATE | AMOUNT
    if (coupon.discountType === 'RATE') {
      return `${coupon.discountValue}%`
    }
    return `${Number(coupon.discountValue).toLocaleString()}원`
  }

  /**
   * 쿠폰 타입 텍스트
   */
  const getCouponTypeText = (couponType) => {
    const typeMap = {
      PRODUCT_DISCOUNT: '상품 할인',
      CART_DISCOUNT: '장바구니 할인',
      SHIPPING_DISCOUNT: '배송비 할인'
    }
    return typeMap[couponType] || couponType
  }

  /**
   * 쿠폰 데이터 변환 (API → UI)
   */
  const transformCoupon = (coupon) => {
    const dDay = getDDay(coupon.expiredAt)
    const isExpiringSoon = dDay && parseInt(dDay.replace('D-', '')) <= 7

    return {
      id: coupon.userCouponId,
      couponId: coupon.couponId,
      name: coupon.couponName,
      description: coupon.description || '',
      notice: coupon.notice || '',
      couponType: coupon.couponType,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      status: coupon.status,
      downloadedAt: coupon.downloadedAt,
      expiredAt: coupon.expiredAt,
      usedAt: coupon.usedAt,
      allowPromotionOverlap: coupon.allowPromotionOverlap ?? false,
      // UI용 변환 필드
      discountText: getDiscountText(coupon),
      couponTypeText: getCouponTypeText(coupon.couponType),
      minOrderText: coupon.minOrderAmount
        ? `${Number(coupon.minOrderAmount).toLocaleString()}원`
        : null,
      maxDiscountText: coupon.maxDiscountAmount
        ? `최대 ${Number(coupon.maxDiscountAmount).toLocaleString()}원`
        : null,
      downloadedAtText: formatDateTimeKorean(coupon.downloadedAt),
      expiredAtText: formatDateTimeKorean(coupon.expiredAt),
      usedAtText: coupon.usedAt ? formatDateTimeKorean(coupon.usedAt) : null,
      validPeriodText: `${formatDate(coupon.downloadedAt)} ~ ${formatDate(coupon.expiredAt)}`,
      validPeriodDetailText: `${formatDateTimeKorean(coupon.downloadedAt)} ~ ${formatDateTimeKorean(coupon.expiredAt)}`,
      endDateText: formatDate(coupon.expiredAt),
      target: '전체 상품',
      targetUrl: '/products',
      dDay,
      isExpiringSoon
    }
  }

  /**
   * 상태별 필터링된 쿠폰
   */
  const availableCoupons = computed(() =>
    coupons.value.filter(c => c.status === 'AVAILABLE').map(transformCoupon)
  )

  const usedCoupons = computed(() =>
    coupons.value.filter(c => c.status === 'USED').map(transformCoupon)
  )

  const expiredCoupons = computed(() =>
    coupons.value.filter(c => c.status === 'EXPIRED').map(transformCoupon)
  )

  /**
   * 전체 변환된 쿠폰
   */
  const transformedCoupons = computed(() =>
    coupons.value.map(transformCoupon)
  )

  /**
   * 쿠폰 개수
   */
  const couponCounts = computed(() => ({
    available: availableCoupons.value.length,
    used: usedCoupons.value.length,
    expired: expiredCoupons.value.length
  }))

  return {
    // 상태
    coupons,
    transformedCoupons,
    availableCoupons,
    usedCoupons,
    expiredCoupons,
    couponCounts,
    pending,
    error,
    // 메서드
    fetchCoupons,
    transformCoupon,
    getDiscountText
  }
}
