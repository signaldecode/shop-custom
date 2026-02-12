<script setup>
const props = defineProps({
  banner: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section class="banner-full">
    <NuxtLink v-if="banner.href || banner.linkUrl" :to="banner.href || banner.linkUrl" class="banner-full__link">
      <NuxtImg
        :src="banner.imageUrl || banner.image"
        :alt="banner.title || banner.imageAlt"
        class="banner-full__image"
        loading="lazy"
      />
    </NuxtLink>
    <div v-else class="banner-full__wrapper">
      <NuxtImg
        :src="banner.imageUrl || banner.image"
        :alt="banner.title || banner.imageAlt"
        class="banner-full__image"
        loading="lazy"
      />
    </div>
  </section>
</template>
