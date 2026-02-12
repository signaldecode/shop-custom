<script setup>
import qnaWriteData from '~/data/qna-write.json'
import mainData from '~/data/main.json'

const route = useRoute()
const router = useRouter()
const { success, warning } = useToast()

const productId = computed(() => route.params.id)

// 상품 정보 가져오기
const { product, pending: productPending } = useProductDetail(productId)

// SEO
useHead({ title: qnaWriteData.seo.title })
useSeoMeta({
  title: qnaWriteData.seo.title,
  description: qnaWriteData.seo.description
})

// Form state
const category = ref('')
const title = ref('')
const content = ref('')
const isSecret = ref(false)
const submitting = ref(false)

// Validation errors
const errors = reactive({
  category: '',
  title: '',
  content: ''
})

// Validation
const validateForm = () => {
  let isValid = true
  errors.category = ''
  errors.title = ''
  errors.content = ''

  if (!category.value) {
    errors.category = qnaWriteData.messages.categoryRequired
    isValid = false
  }

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
    // TODO: API 연동
    // await api.post('/qna', {
    //   productId: productId.value,
    //   category: category.value,
    //   title: title.value,
    //   content: content.value,
    //   isSecret: isSecret.value
    // })

    // 임시: 1초 딜레이 후 성공 처리
    await new Promise(resolve => setTimeout(resolve, 1000))

    success(qnaWriteData.messages.submitSuccess)
    router.push(`/products/${productId.value}#section-qna`)
  } catch (e) {
    warning(qnaWriteData.messages.submitError)
  } finally {
    submitting.value = false
  }
}

// 취소 처리
const handleCancel = () => {
  if (category.value || title.value.trim() || content.value.trim()) {
    if (confirm(qnaWriteData.modal.confirmMessage)) {
      router.back()
    }
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="page-qna-write">
    <main class="qna-write-page">
      <div class="qna-write-page__container">
        <!-- Header -->
        <header class="qna-write-page__header">
          <h1 class="qna-write-page__title">{{ qnaWriteData.page.title }}</h1>
          <p class="qna-write-page__subtitle">{{ qnaWriteData.page.subtitle }}</p>
        </header>

        <!-- Product Info -->
        <div v-if="product" class="qna-write-page__product">
          <img
            :src="product.image"
            :alt="product.name"
            class="qna-write-page__product-image"
          />
          <div class="qna-write-page__product-info">
            <span class="qna-write-page__product-label">{{ qnaWriteData.product.label }}</span>
            <h2 class="qna-write-page__product-name">{{ product.name }}</h2>
          </div>
        </div>
        <div v-else-if="productPending" class="qna-write-page__product-loading">
          <BaseSpinner size="small" />
        </div>

        <!-- Form -->
        <form class="qna-write-page__form" @submit.prevent="handleSubmit">
          <!-- Category -->
          <div class="qna-write-page__field">
            <label class="qna-write-page__label">
              {{ qnaWriteData.category.label }}
              <span v-if="qnaWriteData.category.required" class="qna-write-page__required">*</span>
            </label>
            <BaseSelect
              v-model="category"
              :options="qnaWriteData.category.options"
              :placeholder="qnaWriteData.category.placeholder"
            />
            <p v-if="errors.category" class="qna-write-page__error">{{ errors.category }}</p>
          </div>

          <!-- Title -->
          <div class="qna-write-page__field">
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
          <div class="qna-write-page__field">
            <BaseTextarea
              v-model="content"
              :label="qnaWriteData.content.label"
              :placeholder="qnaWriteData.content.placeholder"
              :required="qnaWriteData.content.required"
              :maxlength="qnaWriteData.content.maxLength"
              :rows="6"
              :error="errors.content"
              show-count
            />
          </div>

          <!-- Secret -->
          <div class="qna-write-page__field qna-write-page__field--inline">
            <BaseCheckbox
              v-model="isSecret"
              :label="qnaWriteData.secret.label"
            />
            <p class="qna-write-page__help">{{ qnaWriteData.secret.description }}</p>
          </div>

          <!-- Buttons -->
          <div class="qna-write-page__buttons">
            <BaseButton
              type="button"
              :label="qnaWriteData.cancel.label"
              variant="line"
              color="black"
              size="big"
              @click="handleCancel"
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
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
