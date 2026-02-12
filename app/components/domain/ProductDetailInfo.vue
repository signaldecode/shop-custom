<script setup>
defineProps({
  specs: {
    type: Array,
    default: () => []
  },
  labels: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <section id="section-info" class="product-detail-info">
    <div class="product-detail-info__header">
      <h2 class="product-detail-info__title">{{ labels.title }}</h2>
      <span class="product-detail-info__notice">{{ labels.notice }}</span>
    </div>
    <table class="product-detail-info__table">
      <tbody>
        <tr
          v-for="spec in specs"
          :key="spec.label"
          class="product-detail-info__row"
        >
          <th class="product-detail-info__label">{{ spec.label }}</th>
          <td class="product-detail-info__value">{{ spec.value }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
