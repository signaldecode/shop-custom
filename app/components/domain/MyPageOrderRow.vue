<script setup>
const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  orderNo: {
    type: String,
    default: ''
  },
  orderDate: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const hasImage = computed(() => !!props.order.image)
const imageSrc = computed(() => props.order.image || '')
const statusVariant = computed(() => props.order?.status?.variant || 'default')

const handleClick = () => {
  if (props.clickable) emit('select', props.order)
}
</script>

<template>
  <component
    :is="clickable ? 'button' : 'article'"
    class="mypage-order-row"
    :class="{ 'mypage-order-row--clickable': clickable }"
    :type="clickable ? 'button' : undefined"
    @click="handleClick"
  >
    <div class="mypage-order-row__product">
      <NuxtLink
        v-if="order.productId"
        :to="`/products/${order.productId}`"
        class="mypage-order-row__thumb"
        @click.stop
      >
        <NuxtImg v-if="hasImage" :src="imageSrc" alt="" loading="lazy" />
        <div v-else class="mypage-order-row__thumb-placeholder">
          <span>item</span>
        </div>
      </NuxtLink>
      <div v-else class="mypage-order-row__thumb" aria-hidden="true">
        <NuxtImg v-if="hasImage" :src="imageSrc" alt="" loading="lazy" />
        <div v-else class="mypage-order-row__thumb-placeholder">
          <span>item</span>
        </div>
      </div>
      <div class="mypage-order-row__texts">
        <p class="mypage-order-row__name">{{ order.name }}</p>
        <p class="mypage-order-row__code">#{{ orderNo || order.id }}</p>
      </div>
    </div>

    <div class="mypage-order-row__meta">
      <p class="mypage-order-row__cell mypage-order-row__cell--price">{{ order.price }}</p>
      <p class="mypage-order-row__cell">{{ order.qty }}</p>
      <p class="mypage-order-row__cell mypage-order-row__cell--muted">{{ order.date }}</p>
    </div>

    <div
      v-if="order.status"
      class="mypage-order-row__status"
      :class="`mypage-order-row__status--${statusVariant}`"
    >
      <span
        class="mypage-order-row__dot"
        :class="`mypage-order-row__dot--${statusVariant}`"
      />
      <span class="mypage-order-row__status-text">{{ order.status.text }}</span>
    </div>
  </component>
</template>

