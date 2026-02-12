<script setup>
import mypageData from '~/data/mypage.json'

const props = defineProps({
  order: {
    type: Object,
    default: () => null
  }
})

const emit = defineEmits(['cancel', 'reviewSubmitted'])

const labels = mypageData.pages.orderDetail.labels
const detail = computed(() => props.order || null)

// PENDING, PAID 상태에서만 취소 가능
const canCancel = computed(() => {
  const status = detail.value?.orderStatus
  return status === 'PENDING' || status === 'PAID'
})

// 리뷰 작성 모달
const showReviewModal = ref(false)
const selectedProduct = ref(null)

// 리뷰 상세 모달
const showReviewDetailModal = ref(false)
const selectedReview = ref(null)

const openReviewModal = (product) => {
  selectedProduct.value = {
    id: product.productId,
    name: product.name,
    image: product.image
  }
  showReviewModal.value = true
}

const openViewReviewModal = (product) => {
  if (!product.review) return
  selectedReview.value = {
    ...product.review,
    productName: product.name,
    productImage: product.image,
    productId: product.productId
  }
  showReviewDetailModal.value = true
}

const handleReviewSubmitted = () => {
  emit('reviewSubmitted')
}
</script>

<template>
  <section v-if="detail" class="mypage-order-detail" aria-label="주문 상세내역">
    <!-- 주문정보 -->
    <section class="mypage-order-detail__section">
      <header class="mypage-order-detail__header">
        <h2 class="mypage-order-detail__title">{{ labels.orderInfo }}</h2>
      </header>
      <div class="mypage-order-detail__body">
        <dl class="mypage-order-detail__table">
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.orderNumber }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.orderNo }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.orderDate }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.orderedAt }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.orderer }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.orderer }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.orderStatus }}</dt>
            <dd class="mypage-order-detail__td">
              <span
                class="mypage-order-detail__status"
                :class="`mypage-order-detail__status--${detail.statusVariant || 'default'}`"
              >
                {{ detail.statusText }}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 주문취소 버튼 -->
    <div v-if="canCancel" class="mypage-order-detail__cancel-action">
      <BaseButton
        :label="labels.cancelButton"
        variant="bg"
        color="green"
        size="small"
        @click="emit('cancel', detail.orderNo)"
      />
    </div>

    <!-- 결제정보 -->
    <section class="mypage-order-detail__section">
      <header class="mypage-order-detail__header">
        <h2 class="mypage-order-detail__title">{{ labels.paymentInfo }}</h2>
      </header>
      <div class="mypage-order-detail__body">
        <dl class="mypage-order-detail__table">
          <div v-if="detail.payment.paymentNumber && detail.payment.paymentNumber !== '-'" class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.paymentNumber }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.paymentNumber }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.totalOrder }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.totalOrder }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.totalDiscount }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.totalDiscount }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.shippingFee }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.shippingFee }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.totalPaid }}</dt>
            <dd class="mypage-order-detail__td mypage-order-detail__td--highlight">{{ detail.payment.totalPaid }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.paymentMethod }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.method }}</dd>
          </div>
          <div v-if="detail.payment.cardNumber" class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.cardNumber }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.cardNumber }}</dd>
          </div>
          <div v-if="detail.payment.paymentStatusDescription && detail.payment.paymentStatusDescription !== '-'" class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.paymentStatus }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.paymentStatusDescription }}</dd>
          </div>
          <div v-if="detail.payment.paidAt && detail.payment.paidAt !== '-'" class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.paidAt }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.payment.paidAt }}</dd>
          </div>
        </dl>
        <div v-if="detail.payment.receiptUrl" class="mypage-order-detail__tracking-action">
          <BaseButton
            :label="labels.receiptButton"
            variant="line"
            color="black"
            size="small"
            tag="a"
            :href="detail.payment.receiptUrl"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>
      </div>
    </section>

    <!-- 주문상품정보 -->
    <section class="mypage-order-detail__section mypage-order-detail__section--compact">
      <header class="mypage-order-detail__header">
        <h2 class="mypage-order-detail__title">{{ labels.productInfo }}</h2>
      </header>
      <div class="mypage-order-detail__body mypage-order-detail__body--products">
        <div class="mypage-order-detail__product-list">
          <div
            v-for="p in detail.products"
            :key="p.id"
            class="mypage-order-detail__product-item"
          >
            <NuxtLink
              :to="p.productId ? `/products/${p.productId}` : ''"
              class="mypage-order-detail__product-link"
            >
              <BaseProductItem
                :image="p.image"
                :name="p.name"
                :variant-name="p.variantName"
                :unit-price="p.unitPrice"
                :quantity="p.quantity"
                :total="p.total"
                :status="p.status?.text"
                :has-review="!!p.review"
                :review-button-label="labels.reviewButton"
                :view-review-label="labels.viewReviewButton"
                @write-review="openReviewModal(p)"
                @view-review="openViewReviewModal(p)"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 배송정보 -->
    <section class="mypage-order-detail__section">
      <header class="mypage-order-detail__header">
        <h2 class="mypage-order-detail__title">{{ labels.shippingInfo }}</h2>
      </header>
      <div class="mypage-order-detail__body">
        <dl class="mypage-order-detail__table">
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.receiver }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipping.receiver }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.zipcode }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipping.zipcode }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.address }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipping.address }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.phone }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipping.phone }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.memo }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipping.memo }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 배송추적 (shipment 있을 때만) -->
    <section v-if="detail.shipment" class="mypage-order-detail__section">
      <header class="mypage-order-detail__header">
        <h2 class="mypage-order-detail__title">{{ labels.shipmentInfo }}</h2>
      </header>
      <div class="mypage-order-detail__body">
        <dl class="mypage-order-detail__table">
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.carrier }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipment.carrierName }}</dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.trackingNumber }}</dt>
            <dd class="mypage-order-detail__td">
              <template v-if="detail.shipment.trackingUrl">
                <a
                  :href="detail.shipment.trackingUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mypage-order-detail__tracking-link"
                >
                  {{ detail.shipment.trackingNumber }}
                </a>
              </template>
              <template v-else>
                {{ detail.shipment.trackingNumber }}
              </template>
            </dd>
          </div>
          <div class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.shipmentStatus }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipment.status }}</dd>
          </div>
          <div v-if="detail.shipment.shippedAt && detail.shipment.shippedAt !== '-'" class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.shippedAt }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipment.shippedAt }}</dd>
          </div>
          <div v-if="detail.shipment.deliveredAt && detail.shipment.deliveredAt !== '-'" class="mypage-order-detail__row">
            <dt class="mypage-order-detail__th">{{ labels.deliveredAt }}</dt>
            <dd class="mypage-order-detail__td">{{ detail.shipment.deliveredAt }}</dd>
          </div>
        </dl>
        <div v-if="detail.shipment.trackingUrl" class="mypage-order-detail__tracking-action">
          <BaseButton
            :label="labels.trackingButton"
            variant="line"
            color="black"
            size="small"
            tag="a"
            :href="detail.shipment.trackingUrl"
            target="_blank"
            rel="noopener noreferrer"
          />
        </div>
      </div>
    </section>

    <!-- 리뷰 작성 모달 -->
    <ReviewWriteModal
      v-model="showReviewModal"
      :product="selectedProduct"
      @submitted="handleReviewSubmitted"
    />

    <!-- 리뷰 상세 모달 -->
    <ReviewDetailModal
      v-model="showReviewDetailModal"
      :review="selectedReview"
    />
  </section>
</template>
