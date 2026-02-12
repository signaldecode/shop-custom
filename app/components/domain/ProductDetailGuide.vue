<script setup>
defineProps({
  data: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section id="section-guide" class="product-detail-guide">
    <h2 class="product-detail-guide__title">{{ data.title }}</h2>
    <div
      v-for="section in data.sections"
      :key="section.title"
      class="product-detail-guide__section"
    >
      <h3 class="product-detail-guide__section-title">{{ section.title }}</h3>
      <p class="product-detail-guide__section-content">{{ section.content }}</p>
    </div>
  </section>
</template>
