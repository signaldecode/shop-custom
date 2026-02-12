<script setup>
import mypageData from '~/data/mypage.json'

definePageMeta({
  layout: 'mypage'
})

useHead({ title: mypageData.pages.orderDetail.seo.title })
useSeoMeta({
  title: mypageData.pages.orderDetail.seo.title,
  description: mypageData.pages.orderDetail.seo.description
})

const route = useRoute()
const { getOrder, getOrderByNumber, cancelOrder, transformOrderDetail, error } = useOrder()
const { success: toastSuccess, error: toastError } = useToast()
const cancelLabels = mypageData.pages.orderDetail.labels

// route.params.id는 orderId 또는 orderNumber
const id = computed(() => route.params.id)
// type=number이면 orderNumber로 조회
const isOrderNumber = computed(() => route.query.type === 'number')

// 로딩 상태 (페이지 진입 시부터 true)
const loading = ref(true)

// 주문 상세 데이터
const order = ref(null)

// 주문 상세 조회
const fetchOrderDetail = async () => {
  if (!id.value) return

  loading.value = true
  try {
    // orderId가 null인 경우 orderNumber로 조회
    const data = isOrderNumber.value
      ? await getOrderByNumber(id.value)
      : await getOrder(id.value)
    order.value = transformOrderDetail(data)
  } catch (err) {
    console.error('Failed to fetch order detail:', err)
  } finally {
    loading.value = false
  }
}

// 주문 취소
const handleCancel = async (orderNo) => {
  if (!confirm(cancelLabels.cancelConfirm)) return
  try {
    await cancelOrder(orderNo)
    toastSuccess(cancelLabels.cancelSuccess)
    navigateTo('/mypage/orders', { replace: true })
  } catch (err) {
    toastError(err.data?.message || cancelLabels.cancelFail)
  }
}

// 페이지 진입 시 주문 상세 조회
onMounted(() => {
  fetchOrderDetail()
})
</script>

<template>
  <div class="mypage-order-detail-page">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="mypage-order-detail-page__loading">
      <BaseSpinner size="large" :label="mypageData.pages.orderDetail.loading" />
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="mypage-order-detail-page__error">
      {{ error }}
    </div>

    <!-- 주문 상세 내역 -->
    <MyPageOrderDetail v-else :order="order" @cancel="handleCancel" />
  </div>
</template>
