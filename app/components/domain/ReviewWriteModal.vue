<script setup>
import reviewWriteData from '~/data/review-write.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  review: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submitted'])

const { success, warning } = useToast()
const { post, put } = useApi()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Edit mode
const isEditMode = computed(() => !!props.review?.id)

// 표시할 상품 정보 (등록 모드: product prop, 수정 모드: review에서 추출)
const displayProduct = computed(() => {
  if (props.product) return props.product
  if (props.review) {
    return {
      id: props.review.productId,
      name: props.review.productName,
      image: props.review.productThumbnailUrl
    }
  }
  return null
})

// Form state
const rating = ref(0)
const title = ref('')
const content = ref('')
const images = ref([])
const existingImages = ref([])
const submitting = ref(false)

// Validation errors
const errors = reactive({
  rating: '',
  content: ''
})

// 모달 열릴 때 폼 초기화
watch(() => props.modelValue, (open) => {
  if (open) {
    if (isEditMode.value) {
      initEditForm()
    } else {
      resetForm()
    }
  }
})

// 수정 모드 폼 초기화
const initEditForm = () => {
  rating.value = props.review?.rating || 0
  title.value = props.review?.title || ''
  content.value = props.review?.content || ''
  existingImages.value = props.review?.images || []
  images.value = (props.review?.images || []).map(url => ({
    url,
    isExisting: true
  }))
  errors.rating = ''
  errors.content = ''
}

const resetForm = () => {
  rating.value = 0
  title.value = ''
  content.value = ''
  images.value = []
  existingImages.value = []
  errors.rating = ''
  errors.content = ''
}

// Validation
const validateForm = () => {
  let isValid = true
  errors.rating = ''
  errors.content = ''

  if (rating.value === 0) {
    errors.rating = reviewWriteData.messages.ratingRequired
    isValid = false
  }

  if (!content.value.trim()) {
    errors.content = reviewWriteData.messages.contentRequired
    isValid = false
  } else if (content.value.trim().length < reviewWriteData.content.minLength) {
    errors.content = reviewWriteData.messages.contentMinLength
    isValid = false
  }

  return isValid
}

// 이미지 업로드 에러 처리
const handleImageError = (message) => {
  warning(message)
}

// 폼 제출
const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    if (isEditMode.value) {
      // 수정 모드
      const reviewId = props.review.id
      const formData = new FormData()

      // 유지할 기존 이미지 URL 필터링
      const keepExistingImages = images.value
        .filter(img => img.isExisting)
        .map(img => img.url)

      // review 객체를 JSON Blob으로 추가
      const reviewPayload = {
        rating: rating.value,
        title: title.value || null,
        content: content.value,
        existingImages: keepExistingImages
      }
      formData.append('review', new Blob([JSON.stringify(reviewPayload)], { type: 'application/json' }))

      // 새 이미지 파일 추가
      images.value.forEach((img) => {
        if (img.file && !img.isExisting) {
          formData.append('images', img.file)
        }
      })

      await put(`/reviews/${reviewId}`, formData)

      success(reviewWriteData.messages.updateSuccess)
    } else {
      // 등록 모드
      const productId = props.product?.id
      if (!productId) {
        warning(reviewWriteData.messages.submitError)
        return
      }

      const formData = new FormData()

      // review 객체를 JSON Blob으로 추가
      const reviewPayload = {
        rating: rating.value,
        title: title.value || null,
        content: content.value
      }
      formData.append('review', new Blob([JSON.stringify(reviewPayload)], { type: 'application/json' }))

      // 이미지 파일 추가
      images.value.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file)
        }
      })

      await post(`/products/${productId}/reviews`, formData)

      success(reviewWriteData.messages.submitSuccess)
    }

    emit('submitted')
    isOpen.value = false
  } catch (e) {
    const errorMessage = isEditMode.value
      ? reviewWriteData.messages.updateError
      : reviewWriteData.messages.submitError
    const message = e?.data?.error?.message || e?.data?.message || errorMessage
    warning(message)
  } finally {
    submitting.value = false
  }
}

// 닫기 처리
const handleClose = () => {
  if (rating.value > 0 || title.value.trim() || content.value.trim() || images.value.length > 0) {
    if (confirm(reviewWriteData.modal.confirmMessage)) {
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
    :title="isEditMode ? reviewWriteData.page.editTitle : reviewWriteData.page.title"
    size="large"
    :close-on-backdrop="false"
    @close="handleClose"
  >
    <div class="review-write-modal">
      <!-- Product Info -->
      <div v-if="displayProduct" class="review-write-modal__product">
        <img
          :src="displayProduct.image"
          :alt="displayProduct.name"
          class="review-write-modal__product-image"
        />
        <div class="review-write-modal__product-info">
          <span class="review-write-modal__product-label">{{ reviewWriteData.product.label }}</span>
          <p class="review-write-modal__product-name">{{ displayProduct.name }}</p>
        </div>
      </div>

      <!-- Form -->
      <form class="review-write-modal__form" @submit.prevent="handleSubmit">
        <!-- Rating -->
        <div class="review-write-modal__field">
          <label class="review-write-modal__label">
            {{ reviewWriteData.rating.label }}
            <span class="review-write-modal__required">*</span>
          </label>
          <BaseStarRating
            v-model="rating"
            size="xl"
            :descriptions="reviewWriteData.rating.descriptions"
          />
          <p v-if="errors.rating" class="review-write-modal__error">{{ errors.rating }}</p>
        </div>

        <!-- Title -->
        <div class="review-write-modal__field">
          <label class="review-write-modal__label">
            {{ reviewWriteData.title.label }}
            <span class="review-write-modal__optional">{{ reviewWriteData.title.optional }}</span>
          </label>
          <BaseInput
            v-model="title"
            :placeholder="reviewWriteData.title.placeholder"
            :maxlength="reviewWriteData.title.maxLength"
          />
        </div>

        <!-- Content -->
        <div class="review-write-modal__field">
          <BaseTextarea
            v-model="content"
            :label="reviewWriteData.content.label"
            :placeholder="reviewWriteData.content.placeholder"
            :required="reviewWriteData.content.required"
            :maxlength="reviewWriteData.content.maxLength"
            :rows="5"
            :error="errors.content"
            show-count
          />
        </div>

        <!-- Images -->
        <div class="review-write-modal__field">
          <label class="review-write-modal__label">
            {{ reviewWriteData.images.label }}
            <span class="review-write-modal__optional">{{ reviewWriteData.images.optional }}</span>
          </label>
          <BaseImageUpload
            v-model="images"
            :max-count="reviewWriteData.images.maxCount"
            :max-size-m-b="reviewWriteData.images.maxSizeMB"
            :accept="reviewWriteData.images.acceptTypes"
            :placeholder="reviewWriteData.images.placeholder"
            :help-text="reviewWriteData.images.helpText"
            :delete-label="reviewWriteData.images.deleteLabel"
            @error="handleImageError"
          />
        </div>

        <!-- Buttons -->
        <div class="review-write-modal__buttons">
          <BaseButton
            type="button"
            :label="reviewWriteData.cancel.label"
            variant="line"
            color="black"
            size="big"
            @click="handleClose"
          />
          <BaseButton
            type="submit"
            :label="submitting
              ? (isEditMode ? reviewWriteData.submit.editSubmittingLabel : reviewWriteData.submit.submittingLabel)
              : (isEditMode ? reviewWriteData.submit.editLabel : reviewWriteData.submit.label)"
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
