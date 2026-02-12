<script setup>
import qnaWriteData from '~/data/qna-write.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  qnaType: {
    type: String,
    default: 'PRODUCT'
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const { success, warning } = useToast()
const { post } = useApi()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Form state
const title = ref('')
const content = ref('')
const isSecret = ref(false)
const submitting = ref(false)

// Validation errors
const errors = reactive({
  title: '',
  content: ''
})

// 모달 열릴 때 폼 초기화
watch(() => props.modelValue, (open) => {
  if (open) {
    resetForm()
  }
})

const resetForm = () => {
  title.value = ''
  content.value = ''
  isSecret.value = false
  errors.title = ''
  errors.content = ''
}

// Validation
const validateForm = () => {
  let isValid = true
  errors.title = ''
  errors.content = ''

  if (!title.value.trim()) {
    errors.title = qnaWriteData.messages.titleRequired
    isValid = false
  }

  if (!content.value.trim()) {
    errors.content = qnaWriteData.messages.contentRequired
    isValid = false
  } else if (content.value.trim().length < qnaWriteData.content.minLength) {
    errors.content = qnaWriteData.messages.contentMinLength
    isValid = false
  }

  return isValid
}

// 폼 제출
const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    const payload = {
      title: title.value,
      question: content.value,
      qnaType: props.product ? 'PRODUCT' : props.qnaType,
      isSecret: isSecret.value
    }

    // 상품 문의인 경우 productId 추가
    if (props.product?.id) {
      payload.productId = props.product.id
    }

    await post('/qnas', payload)

    success(qnaWriteData.messages.submitSuccess)
    emit('submitted')
    isOpen.value = false
  } catch (e) {
    const message = e?.data?.error?.message || e?.data?.message || qnaWriteData.messages.submitError
    warning(message)
  } finally {
    submitting.value = false
  }
}

// 닫기 처리
const handleClose = () => {
  if (title.value.trim() || content.value.trim()) {
    if (confirm(qnaWriteData.modal.confirmMessage)) {
      isOpen.value = false
    }
  } else {
    isOpen.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="qnaWriteData.page.title"
    size="large"
    :close-on-backdrop="false"
    @close="handleClose"
  >
    <div class="qna-write-modal">
      <!-- Product Info -->
      <div v-if="product" class="qna-write-modal__product">
        <img
          :src="product.image"
          :alt="product.name"
          class="qna-write-modal__product-image"
        />
        <div class="qna-write-modal__product-info">
          <span class="qna-write-modal__product-label">{{ qnaWriteData.product.label }}</span>
          <p class="qna-write-modal__product-name">{{ product.name }}</p>
        </div>
      </div>

      <!-- Form -->
      <form class="qna-write-modal__form" @submit.prevent="handleSubmit">
        <!-- Title -->
        <div class="qna-write-modal__field">
          <BaseInput
            v-model="title"
            :label="qnaWriteData.title.label"
            :placeholder="qnaWriteData.title.placeholder"
            :required="qnaWriteData.title.required"
            :maxlength="qnaWriteData.title.maxLength"
            :error="errors.title"
          />
        </div>

        <!-- Content -->
        <div class="qna-write-modal__field">
          <BaseTextarea
            v-model="content"
            :label="qnaWriteData.content.label"
            :placeholder="qnaWriteData.content.placeholder"
            :required="qnaWriteData.content.required"
            :maxlength="qnaWriteData.content.maxLength"
            :rows="5"
            :error="errors.content"
            show-count
          />
        </div>

        <!-- Secret -->
        <div class="qna-write-modal__field qna-write-modal__field--inline">
          <BaseCheckbox
            v-model="isSecret"
            :label="qnaWriteData.secret.label"
          />
          <p class="qna-write-modal__help">{{ qnaWriteData.secret.description }}</p>
        </div>

        <!-- Buttons -->
        <div class="qna-write-modal__buttons">
          <BaseButton
            type="button"
            :label="qnaWriteData.cancel.label"
            variant="line"
            color="black"
            size="big"
            @click="handleClose"
          />
          <BaseButton
            type="submit"
            :label="submitting ? qnaWriteData.submit.submittingLabel : qnaWriteData.submit.label"
            variant="bg"
            color="green"
            size="big"
            :disabled="submitting"
          />
        </div>
      </form>
    </div>
  </BaseModal>
</template>
