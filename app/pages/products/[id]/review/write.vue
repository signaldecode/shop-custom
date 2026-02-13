<script setup>
import reviewWriteData from '~/data/review-write.json'

const route = useRoute()
const router = useRouter()
const { success, warning } = useToast()

const productId = computed(() => route.params.id)

// 상품 정보 가져오기
const { product, pending: productPending } = useProductDetail(productId)

// SEO
useHead({ title: reviewWriteData.seo.title })
useSeoMeta({
  title: reviewWriteData.seo.title,
  description: reviewWriteData.seo.description
})

// Form state
const rating = ref(0)
const content = ref('')
const images = ref([])
const submitting = ref(false)

// Validation errors
const errors = reactive({
  rating: '',
  content: ''
})

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
    // TODO: API 연동
    // const formData = new FormData()
    // formData.append('productId', productId.value)
    // formData.append('rating', rating.value)
    // formData.append('content', content.value)
    // images.value.forEach((img, i) => {
    //   formData.append(`images[${i}]`, img.file)
    // })

    // 임시: 1초 딜레이 후 성공 처리
    await new Promise(resolve => setTimeout(resolve, 1000))

    success(reviewWriteData.messages.submitSuccess)
    router.push(`/products/${productId.value}#section-reviews`)
  } catch (e) {
    warning(reviewWriteData.messages.submitError)
  } finally {
    submitting.value = false
  }
}

// 취소 처리
const handleCancel = () => {
  if (rating.value > 0 || content.value.trim() || images.value.length > 0) {
    // 작성 중인 내용이 있으면 확인
    if (confirm(reviewWriteData.modal.confirmMessage)) {
      router.back()
    }
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="page-review-write">
    <main class="review-write-page">
      <div class="review-write-page__container">
        <!-- Header -->
        <header class="review-write-page__header">
          <h1 class="review-write-page__title">{{ reviewWriteData.page.title }}</h1>
          <p class="review-write-page__subtitle">{{ reviewWriteData.page.subtitle }}</p>
        </header>

        <!-- Product Info -->
        <div v-if="product" class="review-write-page__product">
          <img
            :src="product.image"
            :alt="product.name"
            class="review-write-page__product-image"
          />
          <div class="review-write-page__product-info">
            <span class="review-write-page__product-label">{{ reviewWriteData.product.label }}</span>
            <h2 class="review-write-page__product-name">{{ product.name }}</h2>
          </div>
        </div>
        <div v-else-if="productPending" class="review-write-page__product-loading">
          <BaseSpinner size="small" />
        </div>

        <!-- Form -->
        <form class="review-write-page__form" @submit.prevent="handleSubmit">
          <!-- Rating -->
          <div class="review-write-page__field">
            <label class="review-write-page__label">
              {{ reviewWriteData.rating.label }}
              <span v-if="reviewWriteData.rating.required" class="review-write-page__required">*</span>
            </label>
            <BaseStarRating
              v-model="rating"
              size="xl"
              :descriptions="reviewWriteData.rating.descriptions"
            />
            <p v-if="errors.rating" class="review-write-page__error">{{ errors.rating }}</p>
          </div>

          <!-- Content -->
          <div class="review-write-page__field">
            <BaseTextarea
              v-model="content"
              :label="reviewWriteData.content.label"
              :placeholder="reviewWriteData.content.placeholder"
              :required="reviewWriteData.content.required"
              :maxlength="reviewWriteData.content.maxLength"
              :rows="6"
              :error="errors.content"
              show-count
            />
          </div>

          <!-- Images -->
          <div class="review-write-page__field">
            <label class="review-write-page__label">
              {{ reviewWriteData.images.label }}
              <span class="review-write-page__optional">{{ reviewWriteData.images.optional }}</span>
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
          <div class="review-write-page__buttons">
            <BaseButton
              type="button"
              :label="reviewWriteData.cancel.label"
              variant="line"
              color="black"
              size="big"
              @click="handleCancel"
            />
            <BaseButton
              type="submit"
              :label="submitting ? reviewWriteData.submit.submittingLabel : reviewWriteData.submit.label"
              variant="bg"
              color="green"
              size="big"
              :disabled="submitting"
            />
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
