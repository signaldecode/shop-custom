<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  totalCount: {
    type: Number,
    default: 0
  },
  labels: {
    type: Object,
    required: true
  },
  sortOptions: {
    type: Array,
    default: () => []
  },
  paginationLabels: {
    type: Object,
    default: () => ({})
  },
  tabs: {
    type: Array,
    default: () => []
  },
  tabsAriaLabel: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  skeletonCount: {
    type: Number,
    default: 8
  },
  activeTab: {
    type: String,
    default: ''
  }
})

const sortValue = defineModel('sort', { default: 'latest' })
const currentPage = defineModel('currentPage', { default: 1 })

const emit = defineEmits(['tabChange'])

// 탭 변경 핸들러 - 부모에게 이벤트 전달
const handleTabChange = (value) => {
  emit('tabChange', value)
}

defineExpose({
  sortValue,
  currentPage
})
</script>

<template>
  <div class="layout-product-list">
    <main class="layout-product-list__main">
      <div class="layout-product-list__inner">
        <h1 class="layout-product-list__title">{{ title }}</h1>

        <BaseTabs
          v-if="tabs.length"
          :model-value="props.activeTab"
          :tabs="tabs"
          :aria-label="tabsAriaLabel"
          variant="chip"
          class="layout-product-list__tabs"
          @update:model-value="handleTabChange"
        />

        <div class="layout-product-list__toolbar">
          <p class="layout-product-list__count">
            {{ labels.totalLabel }}
            <span class="layout-product-list__count-number">{{ totalCount }}{{ labels.totalUnit }}</span>{{ labels.totalSuffix }}
          </p>
          <BaseSelect
            v-model="sortValue"
            :options="sortOptions"
            class="layout-product-list__sort"
          />
        </div>

        <!-- 로딩 스피너 -->
        <div v-if="loading" class="layout-product-list__loading">
          <BaseSpinner size="large" />
        </div>

        <!-- 상품 그리드 -->
        <div v-else class="layout-product-list__grid">
          <slot />
        </div>

        <slot name="pagination" />
      </div>
    </main>

    <slot name="footer" />
  </div>
</template>
