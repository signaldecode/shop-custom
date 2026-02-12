<script setup>
const props = defineProps({
  summary: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  submitLabel: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  agreementLabels: {
    type: Object,
    default: () => ({})
  },
  hideAgreements: {
    type: Boolean,
    default: false
  }
})

const agreements = defineModel('agreements', {
  type: Object,
  default: () => ({ all: false, terms: false, privacy: false })
})

const emit = defineEmits(['submit', 'update:agreements'])

// 전체 동의 처리
watch(() => agreements.value.all, (val) => {
  agreements.value.terms = val
  agreements.value.privacy = val
})

watch(
  () => [agreements.value.terms, agreements.value.privacy],
  ([terms, privacy]) => {
    agreements.value.all = terms && privacy
  }
)

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const formattedProductTotal = computed(() => {
  return props.summary.productTotal?.toLocaleString() || '0'
})

const formattedShippingFee = computed(() => {
  if (props.summary.shippingFee === 0) {
    return props.labels.freeShipping
  }
  return props.summary.shippingFee?.toLocaleString() || '0'
})

const formattedDiscount = computed(() => {
  return props.summary.discount?.toLocaleString() || '0'
})

const formattedCouponDiscount = computed(() => {
  return props.summary.couponDiscount?.toLocaleString() || '0'
})

const formattedPointUsed = computed(() => {
  return props.summary.pointUsed?.toLocaleString() || '0'
})

const formattedTotal = computed(() => {
  return props.summary.total?.toLocaleString() || '0'
})

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <Teleport to="body">
    <div class="floating-payment-bar" :class="{ 'floating-payment-bar--open': isOpen }">
      <!-- 토글 핸들 -->
      <button
        type="button"
        class="floating-payment-bar__toggle"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span class="floating-payment-bar__label">{{ labels.totalPayment }}</span>
        <strong class="floating-payment-bar__price">
          {{ formattedTotal }}<span class="floating-payment-bar__currency">{{ labels.currency }}</span>
        </strong>
        <IconArrow :direction="isOpen ? 'down' : 'up'" size="sm" decorative />
      </button>

      <!-- 상세 내역 -->
      <div v-show="isOpen" class="floating-payment-bar__detail">
        <dl class="floating-payment-bar__list">
          <div class="floating-payment-bar__row">
            <dt>{{ labels.productTotal }}</dt>
            <dd>{{ formattedProductTotal }}{{ labels.currency }}</dd>
          </div>
          <div class="floating-payment-bar__row">
            <dt>{{ labels.shippingFee }}</dt>
            <dd :class="{ 'floating-payment-bar__free': summary.shippingFee === 0 }">
              <template v-if="summary.shippingFee === 0">
                {{ formattedShippingFee }}
              </template>
              <template v-else>
                +{{ formattedShippingFee }}{{ labels.currency }}
              </template>
            </dd>
          </div>
          <div v-if="summary.discount > 0" class="floating-payment-bar__row floating-payment-bar__row--discount">
            <dt>{{ labels.discount }}</dt>
            <dd>-{{ formattedDiscount }}{{ labels.currency }}</dd>
          </div>
          <div v-if="summary.couponDiscount > 0" class="floating-payment-bar__row floating-payment-bar__row--discount">
            <dt>{{ labels.couponDiscount }}</dt>
            <dd>-{{ formattedCouponDiscount }}{{ labels.currency }}</dd>
          </div>
          <div v-if="summary.pointUsed > 0" class="floating-payment-bar__row floating-payment-bar__row--discount">
            <dt>{{ labels.pointUsed }}</dt>
            <dd>-{{ formattedPointUsed }}{{ labels.currency }}</dd>
          </div>
        </dl>
      </div>

      <!-- 약관 동의 (비회원) -->
      <div v-if="!hideAgreements" class="floating-payment-bar__agreements">
        <BaseCheckbox
          v-model="agreements.all"
          :label="agreementLabels.agreeAll"
          variant="circle"
          size="small"
        />
        <div v-show="!agreements.all" class="floating-payment-bar__agreement-items">
          <BaseCheckbox
            v-model="agreements.terms"
            variant="circle"
            size="small"
          >
            <span class="floating-payment-bar__agreement-label">
              {{ agreementLabels.terms?.label }}
              <span class="floating-payment-bar__required">{{ agreementLabels.terms?.required }}</span>
            </span>
          </BaseCheckbox>
          <BaseCheckbox
            v-model="agreements.privacy"
            variant="circle"
            size="small"
          >
            <span class="floating-payment-bar__agreement-label">
              {{ agreementLabels.privacy?.label }}
              <span class="floating-payment-bar__required">{{ agreementLabels.privacy?.required }}</span>
            </span>
          </BaseCheckbox>
        </div>
      </div>

      <!-- 결제 버튼 -->
      <BaseButton
        :label="submitLabel"
        variant="bg"
        color="green"
        size="big"
        :full="true"
        :disabled="disabled"
        type="button"
        @click="handleSubmit"
      />
    </div>
  </Teleport>
</template>
