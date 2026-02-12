<script setup>
import orderData from '~/data/order.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  subtotal: {
    type: Number,
    default: 0
  },
  selectedCouponId: {
    type: [String, Number, null],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const { applicableCoupons, applicablePending, fetchApplicableCoupons } = useDownloadableCoupons()

const labels = orderData.couponModal

// 모달 열림/닫힘
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 선택된 쿠폰 ID (로컬 상태)
const selectedId = ref(props.selectedCouponId)

// props 변경 시 동기화
watch(() => props.selectedCouponId, (val) => {
  selectedId.value = val
})

// 모달 열릴 때 쿠폰 목록 조회
watch(isOpen, async (open) => {
  if (open) {
    await fetchApplicableCoupons(props.subtotal)
    selectedId.value = props.selectedCouponId
  }
})

// 쿠폰 선택
const handleSelect = (coupon) => {
  selectedId.value = String(coupon.id)
}

// 적용 버튼
const handleApply = () => {
  const selected = applicableCoupons.value.find(c => String(c.id) === selectedId.value)
  const discountAmount = selected?.expectedDiscountAmount || 0
  emit('select', { coupon: selected || null, discountAmount })
  isOpen.value = false
}

// 쿠폰 미적용
const handleNoUse = () => {
  emit('select', { coupon: null, discountAmount: 0 })
  isOpen.value = false
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="labels.title"
    size="medium"
  >
    <div class="coupon-select-modal">
      <!-- 로딩 상태 -->
      <div v-if="applicablePending" class="coupon-select-modal__loading">
        <BaseSpinner size="medium" />
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="applicableCoupons.length === 0" class="coupon-select-modal__empty">
        {{ labels.empty }}
      </div>

      <!-- 쿠폰 목록 -->
      <ul v-else class="coupon-select-modal__list">
        <li
          v-for="coupon in applicableCoupons"
          :key="coupon.id"
          class="coupon-select-modal__item"
          :class="{ 'coupon-select-modal__item--selected': selectedId === String(coupon.id) }"
          @click="handleSelect(coupon)"
        >
          <div class="coupon-select-modal__info">
            <strong class="coupon-select-modal__discount">{{ coupon.discountText }}</strong>
            <span class="coupon-select-modal__name">{{ coupon.name }}</span>
            <span v-if="coupon.minOrderAmount > 0" class="coupon-select-modal__condition">
              {{ labels.minOrder }} {{ coupon.minOrderAmount.toLocaleString() }}{{ labels.currency }}
            </span>
            <span v-if="coupon.maxDiscountAmount" class="coupon-select-modal__condition">
              {{ labels.maxDiscount }} {{ coupon.maxDiscountAmount.toLocaleString() }}{{ labels.currency }}
            </span>
            <span v-if="coupon.validTo" class="coupon-select-modal__valid">
              {{ coupon.validTo }} {{ labels.validUntil }}
            </span>
            <span class="coupon-select-modal__stackable" :class="{ 'coupon-select-modal__stackable--no': !coupon.allowPromotionOverlap }">
              {{ coupon.allowPromotionOverlap ? labels.stackable : labels.notStackable }}
            </span>
          </div>
          <div class="coupon-select-modal__amount">
            -{{ coupon.expectedDiscountAmount.toLocaleString() }}{{ labels.currency }}
          </div>
        </li>
      </ul>

      <!-- 하단 버튼 -->
      <div class="coupon-select-modal__footer">
        <BaseButton
          type="button"
          variant="line"
          color="black"
          size="big"
          @click="handleNoUse"
        >
          {{ labels.noUse }}
        </BaseButton>
        <BaseButton
          type="button"
          variant="solid"
          color="green"
          size="big"
          :disabled="!selectedId"
          @click="handleApply"
        >
          {{ labels.apply }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
