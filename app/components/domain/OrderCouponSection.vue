<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  selectedCoupon: {
    type: Object,
    default: null
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  availablePoint: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'openCouponModal'])

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}

const useAllPoint = () => {
  updateField('point', String(props.availablePoint))
}

const handleOpenCouponModal = () => {
  emit('openCouponModal')
}
</script>

<template>
  <section class="order-section">
    <header class="order-section__header">
      <h2 class="order-section__title">{{ labels.title }}</h2>
    </header>
    <div class="order-coupon">
      <!-- 쿠폰 선택 버튼 -->
      <div class="order-coupon__row">
        <button
          type="button"
          class="order-coupon__select-btn"
          @click="handleOpenCouponModal"
        >
          <span v-if="selectedCoupon" class="order-coupon__selected">
            <span class="order-coupon__selected-name">{{ selectedCoupon.name }}</span>
            <span class="order-coupon__selected-discount">-{{ couponDiscount.toLocaleString() }}{{ labels.currency }}</span>
          </span>
          <span v-else class="order-coupon__placeholder">{{ labels.coupon.placeholder }}</span>
          <IconArrow direction="right" size="sm" />
        </button>
      </div>

      <!-- 포인트 입력 -->
      <!-- <div class="order-coupon__row">
        <div class="order-coupon__input-wrapper">
          <BaseInput
            :model-value="modelValue.point"
            type="number"
            :placeholder="labels.point.placeholder"
            @update:model-value="updateField('point', $event)"
          />
        </div>
        <BaseButton
          :label="labels.point.apply"
          variant="line"
          color="black"
          size="big"
          type="button"
          class="order-coupon__apply-btn"
          @click="useAllPoint"
        />
      </div>
      <p class="order-coupon__available">
        {{ labels.point.available }}:
        <strong>{{ availablePoint.toLocaleString() }}{{ labels.point.unit }}</strong>
      </p> -->
    </div>
  </section>
</template>
