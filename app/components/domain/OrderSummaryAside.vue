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
  agreementLabels: {
    type: Object,
    default: () => ({})
  },
  submitLabel: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
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

// 아코디언 상태
const termsOpen = ref(false)
const privacyOpen = ref(false)

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

// 전체 동의 처리
watch(() => agreements.value.all, (val) => {
  agreements.value.terms = val
  agreements.value.privacy = val
})

// 개별 동의 시 전체 동의 업데이트
watch(
  () => [agreements.value.terms, agreements.value.privacy],
  ([terms, privacy]) => {
    agreements.value.all = terms && privacy
  }
)

const toggleTerms = () => {
  termsOpen.value = !termsOpen.value
}

const togglePrivacy = () => {
  privacyOpen.value = !privacyOpen.value
}

const handleSubmit = () => {
  emit('submit')
}
</script>

<template>
  <aside class="order-summary-aside">
    <h2 class="order-summary-aside__title">{{ labels.title }}</h2>

    <div class="order-summary-aside__content">
      <dl class="order-summary-aside__list">
        <div class="order-summary-aside__row">
          <dt>{{ labels.productTotal }}</dt>
          <dd>{{ formattedProductTotal }}{{ labels.currency }}</dd>
        </div>
        <div class="order-summary-aside__row">
          <dt>{{ labels.shippingFee }}</dt>
          <dd :class="{ 'order-summary-aside__free': summary.shippingFee === 0 }">
            <template v-if="summary.shippingFee === 0">
              {{ formattedShippingFee }}
            </template>
            <template v-else>
              +{{ formattedShippingFee }}{{ labels.currency }}
            </template>
          </dd>
        </div>
        <div v-if="summary.discount > 0" class="order-summary-aside__row order-summary-aside__row--discount">
          <dt>{{ labels.discount }}</dt>
          <dd>-{{ formattedDiscount }}{{ labels.currency }}</dd>
        </div>
        <div v-if="summary.couponDiscount > 0" class="order-summary-aside__row order-summary-aside__row--discount">
          <dt>{{ labels.couponDiscount }}</dt>
          <dd>-{{ formattedCouponDiscount }}{{ labels.currency }}</dd>
        </div>
        <div v-if="summary.pointUsed > 0" class="order-summary-aside__row order-summary-aside__row--discount">
          <dt>{{ labels.pointUsed }}</dt>
          <dd>-{{ formattedPointUsed }}{{ labels.currency }}</dd>
        </div>
      </dl>

      <div class="order-summary-aside__total">
        <span class="order-summary-aside__total-label">{{ labels.totalPayment }}</span>
        <strong class="order-summary-aside__total-price">
          {{ formattedTotal }}<span class="order-summary-aside__currency">{{ labels.currency }}</span>
        </strong>
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

    <!-- 약관 동의 (비회원 주문 시에만 표시) -->
    <div v-if="!hideAgreements" class="order-summary-aside__agreements">
      <BaseCheckbox
        v-model="agreements.all"
        :label="agreementLabels.agreeAll"
        variant="circle"
        size="small"
      />
      <div class="order-summary-aside__divider" />

      <!-- 이용약관 동의 -->
      <div class="order-summary-aside__agreement-item">
        <div class="order-summary-aside__agreement-header">
          <BaseCheckbox
            v-model="agreements.terms"
            variant="circle"
            size="small"
          >
            <span class="order-summary-aside__agreement-label">
              {{ agreementLabels.terms.label }}
              <span class="order-summary-aside__required">{{ agreementLabels.terms.required }}</span>
            </span>
          </BaseCheckbox>
          <button
            type="button"
            class="order-summary-aside__toggle"
            :class="{ 'order-summary-aside__toggle--open': termsOpen }"
            @click="toggleTerms"
            :aria-expanded="termsOpen"
          >
            <IconArrow direction="down" size="sm" />
          </button>
        </div>
        <div v-show="termsOpen" class="order-summary-aside__agreement-content">
          <p>{{ agreementLabels.terms.content }}</p>
        </div>
      </div>

      <!-- 비회원 개인정보 수집 이용 동의 -->
      <div class="order-summary-aside__agreement-item">
        <div class="order-summary-aside__agreement-header">
          <BaseCheckbox
            v-model="agreements.privacy"
            variant="circle"
            size="small"
          >
            <span class="order-summary-aside__agreement-label">
              {{ agreementLabels.privacy.label }}
              <span class="order-summary-aside__required">{{ agreementLabels.privacy.required }}</span>
            </span>
          </BaseCheckbox>
          <button
            type="button"
            class="order-summary-aside__toggle"
            :class="{ 'order-summary-aside__toggle--open': privacyOpen }"
            @click="togglePrivacy"
            :aria-expanded="privacyOpen"
          >
            <IconArrow direction="down" size="sm" />
          </button>
        </div>
        <div v-show="privacyOpen" class="order-summary-aside__agreement-content">
          <p>{{ agreementLabels.privacy.content }}</p>
        </div>
      </div>
    </div>
  </aside>
</template>
