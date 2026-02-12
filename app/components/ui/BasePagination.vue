<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common
const paginationLabels = uiData.pagination

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalPages: {
    type: Number,
    required: true
  },
  visibleCount: {
    type: Number,
    default: 5
  },
  prevLabel: {
    type: String,
    default: ''
  },
  nextLabel: {
    type: String,
    default: ''
  }
})

const prevText = computed(() => props.prevLabel || common.prev)
const nextText = computed(() => props.nextLabel || common.next)

const emit = defineEmits(['update:currentPage'])

const canGoPrev = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)

// 첫 페이지 표시 여부 (뒤쪽에 있을 때)
const showFirstPage = computed(() => {
  if (props.totalPages <= props.visibleCount) return false
  const firstVisible = visiblePages.value[0]
  return firstVisible > 1
})

// 마지막 페이지 표시 여부 (앞쪽에 있을 때)
const showLastPage = computed(() => {
  if (props.totalPages <= props.visibleCount) return false
  const lastVisible = visiblePages.value[visiblePages.value.length - 1]
  return lastVisible < props.totalPages
})

// 앞쪽 말줄임(...) 표시 여부
const showStartEllipsis = computed(() => {
  if (!showFirstPage.value) return false
  const firstVisible = visiblePages.value[0]
  return firstVisible > 2
})

// 뒤쪽 말줄임(...) 표시 여부
const showEndEllipsis = computed(() => {
  if (!showLastPage.value) return false
  const lastVisible = visiblePages.value[visiblePages.value.length - 1]
  return lastVisible < props.totalPages - 1
})

const visiblePages = computed(() => {
  const pages = []
  const current = props.currentPage
  const total = props.totalPages
  const count = props.visibleCount

  if (total <= count) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(count / 2)

    if (current <= half + 1) {
      // 앞쪽에 있을 때: 1, 2, 3, 4, 5
      for (let i = 1; i <= count; i++) {
        pages.push(i)
      }
    } else if (current >= total - half) {
      // 뒤쪽에 있을 때: 마지막 5개
      for (let i = total - count + 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 중간에 있을 때: 현재 페이지 중심
      for (let i = current - half; i <= current + half; i++) {
        pages.push(i)
      }
    }
  }

  return pages
})

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
  }
}

const prevPage = () => {
  if (canGoPrev.value) {
    emit('update:currentPage', props.currentPage - 1)
  }
}

const nextPage = () => {
  if (canGoNext.value) {
    emit('update:currentPage', props.currentPage + 1)
  }
}
</script>

<template>
  <nav class="base-pagination" :aria-label="paginationLabels.ariaLabel">
    <button
      v-if="canGoPrev"
      type="button"
      class="base-pagination__btn base-pagination__btn--prev"
      :aria-label="prevText"
      @click="prevPage"
    >
      <IconArrow direction="left" size="sm" />
    </button>

    <ul class="base-pagination__pages">
      <!-- 첫 페이지 -->
      <li v-if="showFirstPage">
        <button
          type="button"
          class="base-pagination__page"
          :class="{ 'base-pagination__page--active': 1 === currentPage }"
          :aria-current="1 === currentPage ? 'page' : undefined"
          @click="goToPage(1)"
        >
          1
        </button>
      </li>

      <!-- 앞쪽 말줄임 -->
      <li v-if="showStartEllipsis" class="base-pagination__ellipsis">
        <span>...</span>
      </li>

      <!-- 페이지 번호들 -->
      <li v-for="page in visiblePages" :key="page">
        <button
          type="button"
          class="base-pagination__page"
          :class="{ 'base-pagination__page--active': page === currentPage }"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </li>

      <!-- 뒤쪽 말줄임 -->
      <li v-if="showEndEllipsis" class="base-pagination__ellipsis">
        <span>...</span>
      </li>

      <!-- 마지막 페이지 -->
      <li v-if="showLastPage">
        <button
          type="button"
          class="base-pagination__page"
          :class="{ 'base-pagination__page--active': totalPages === currentPage }"
          :aria-current="totalPages === currentPage ? 'page' : undefined"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
      </li>
    </ul>

    <button
      v-if="canGoNext"
      type="button"
      class="base-pagination__btn base-pagination__btn--next"
      :aria-label="nextText"
      @click="nextPage"
    >
      <IconArrow direction="right" size="sm" />
    </button>
  </nav>
</template>
