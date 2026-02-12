<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  }
})

const formattedPrice = computed(() => {
  return props.product.price?.toLocaleString() || '0'
})

const formattedTotalPrice = computed(() => {
  const total = (props.product.price || 0) * (props.product.quantity || 1)
  return total.toLocaleString()
})
</script>

<template>
  <article class="order-product-card">
    <NuxtLink :to="`/products/${product.id}`" class="order-product-card__image">
      <NuxtImg :src="product.image" :alt="product.imageAlt" loading="lazy" />
    </NuxtLink>
    <div class="order-product-card__info">
      <h3 class="order-product-card__name">{{ product.name }}</h3>
      <p v-if="product.option" class="order-product-card__option">
        {{ product.option }}
      </p>
    </div>
    <div class="order-product-card__meta">
      <span class="order-product-card__price">
        {{ formattedPrice }}{{ labels.currency }}
      </span>
      <span class="order-product-card__quantity">
        {{ product.quantity }}{{ labels.quantitySuffix }}
      </span>
    </div>
    <strong class="order-product-card__total-price">
      {{ formattedTotalPrice }}{{ labels.currency }}
    </strong>
  </article>
</template>
