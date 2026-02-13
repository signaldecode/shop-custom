/**
 * 클레임(반품) API composable
 * POST /claims - 반품 신청
 */
export const useClaim = () => {
  const { post } = useApi()

  const pending = ref(false)
  const error = ref(null)

  /**
   * 클레임 신청 (반품)
   * @param {Object} payload - 클레임 데이터
   * @param {number} payload.orderId - 주문 ID
   * @param {string} payload.claimType - 클레임 유형 (RETURN)
   * @param {string} payload.reasonType - 사유 유형 (CHANGE_OF_MIND, DEFECTIVE, WRONG_DELIVERY, DELAYED_DELIVERY, OUT_OF_STOCK, OTHER)
   * @param {string} payload.reason - 상세 사유
   * @param {Array} payload.items - 클레임 상품 목록 [{ orderItemId, quantity, exchangeVariantId }]
   * @param {number} payload.estimatedRefundAmount - 예상 환불 금액
   * @param {string} [payload.refundMethod] - 환불 방법 (ORIGINAL, BANK)
   * @param {string} [payload.bankName] - 은행명
   * @param {string} [payload.bankAccount] - 계좌번호
   * @param {string} [payload.bankHolder] - 예금주
   */
  const createClaim = async (payload) => {
    pending.value = true
    error.value = null

    try {
      const response = await post('/claims', payload)

      if (response.success) {
        return {
          success: true,
          data: response.data
        }
      }

      throw new Error(response.message || '반품 신청에 실패했습니다.')
    } catch (err) {
      let errorMessage = '반품 신청 중 오류가 발생했습니다.'

      const responseData = err.response?._data || err.data

      if (responseData?.error?.message) {
        errorMessage = responseData.error.message
      } else if (responseData?.message) {
        errorMessage = responseData.message
      } else if (err.message) {
        errorMessage = err.message
      }

      error.value = errorMessage
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      pending.value = false
    }
  }

  return {
    pending,
    error,
    createClaim
  }
}
