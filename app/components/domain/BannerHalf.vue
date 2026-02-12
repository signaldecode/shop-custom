<script setup>
const props = defineProps({
  banner: {
    type: Object,
    required: true
  },
  buttonLabel: {
    type: String,
    default: '더 알아보기'
  }
})

// API 필드명과 기존 필드명 모두 지원
const imageSrc = computed(() => props.banner.imageUrl || props.banner.image || '')
const imageAlt = computed(() => props.banner.title || props.banner.name || props.banner.imageAlt || '')
const title = computed(() => props.banner.title || props.banner.name || '')
const subtitle = computed(() => props.banner.subtitle || props.banner.description || '')
const href = computed(() => props.banner.linkUrl || props.banner.href || '')
const btnLabel = computed(() => props.banner.buttonLabel || props.buttonLabel)
</script>

<template>
  <article class="banner-half">
    <NuxtImg
      :src="imageSrc"
      :alt="imageAlt"
      class="banner-half__image"
      loading="lazy"
    />
    <div class="banner-half__content">
      <h3 class="banner-half__title">{{ title }}</h3>
      <p class="banner-half__subtitle">{{ subtitle }}</p>
      <BaseButton
        v-if="href"
        :label="btnLabel"
        :href="href"
        variant="line"
        color="white"
        size="big"
      />
    </div>
  </article>
</template>
