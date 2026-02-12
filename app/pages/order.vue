<script setup>
import orderData from '~/data/order.json'
import mainData from '~/data/main.json'
import { validate } from '~/utils/validators'

const router = useRouter()
const authStore = useAuthStore()
const { warning } = useToast()
const { getOrderItems, clearOrderItems, createOrder } = useOrder()
const { requestPayment } = usePayments()
const { fetchAddresses, defaultAddress } = useAddress()
const { removeFromCart } = useCart()
const { freeShippingAmount, baseShippingFee } = useShopInfo()

// SEO
useHead({ title: orderData.seo.title })
useSeoMeta({
  title: orderData.seo.title,
  description: orderData.seo.description,
  ogTitle: orderData.seo.title,
  ogDescription: orderData.seo.description,
  ogImage: orderData.seo.ogImage
})

// 회원 여부
const isMember = computed(() => authStore.isLoggedIn)

// 주문 상품 (바로구매 or 장바구니에서 가져옴)
const orderItems = ref([])

onMounted(async () => {
  // 주문 상품 로드
  const items = getOrderItems()
  if (items.length > 0) {
    orderItems.value = items
  }

  // 회원인 경우 배송지 목록 가져오기
  if (isMember.value) {
    // 배송지 목록 조회 (user 정보는 SSR에서 이미 가져옴)
    await fetchAddresses()

    // 주문자 정보 채우기 (SSR에서 가져온 user 정보 사용)
    if (authStore.user) {
      orderer.name = authStore.user.name || ''
      orderer.phone = authStore.user.phone || ''
      orderer.email = authStore.user.email || ''
    }

    // 기본 배송지로 배송 정보 채우기
    if (defaultAddress.value) {
      shipping.recipient = defaultAddress.value.recipient || ''
      shipping.phone = defaultAddress.value.phone || ''
      shipping.zipcode = defaultAddress.value.zipcode || ''
      shipping.address = defaultAddress.value.address || ''
      shipping.addressDetail = defaultAddress.value.addressDetail || ''
    } else if (authStore.user) {
      // 기본 배송지가 없으면 회원 정보로 수령인/연락처만 채우기
      shipping.recipient = authStore.user.name || ''
      shipping.phone = authStore.user.phone || ''
    }
  }
})

// 주문 상품 목록 (UI용 변환)
const orderProducts = computed(() => {
  if (orderItems.value.length > 0) {
    return orderItems.value.map(item => ({
      id: item.productId,
      name: item.productName,
      image: item.productImage,
      option: item.optionName,
      quantity: item.quantity,
      price: item.price,
      totalPrice: item.totalPrice
    }))
  }
  // 폴백: 더미 데이터
  return orderData.dummy.products
})

// Form State
const orderer = reactive({
  name: '',
  phone: '',
  email: ''
})

const shipping = reactive({
  sameAsOrderer: false,
  recipient: '',
  phone: '',
  zipcode: '',
  address: '',
  addressDetail: '',
  memo: '',
  customMemo: ''
})

const guestPassword = reactive({
  password: '',
  passwordConfirm: ''
})

const payment = reactive({
  method: 'card',
  cardCompany: '',
  installment: '0',
  bank: '',
  depositor: ''
})

const coupon = reactive({
  point: ''
})

// 쿠폰 선택 모달
const isCouponModalOpen = ref(false)
const selectedCoupon = ref(null)
const couponDiscount = ref(0)

const agreements = reactive({
  all: false,
  terms: false,
  privacy: false
})

// 주문자 정보와 동일 처리
watch(() => shipping.sameAsOrderer, (val) => {
  if (val) {
    shipping.recipient = orderer.name
    shipping.phone = orderer.phone
  }
})

// 결제 금액 계산
const summary = computed(() => {
  // 상품 총액 계산
  const productTotal = orderItems.value.length > 0
    ? orderItems.value.reduce((sum, item) => sum + item.totalPrice, 0)
    : orderData.dummy.summary.productTotal

  // 배송비 계산 (무료배송 기준 충족 시 무료)
  const freeThreshold = freeShippingAmount.value || 50000
  const baseFee = baseShippingFee.value || 3000
  const shippingFee = productTotal >= freeThreshold ? 0 : baseFee

  const base = {
    productTotal,
    shippingFee,
    discount: 0,
    couponDiscount: couponDiscount.value,
    pointUsed: 0,
    total: 0
  }

  // 포인트 사용
  const pointUsed = parseInt(coupon.point) || 0
  base.pointUsed = Math.min(pointUsed, orderData.dummy.availablePoint)

  // 총 결제 금액
  base.total = base.productTotal + base.shippingFee - base.discount - base.couponDiscount - base.pointUsed

  return base
})

// 필수 약관 동의 여부 (회원은 약관 동의 불필요)
const isAgreementValid = computed(() => {
  if (isMember.value) return true
  return agreements.terms && agreements.privacy
})

// 배송지 선택 모달
const isAddressModalOpen = ref(false)

// 배송지 선택 (저장된 배송지 목록에서 선택)
const selectAddress = () => {
  isAddressModalOpen.value = true
}

// 배송지 선택 완료 처리
const handleAddressSelect = (address) => {
  shipping.recipient = address.recipient
  shipping.phone = address.phone
  shipping.zipcode = address.zipcode
  shipping.address = address.address
  shipping.addressDetail = address.addressDetail || ''
}

// 쿠폰 모달 열기
const openCouponModal = () => {
  isCouponModalOpen.value = true
}

// 쿠폰 선택 완료 처리
const handleCouponSelect = ({ coupon, discountAmount }) => {
  selectedCoupon.value = coupon
  couponDiscount.value = discountAmount
}

// 결제하기
const handleSubmit = async () => {
  if (!isAgreementValid.value) {
    warning(orderData.sections.agreements.requiredAlert || '필수 약관에 동의해주세요.')
    return
  }

  // 연락처 유효성 검사
  // 비회원인 경우 주문자 연락처도 검사
  if (!isMember.value && !validate('phone', orderer.phone.replace(/-/g, ''))) {
    warning(orderData.validation?.ordererPhone || '주문자 연락처 형식이 올바르지 않습니다.')
    return
  }

  // 배송지 연락처 검사
  if (!validate('phone', shipping.phone.replace(/-/g, ''))) {
    warning(orderData.validation?.shippingPhone || '배송지 연락처 형식이 올바르지 않습니다.')
    return
  }

  // 주문 생성 요청 데이터
  const orderPayload = {
    items: orderItems.value.map(item => ({
      productId: item.productId,
      variantId: item.variantId || null,
      quantity: item.quantity
    })),
    shippingAddress: {
      recipientName: shipping.recipient,
      recipientPhone: shipping.phone,
      postalCode: shipping.zipcode,
      address1: shipping.address,
      address2: shipping.addressDetail
    },
    expectedAmount: summary.value.total,
    customerNote: shipping.memo === 'custom' ? shipping.customMemo : shipping.memo,
    orderChannel: 'WEB'
  }

  // 선택된 쿠폰이 있는 경우
  if (selectedCoupon.value?.id) {
    orderPayload.userCouponId = selectedCoupon.value.id
  }

  // 비회원인 경우 guest 정보 추가
  if (!isMember.value) {
    orderPayload.guestEmail = orderer.email
    orderPayload.guestPhone = orderer.phone
    orderPayload.guestPassword = guestPassword.password
  }

  const result = await createOrder(orderPayload)

  if (result.success) {
    // 주문 생성 성공 → 결제 정보 sessionStorage에 저장 (승인 페이지에서 사용)
    if (import.meta.client) {
      sessionStorage.setItem('paymentOrder', JSON.stringify({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        amount: summary.value.total,
        cartItemIds: orderItems.value.map(item => item.cartItemId).filter(Boolean)
      }))
    }

    // 주문명 생성
    const firstProduct = orderProducts.value[0]?.name || ''
    const orderName = orderProducts.value.length > 1
      ? `${firstProduct} 외 ${orderProducts.value.length - 1}건`
      : firstProduct

    // 토스페이먼츠 결제창 호출
    const origin = window.location.origin
    const paymentResult = await requestPayment({
      amount: summary.value.total,
      orderId: result.orderNumber,
      orderName,
      customerName: orderer.name || shipping.recipient,
      customerEmail: orderer.email || '',
      customerKey: authStore.isLoggedIn ? `user_${authStore.user?.id}` : null,
      successUrl: `${origin}/payment/success`,
      failUrl: `${origin}/payment/fail`
    })

    // 사용자가 결제창을 닫은 경우
    if (paymentResult?.cancelled) return
  } else {
    warning(result.error)
  }
}
</script>

<template>
  <div class="page-order">
    <main class="order-page">
      <form class="order-page__content" @submit.prevent="handleSubmit">
        <div class="order-page__main">
          <!-- 1. 구매 상품 -->
          <section class="order-section">
            <header class="order-section__header">
              <h2 class="order-section__title">{{ orderData.sections.products.title }}</h2>
            </header>
            <div class="order-products">
              <OrderProductCard
                v-for="product in orderProducts"
                :key="product.id"
                :product="product"
                :labels="orderData.sections.products.labels"
              />
            </div>
          </section>

          <!-- 2. 주문자 정보 (비회원만 표시) -->
          <OrderOrdererSection
            v-if="!isMember"
            :model-value="orderer"
            :labels="orderData.sections.orderer"
            @update:model-value="val => Object.assign(orderer, val)"
          />

          <!-- 3. 배송지 정보 -->
          <OrderShippingSection
            :model-value="shipping"
            :labels="orderData.sections.shipping"
            :show-same-as-orderer="!isMember"
            :show-select-address="isMember"
            @update:model-value="val => Object.assign(shipping, val)"
            @select-address="selectAddress"
          />

          <!-- 4. 비회원 주문조회 비밀번호 (비회원만) -->
          <OrderGuestPasswordSection
            v-if="!isMember"
            :model-value="guestPassword"
            :labels="orderData.sections.guestPassword"
            @update:model-value="val => Object.assign(guestPassword, val)"
          />

          <!-- 5. 할인 / 쿠폰 -->
          <OrderCouponSection
            v-model="coupon"
            :labels="orderData.sections.coupon"
            :selected-coupon="selectedCoupon"
            :coupon-discount="couponDiscount"
            :available-point="orderData.dummy.availablePoint"
            @open-coupon-modal="openCouponModal"
          />

          <!-- 6. 결제 수단 -->
          <!-- <OrderPaymentSection
            v-model="payment"
            :labels="orderData.sections.payment"
          /> -->
        </div>

        <!-- 결제 금액 사이드바 -->
        <OrderSummaryAside
          v-model:agreements="agreements"
          :summary="summary"
          :labels="orderData.summary"
          :agreement-labels="orderData.sections.agreements"
          :submit-label="isMember ? orderData.submit.member : orderData.submit.guest"
          :disabled="!isAgreementValid"
          :hide-agreements="isMember"
          @submit="handleSubmit"
        />
      </form>
    </main>

    <Footer :data="mainData.footer" />

    <!-- 배송지 선택 모달 (회원만) -->
    <AddressSelectModal
      v-if="isMember"
      v-model="isAddressModalOpen"
      mode="select"
      @select="handleAddressSelect"
    />

    <!-- 쿠폰 선택 모달 -->
    <CouponSelectModal
      v-model="isCouponModalOpen"
      :subtotal="summary.productTotal"
      :selected-coupon-id="selectedCoupon?.id"
      @select="handleCouponSelect"
    />

    <FloatingPaymentBar
      v-model:agreements="agreements"
      :summary="summary"
      :labels="orderData.summary"
      :agreement-labels="orderData.sections.agreements"
      :submit-label="isMember ? orderData.submit.member : orderData.submit.guest"
      :disabled="!isAgreementValid"
      :hide-agreements="isMember"
      @submit="handleSubmit"
    />
  </div>
</template>
