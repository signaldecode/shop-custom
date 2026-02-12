<script setup>
import paymentData from '~/data/payment.json'
import mainData from '~/data/main.json'

const route = useRoute()
const router = useRouter()
const { confirmPayment } = usePayments()
const { clearOrderItems } = useOrder()
const { removeFromCart } = useCart()

useHead({ title: paymentData.success.seo.title })
useSeoMeta({
  title: paymentData.success.seo.title,
  description: paymentData.success.seo.description
})

const status = ref('loading') // loading | success | error
const errorMessage = ref('')

onMounted(async () => {
  const { paymentKey, orderId, amount } = route.query

  if (!paymentKey || !orderId || !amount) {
    status.value = 'error'
    errorMessage.value = '결제 정보가 올바르지 않습니다.'
    return
  }

  try {
    // 서버에 결제 승인 요청
    const confirmData = {
      paymentKey: String(paymentKey),
      orderId: String(orderId),
      amount: Number(amount)
    }
    await confirmPayment(confirmData)

    // sessionStorage에서 주문 정보 가져오기
    const paymentOrder = JSON.parse(sessionStorage.getItem('paymentOrder') || '{}')

    // 장바구니 항목 삭제
    if (paymentOrder.cartItemIds?.length > 0) {
      try {
        await removeFromCart(paymentOrder.cartItemIds)
      } catch (e) {
        console.warn('Failed to remove cart items:', e)
      }
    }

    // 주문 상품 정보 삭제
    clearOrderItems()
    sessionStorage.removeItem('paymentOrder')

    // 주문완료 페이지로 이동
    const queryParams = new URLSearchParams()
    if (paymentOrder.orderId) queryParams.append('orderId', paymentOrder.orderId)
    if (paymentOrder.orderNumber) queryParams.append('orderNumber', paymentOrder.orderNumber)
    router.replace(`/order-complete?${queryParams.toString()}`)
  } catch (err) {
    status.value = 'error'
    errorMessage.value = err.data?.message || err.message || '결제 승인에 실패했습니다.'
  }
})

const goHome = () => navigateTo('/', { replace: true })
const retry = () => navigateTo('/order', { replace: true })
</script>

<template>
  <div class="page-payment-result">
    <main class="payment-result">
      <!-- 로딩 (승인 처리 중) -->
      <div v-if="status === 'loading'" class="payment-result__loading">
        <BaseSpinner size="large" />
        <h1 class="payment-result__title">{{ paymentData.success.message }}</h1>
        <p class="payment-result__description">{{ paymentData.success.description }}</p>
      </div>

      <!-- 승인 실패 -->
      <div v-else-if="status === 'error'" class="payment-result__error">
        <h1 class="payment-result__title">{{ paymentData.success.errorTitle }}</h1>
        <p class="payment-result__description">{{ errorMessage }}</p>
        <div class="payment-result__buttons">
          <BaseButton
            :label="paymentData.success.retryButton"
            variant="line"
            color="black"
            size="big"
            @click="retry"
          />
          <BaseButton
            :label="paymentData.success.homeButton"
            variant="bg"
            color="green"
            size="big"
            @click="goHome"
          />
        </div>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
