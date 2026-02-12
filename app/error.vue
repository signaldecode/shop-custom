<script setup>
import errorData from '~/data/error.json'

const props = defineProps({
  error: {
    type: Object,
    required: true
  }
})

// 에러 코드에 따른 데이터 선택 (404 또는 500)
const isServerError = computed(() => {
  const code = props.error?.statusCode || 500
  return code >= 500
})

const pageData = computed(() => {
  return isServerError.value ? errorData['500'] : errorData['404']
})

// 다시 시도
const handleRetry = () => {
  window.location.reload()
}

// 에러 클리어 후 이동
const handleClearError = async () => {
  await clearError({ redirect: '/' })
}

const handleGoToCategory = async () => {
  await clearError({ redirect: '/category' })
}
</script>

<template>
  <div class="error-page">
    <img
      :src="pageData.image"
      :alt="pageData.imageAlt"
      class="error-page__image"
    />

    <h1 class="error-page__title">{{ pageData.title }}</h1>
    <p class="error-page__description">{{ pageData.description }}</p>

    <div class="error-page__actions">
      <!-- 404 에러: 상품 보러가기, 홈으로 이동 -->
      <template v-if="!isServerError">
        <BaseButton
          :label="pageData.buttons.products"
          variant="bg"
          color="green"
          size="big"
          @click="handleGoToCategory"
        />
        <BaseButton
          :label="pageData.buttons.home"
          variant="line"
          color="black"
          size="big"
          @click="handleClearError"
        />
      </template>

      <!-- 500 에러: 다시 시도 -->
      <template v-else>
        <BaseButton
          :label="pageData.buttons.retry"
          variant="bg"
          color="green"
          size="big"
          @click="handleRetry"
        />
      </template>
    </div>
  </div>
</template>
