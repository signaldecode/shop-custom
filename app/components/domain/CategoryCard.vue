<script setup>
const props = defineProps({
  category: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <article class="category-card">
    <NuxtLink :to="category.href" class="category-card__link">
      <!-- <div class="category-card__image-wrap">
        <img
          :src="category.image"
          :alt="category.imageAlt"
          class="category-card__image"
          loading="lazy"
        />
      </div> -->
      <p class="category-card__label">{{ category.label }}</p>
    </NuxtLink>
  </article>
</template>
