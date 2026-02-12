<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true,
    validator: (v) => v.every(item => 'label' in item && 'value' in item)
  },
  highlight: {
    type: String,
    default: null
  }
})
</script>

<template>
  <section class="order-info-section">
    <h3 class="order-info-section__title">{{ title }}</h3>
    <dl class="order-info-section__list">
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'order-info-section__row',
          { 'order-info-section__row--highlight': highlight === item.key }
        ]"
      >
        <dt class="order-info-section__label">{{ item.label }}</dt>
        <dd class="order-info-section__value">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>
