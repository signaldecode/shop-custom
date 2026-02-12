<script setup>
const props = defineProps({
  banners: {
    type: Array,
    default: () => []
  },
  buttonLabel: {
    type: String,
    default: '더 알아보기'
  }
})
</script>

<template>
  <section v-if="banners.length > 0" class="section-half-banners">
    <BannerHalf
      v-for="(banner, index) in banners"
      :key="banner.id || index"
      :banner="banner"
      :button-label="buttonLabel"
    />
  </section>
</template>
