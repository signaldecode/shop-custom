<script setup>
import uiData from '~/data/ui.json'

const labels = uiData.productItem
const common = uiData.common

const props = defineProps({
  image: {
    type: String,
    default: ''
  },
  imageAlt: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    required: true
  },
  variantName: {
    type: String,
    default: ''
  },
  unitPrice: {
    type: [String, Number],
    default: ''
  },
  quantity: {
    type: [String, Number],
    default: ''
  },
  total: {
    type: [String, Number],
    default: ''
  },
  // 숫자일 경우 자동 포맷팅
  currency: {
    type: String,
    default: ''
  },
  quantitySuffix: {
    type: String,
    default: ''
  },
  // 레이아웃 옵션
  layout: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical'].includes(v)
  },
  // 썸네일 크기
  thumbSize: {
    type: String,
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  // 상품 상세 링크
  to: {
    type: String,
    default: ''
  },
  // 주문 상태
  status: {
    type: String,
    default: ''
  },
  // 리뷰 작성 여부
  hasReview: {
    type: Boolean,
    default: false
  },
  // 리뷰쓰기 버튼 라벨
  reviewButtonLabel: {
    type: String,
    default: ''
  },
  // 리뷰보기 버튼 라벨
  viewReviewLabel: {
    type: String,
    default: ''
  },
  // 가격 라벨
  unitPriceLabel: {
    type: String,
    default: ''
  },
  quantityLabel: {
    type: String,
    default: ''
  },
  totalLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['writeReview', 'viewReview'])

// 배송완료 상태 체크
const isDelivered = computed(() => props.status === labels.statusDelivered)

// 가격 포맷팅 헬퍼
const currencyUnit = computed(() => props.currency || common.currency)
const quantityUnit = computed(() => props.quantitySuffix || common.countSuffix)

const formatPrice = (value) => {
  if (value === '' || value === null || value === undefined) return ''
  if (typeof value === 'string' && value.includes(currencyUnit.value)) return value
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return value
  return `${num.toLocaleString()}${currencyUnit.value}`
}

const formattedUnitPrice = computed(() => formatPrice(props.unitPrice))
const formattedTotal = computed(() => formatPrice(props.total))
const formattedQuantity = computed(() => {
  if (props.quantity === '' || props.quantity === null || props.quantity === undefined) return ''
  if (typeof props.quantity === 'string' && props.quantity.includes(quantityUnit.value)) return props.quantity
  return `${props.quantity}${quantityUnit.value}`
})
</script>

<template>
  <div
    class="base-product-item"
    :class="[
      `base-product-item--${layout}`,
      `base-product-item--thumb-${thumbSize}`
    ]"
  >
    <!-- 왼쪽: 이미지 + 상품정보 -->
    <div class="base-product-item__main">
      <!-- 체크박스 등 선택 영역 슬롯 -->
      <slot name="select" />

      <component
        :is="to ? 'NuxtLink' : 'div'"
        :to="to || undefined"
        class="base-product-item__thumb"
      >
        <NuxtImg v-if="image" :src="image" :alt="imageAlt || name" loading="lazy" />
        <div v-else class="base-product-item__thumb-placeholder">
          <span>{{ labels.placeholder }}</span>
        </div>
      </component>

      <div class="base-product-item__info">
        <p class="base-product-item__name">{{ name }}</p>
        <p v-if="variantName" class="base-product-item__variant">{{ variantName }}</p>
        <template v-if="status">
          <template v-if="isDelivered">
            <button
              v-if="hasReview"
              type="button"
              class="base-product-item__review-btn base-product-item__review-btn--view"
              @click.stop.prevent="emit('viewReview')"
            >
              {{ viewReviewLabel || labels.viewReview }}
            </button>
            <button
              v-else
              type="button"
              class="base-product-item__review-btn"
              @click.stop.prevent="emit('writeReview')"
            >
              {{ reviewButtonLabel || labels.writeReview }}
            </button>
          </template>
          <p v-else class="base-product-item__status">({{ status }})</p>
        </template>
        <!-- 추가 정보 슬롯 -->
        <slot name="info" />
      </div>
    </div>

    <!-- 오른쪽: 가격 정보 -->
    <div class="base-product-item__prices">
      <slot name="prices">
        <div v-if="formattedUnitPrice" class="base-product-item__price-row">
          <span class="base-product-item__price-label">{{ unitPriceLabel || labels.unitPrice }}</span>
          <span class="base-product-item__price-value">{{ formattedUnitPrice }}</span>
        </div>
        <div v-if="formattedQuantity" class="base-product-item__price-row">
          <span class="base-product-item__price-label">{{ quantityLabel || labels.quantity }}</span>
          <span class="base-product-item__price-value">{{ formattedQuantity }}</span>
        </div>
        <div v-if="formattedTotal" class="base-product-item__price-row base-product-item__price-row--total">
          <span class="base-product-item__price-label">{{ totalLabel || labels.total }}</span>
          <span class="base-product-item__price-value">{{ formattedTotal }}</span>
        </div>
      </slot>
    </div>

    <!-- 액션 버튼 슬롯 (삭제 등) -->
    <slot name="actions" />
  </div>
</template>
