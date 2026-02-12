<script setup>
const props = defineProps({
  qna: {
    type: Object,
    default: () => ({ total: 0, items: [] })
  },
  labels: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['write'])

const handleWriteQna = () => {
  emit('write')
}

const currentPage = ref(1)
const itemsPerPage = 5

// 아코디언 상태
const expandedId = ref(null)

const toggleExpand = (item) => {
  expandedId.value = expandedId.value === item.id ? null : item.id
}

const isExpanded = (id) => expandedId.value === id

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return (props.qna.items || []).slice(start, end)
})

const totalPages = computed(() => Math.ceil((props.qna.items?.length || 0) / itemsPerPage))

// 페이지 변경 시 펼쳐진 항목 닫기
watch(currentPage, () => {
  expandedId.value = null
})

// 아코디언 애니메이션
const onBeforeEnter = (el) => {
  el.style.maxHeight = '0'
  el.style.overflow = 'hidden'
}

const onEnter = (el, done) => {
  const height = el.scrollHeight
  requestAnimationFrame(() => {
    el.style.transition = 'max-height 0.3s ease'
    el.style.maxHeight = height + 'px'
    el.addEventListener('transitionend', () => {
      el.style.maxHeight = 'none'
      el.style.overflow = ''
      done()
    }, { once: true })
  })
}

const onBeforeLeave = (el) => {
  el.style.maxHeight = el.scrollHeight + 'px'
  el.style.overflow = 'hidden'
}

const onLeave = (el, done) => {
  requestAnimationFrame(() => {
    el.style.transition = 'max-height 0.3s ease'
    el.style.maxHeight = '0'
    el.addEventListener('transitionend', done, { once: true })
  })
}
</script>

<template>
  <section id="section-qna" class="product-detail-qna">
    <div class="product-detail-qna__header">
      <h2 class="product-detail-qna__title">{{ labels.title }} ({{ qna.total }})</h2>
      <BaseButton
        variant="ghost"
        size="sm"
        @click="handleWriteQna"
      >
        <span class="write-btn-content">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12.146 1.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-9.5 9.5a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l9.5-9.5zM11.207 4L12 4.793 13.793 3 13 2.207 11.207 4zm.586 1.5L10.5 4.207 4 10.707V11.5h.793l6.5-6.5z" fill="currentColor"/>
          </svg>
          {{ labels.writeLabel }}
        </span>
      </BaseButton>
    </div>

    <ul class="product-detail-qna__list" role="list">
      <li
        v-for="item in paginatedItems"
        :key="item.id"
        :class="['pd-qna-item', { 'pd-qna-item--expanded': isExpanded(item.id), 'pd-qna-item--secret': item.isSecret }]"
      >
        <!-- Header (클릭 영역) -->
        <button
          type="button"
          class="pd-qna-item__header"
          :aria-expanded="isExpanded(item.id)"
          @click="toggleExpand(item)"
        >
          <span class="pd-qna-item__category">{{ item.category }}</span>
          <p class="pd-qna-item__title">
            <IconLock v-if="item.isSecret" size="sm" aria-hidden="true" />
            {{ item.title }}
          </p>
          <BaseBadge
            class="pd-qna-item__badge"
            :label="item.isAnswered ? labels.answerLabel : labels.waitingLabel"
            :variant="item.isAnswered ? 'success' : 'default'"
            size="sm"
          />
          <p class="pd-qna-item__meta">
            <span class="pd-qna-item__username">{{ item.username }}</span>
            <time class="pd-qna-item__date" :datetime="item.date">{{ item.date }}</time>
          </p>
          <IconArrow
            class="pd-qna-item__arrow"
            :direction="isExpanded(item.id) ? 'up' : 'down'"
            size="sm"
          />
        </button>

        <!-- Content (펼쳐지는 영역) -->
        <Transition
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @before-leave="onBeforeLeave"
          @leave="onLeave"
        >
          <div v-if="isExpanded(item.id)" class="pd-qna-item__content">
            <!-- 문의 내용 -->
            <div class="pd-qna-item__question">
              <span class="pd-qna-item__label">{{ labels.questionLabel }}</span>
              <p class="pd-qna-item__text">{{ item.content }}</p>
            </div>

            <!-- 답변 -->
            <div v-if="item.isAnswered && item.answer" class="pd-qna-item__answer">
              <span class="pd-qna-item__label pd-qna-item__label--answer">{{ labels.answerContentLabel }}</span>
              <p class="pd-qna-item__text">{{ item.answer }}</p>
              <time v-if="item.answerDate" class="pd-qna-item__answer-date">{{ item.answerDate }}</time>
            </div>
            <div v-else class="pd-qna-item__no-answer">
              <p class="pd-qna-item__text pd-qna-item__text--empty">{{ labels.noAnswerMessage }}</p>
            </div>
          </div>
        </Transition>
      </li>
    </ul>
    <BaseEmpty v-if="paginatedItems.length === 0" :message="labels.emptyMessage" />

    <BasePagination
      v-if="totalPages > 1"
      v-model:current-page="currentPage"
      :total-pages="totalPages"
      :prev-label="labels.pagination.prevLabel"
      :next-label="labels.pagination.nextLabel"
      class="product-detail-qna__pagination"
    />
  </section>
</template>
