<script setup>
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  htmlContent: {
    type: String,
    default: ''
  },
  labels: {
    type: Object,
    required: true
  }
})

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 콘텐츠 존재 여부
const hasContent = computed(() => props.htmlContent || props.images.length > 0)
</script>

<template>
  <section id="section-detail" class="product-detail-content">
    <div
      class="product-detail-content__body"
      :class="{ 'product-detail-content__body--expanded': isExpanded }"
    >
      <!-- HTML 컨텐츠 (v-html) -->
      <div
        v-if="htmlContent"
        class="product-detail-content__html"
        v-html="htmlContent"
      />

      <!-- 이미지 목록 (기존 방식) -->
      <div v-if="images.length > 0" class="product-detail-content__images">
        <img
          v-for="(image, index) in images"
          :key="index"
          :src="image"
          :alt="`상품 상세 이미지 ${index + 1}`"
          class="product-detail-content__image"
        />
      </div>
    </div>
    <div v-if="hasContent" class="product-detail-content__more">
      <BaseButton
        variant="line"
        size="big"
        @click="toggleExpand"
      >
        {{ isExpanded ? labels.lessLabel : labels.moreLabel }}
      </BaseButton>
    </div>
  </section>
</template>
