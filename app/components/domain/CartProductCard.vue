<script setup>
import uiData from '~/data/ui.json'

const uiLabels = uiData.productItem

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  },
  labels: {
    type: Object,
    required: true
  },
  soldOut: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:selected', 'update:quantity', 'delete'])

const quantity = computed({
  get: () => props.item.quantity || 1,
  set: (val) => emit('update:quantity', props.item.id, val)
})

const formattedPrice = computed(() => {
  return (props.item.price || 0).toLocaleString()
})

const formattedTotalPrice = computed(() => {
  const total = (props.item.price || 0) * (props.item.quantity || 1)
  return total.toLocaleString()
})

const handleSelect = (checked) => {
  emit('update:selected', props.item.id, checked)
}

const handleDelete = () => {
  emit('delete', props.item.id)
}
</script>

<template>
  <article class="cart-product-card" :class="{ 'cart-product-card--sold-out': soldOut }">
    <div class="cart-product-card__select">
      <BaseCheckbox
        :model-value="selected"
        variant="circle"
        size="big"
        :aria-label="item.name"
        :disabled="soldOut"
        @update:model-value="handleSelect"
      />
    </div>

    <NuxtLink :to="`/products/${item.productId}`" class="cart-product-card__image">
      <NuxtImg :src="item.image" :alt="item.imageAlt || item.name" loading="lazy" />
      <span v-if="soldOut" class="cart-product-card__sold-out-badge">{{ uiLabels.soldOut }}</span>
    </NuxtLink>

    <div class="cart-product-card__info">
      <h3 class="cart-product-card__name">{{ item.name }}</h3>
      <p v-if="item.variantName" class="cart-product-card__option">{{ item.variantName }}</p>
    </div>

    <div class="cart-product-card__price">
      <span>{{ formattedPrice }}{{ labels.currency }}</span>
    </div>

    <div class="cart-product-card__quantity">
      <BaseQuantitySelector
        v-model="quantity"
        :min="1"
        :max="99"
        :disabled="soldOut"
      />
    </div>

    <div class="cart-product-card__total">
      <strong class="cart-product-card__total-price">
        {{ formattedTotalPrice }}{{ labels.currency }}
      </strong>
    </div>

    <button
      type="button"
      class="cart-product-card__delete"
      :aria-label="uiLabels.removeAriaLabel"
      @click="handleDelete"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </article>
</template>
