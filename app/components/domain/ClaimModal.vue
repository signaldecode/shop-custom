<script setup>
import claimData from '~/data/claim.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  // 주문 정보
  order: {
    type: Object,
    default: null
  },
  // 단일 상품 정보 (null이면 전체 상품 목록 표시)
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const { success, warning } = useToast()
const { createClaim, pending } = useClaim()

const labels = claimData.modal

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 모달 타이틀 (반품 전용)
const modalTitle = computed(() => labels.returnTitle)

// 상품 목록 (단일 상품 or 전체 상품)
const products = computed(() => {
  if (props.item) {
    return [props.item]
  }
  return props.order?.products || []
})

// 선택된 상품 (id -> { selected, quantity })
const selectedItems = ref({})

// 폼 상태
const form = reactive({
  reasonType: '',
  reason: '',
  bankName: '',
  accountNumber: '',
  accountHolder: ''
})

// 폼 초기화
const resetForm = () => {
  form.reasonType = ''
  form.reason = ''
  form.bankName = ''
  form.accountNumber = ''
  form.accountHolder = ''

  // 상품 선택 초기화
  selectedItems.value = {}
  products.value.forEach(p => {
    selectedItems.value[p.id] = {
      selected: props.item ? true : false, // 단일 상품이면 기본 선택
      quantity: p.quantity || 1
    }
  })
}

// 모달 열릴 때 폼 초기화
watch(() => props.modelValue, (open) => {
  if (open) {
    resetForm()
  }
})

// 계좌 정보 항상 표시 (환불 방법은 ORIGINAL 고정)

// 선택된 상품이 있는지
const hasSelectedItems = computed(() => {
  return Object.values(selectedItems.value).some(item => item.selected)
})

// 유효성 검사
const validate = () => {
  if (!hasSelectedItems.value) {
    warning(labels.validation?.itemRequired || '상품을 선택해주세요.')
    return false
  }
  if (!form.reasonType) {
    warning(labels.validation.reasonTypeRequired)
    return false
  }
  if (!form.reason.trim()) {
    warning(labels.validation.reasonRequired)
    return false
  }
  // 계좌 정보 필수 검사
  if (!form.bankName) {
    warning(labels.validation.bankNameRequired)
    return false
  }
  if (!form.accountNumber.trim()) {
    warning(labels.validation.accountNumberRequired)
    return false
  }
  if (!form.accountHolder.trim()) {
    warning(labels.validation.accountHolderRequired)
    return false
  }
  return true
}

// 선택된 상품들의 예상 환불 금액 계산
const estimatedRefundAmount = computed(() => {
  return products.value
    .filter(p => selectedItems.value[p.id]?.selected)
    .reduce((sum, p) => {
      const qty = selectedItems.value[p.id]?.quantity || 1
      const unitPrice = p.unitPrice || p.price || 0
      return sum + (unitPrice * qty)
    }, 0)
})

// 제출
const handleSubmit = async () => {
  if (!validate()) return

  const orderId = props.order?.id || props.order?.orderId

  if (!orderId) {
    warning(labels.messages.error)
    return
  }

  // 선택된 상품들
  const claimItems = products.value
    .filter(p => selectedItems.value[p.id]?.selected)
    .map(p => ({
      orderItemId: p.id,
      quantity: selectedItems.value[p.id]?.quantity || p.quantity || 1,
      exchangeVariantId: 0
    }))

  const payload = {
    orderId,
    claimType: 'RETURN',
    reasonType: form.reasonType,
    reason: form.reason,
    items: claimItems,
    estimatedRefundAmount: estimatedRefundAmount.value || 0,
    refundMethod: 'ORIGINAL',
    bankName: form.bankName,
    bankAccount: form.accountNumber,
    bankHolder: form.accountHolder
  }

  const result = await createClaim(payload)

  if (result.success) {
    success(labels.messages.success)
    emit('submitted')
    isOpen.value = false
  } else {
    warning(result.error || labels.messages.error)
  }
}

// 닫기
const handleClose = () => {
  isOpen.value = false
}

// 상품 선택 토글
const toggleProduct = (productId) => {
  if (selectedItems.value[productId]) {
    selectedItems.value[productId].selected = !selectedItems.value[productId].selected
  }
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="modalTitle"
    size="medium"
    :close-on-backdrop="false"
    @close="handleClose"
  >
    <div class="claim-modal">
      <!-- 상품 목록 -->
      <div class="claim-modal__products">
        <label class="claim-modal__label">
          {{ labels.productInfo }}
          <span class="claim-modal__required">*</span>
        </label>
        <div class="claim-modal__product-list">
          <div
            v-for="p in products"
            :key="p.id"
            class="claim-modal__product-item"
            :class="{ 'claim-modal__product-item--selected': selectedItems[p.id]?.selected }"
          >
            <label class="claim-modal__product-check">
              <input
                type="checkbox"
                :checked="selectedItems[p.id]?.selected"
                @change="toggleProduct(p.id)"
              />
              <img
                v-if="p.image"
                :src="p.image"
                :alt="p.name"
                class="claim-modal__product-thumb"
              />
              <div class="claim-modal__product-info">
                <p class="claim-modal__product-name">{{ p.name }}</p>
                <p v-if="p.variantName" class="claim-modal__product-variant">{{ p.variantName }}</p>
              </div>
            </label>
            <div v-if="selectedItems[p.id]?.selected" class="claim-modal__product-qty">
              <span class="claim-modal__qty-label">{{ labels.quantity.label }}</span>
              <select
                v-model.number="selectedItems[p.id].quantity"
                class="claim-modal__qty-select"
              >
                <option v-for="n in (p.quantity || 1)" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 폼 -->
      <form class="claim-modal__form" @submit.prevent="handleSubmit">
        <!-- 사유 선택 -->
        <div class="claim-modal__field">
          <label class="claim-modal__label">
            {{ labels.reasonType.label }}
            <span class="claim-modal__required">*</span>
          </label>
          <BaseSelect
            v-model="form.reasonType"
            :options="labels.reasonType.options"
            :placeholder="labels.reasonType.placeholder"
            variant="box"
          />
        </div>

        <!-- 상세 사유 -->
        <div class="claim-modal__field">
          <BaseTextarea
            v-model="form.reason"
            :label="labels.reason.label"
            :placeholder="labels.reason.placeholder"
            required
            :rows="4"
          />
        </div>

        <!-- 환불 계좌 정보 -->
        <div class="claim-modal__bank-info">
          <p class="claim-modal__bank-title">{{ labels.bankInfo.title }}</p>
          <div class="claim-modal__field">
            <BaseSelect
              v-model="form.bankName"
              :options="labels.bankInfo.bankName.options"
              :placeholder="labels.bankInfo.bankName.placeholder"
              :label="labels.bankInfo.bankName.label"
              variant="box"
            />
          </div>
          <div class="claim-modal__field">
            <BaseInput
              v-model="form.accountNumber"
              :label="labels.bankInfo.accountNumber.label"
              :placeholder="labels.bankInfo.accountNumber.placeholder"
            />
          </div>
          <div class="claim-modal__field">
            <BaseInput
              v-model="form.accountHolder"
              :label="labels.bankInfo.accountHolder.label"
              :placeholder="labels.bankInfo.accountHolder.placeholder"
            />
          </div>
        </div>

        <!-- 버튼 -->
        <div class="claim-modal__buttons">
          <BaseButton
            type="button"
            :label="labels.buttons.cancel"
            variant="line"
            color="black"
            size="big"
            @click="handleClose"
          />
          <BaseButton
            type="submit"
            :label="labels.buttons.submit"
            variant="bg"
            color="green"
            size="big"
            :disabled="pending"
          />
        </div>
      </form>
    </div>
  </BaseModal>
</template>
