<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  ariaLabel: {
    type: String,
    default: ''
  }
})

const activeTab = defineModel({ default: '' })

const scrollToSection = (tabValue) => {
  activeTab.value = tabValue
  const element = document.getElementById(`section-${tabValue}`)
  if (element) {
    const headerOffset = 140
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}
</script>

<template>
  <nav class="product-detail-tabs" :aria-label="ariaLabel">
    <div class="product-detail-tabs__inner">
      <ul class="product-detail-tabs__list" role="tablist">
        <li
          v-for="tab in tabs"
          :key="tab.value"
          class="product-detail-tabs__item"
          role="presentation"
        >
          <button
            class="product-detail-tabs__button"
            :class="{ 'product-detail-tabs__button--active': activeTab === tab.value }"
            role="tab"
            :aria-selected="activeTab === tab.value"
            @click="scrollToSection(tab.value)"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
