<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <section class="section-categories">
    <div class="section-categories__inner">
      <!-- <h2 class="section-categories__title">{{ data.title }}</h2> -->
      <div class="section-categories__grid">
        <CategoryCard
          v-for="category in categories"
          :key="category.href"
          :category="category"
        />
      </div>
    </div>
  </section>
</template>
