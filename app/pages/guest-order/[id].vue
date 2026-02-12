<script setup>
import guestOrderData from '~/data/guest-order.json'
import mainData from '~/data/main.json'
import mypageData from '~/data/mypage.json'

useHead({ title: guestOrderData.seo.title })
useSeoMeta({
  title: guestOrderData.seo.title,
  description: guestOrderData.seo.description
})

const route = useRoute()
const router = useRouter()
const { error, cancelGuestOrder } = useOrder()
const { success: toastSuccess, error: toastError } = useToast()
const cancelLabels = mypageData?.pages?.orderDetail?.labels || {}

const orderNumber = computed(() => route.params.id)

const loading = ref(true)
const order = ref(null)

onMounted(() => {
  // 로그인 페이지에서 전달받은 데이터 확인
  const cached = sessionStorage.getItem('guestOrderDetail')
  if (cached) {
    try {
      order.value = JSON.parse(cached)
      sessionStorage.removeItem('guestOrderDetail')
    } catch (e) {
      // 파싱 실패 시 로그인으로 리다이렉트
      router.replace('/login')
      return
    }
  } else {
    // sessionStorage에 데이터 없으면 로그인으로 리다이렉트
    router.replace('/login')
    return
  }
  loading.value = false
})

// 주문 취소 (비회원: 비밀번호 필요)
const handleCancel = async (orderNo) => {
  const password = prompt(cancelLabels.cancelPasswordPrompt)
  if (!password) return
  if (!confirm(cancelLabels.cancelConfirm)) return
  try {
    await cancelGuestOrder(orderNo, password)
    toastSuccess(cancelLabels.cancelSuccess)
    navigateTo('/', { replace: true })
  } catch (err) {
    toastError(err.data?.message || cancelLabels.cancelFail)
  }
}
</script>

<template>
  <LayoutPage :title="guestOrderData.page.title">
    <div class="mypage-order-detail-page">
      <div v-if="loading" class="mypage-order-detail-page__loading">
        <BaseSpinner size="large" :label="guestOrderData.loading" />
      </div>

      <div v-else-if="error" class="mypage-order-detail-page__error">
        {{ error }}
      </div>

      <MyPageOrderDetail v-else :order="order" @cancel="handleCancel" />
    </div>

    <template #footer>
      <Footer :data="mainData.footer" />
    </template>
  </LayoutPage>
</template>
