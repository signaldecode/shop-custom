<script setup>
import qnaData from '~/data/qna.json'
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  qnas: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: ''
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  deleteLabel: {
    type: String,
    default: ''
  }
})

const deleteText = computed(() => props.deleteLabel || common.delete)

const emit = defineEmits(['delete'])

// 아코디언 열림 상태
const openItems = ref(new Set())

const toggleItem = (id) => {
  if (openItems.value.has(id)) {
    openItems.value.delete(id)
  } else {
    openItems.value.add(id)
  }
  openItems.value = new Set(openItems.value)
}

const isOpen = (id) => openItems.value.has(id)

const labels = qnaData.list
const emptyText = computed(() => props.emptyMessage || qnaData.empty.message)
</script>

<template>
  <div class="qna-list">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="qna-list__loading">
      <BaseSpinner />
    </div>

    <!-- Q&A 목록 -->
    <template v-else>
      <div v-if="qnas.length > 0" class="qna-list__items">
        <div
          v-for="item in qnas"
          :key="item.id"
          class="qna-item"
          :class="{ 'qna-item--open': isOpen(item.id) }"
        >
          <!-- 질문 헤더 (아코디언 토글) -->
          <button
            type="button"
            class="qna-item__header"
            :aria-expanded="isOpen(item.id)"
            @click="toggleItem(item.id)"
          >
            <div class="qna-item__top">
              <div class="qna-item__meta">
                <span class="qna-item__type">{{ item.qnaTypeName }}</span>
                <span
                  class="qna-item__status"
                  :class="item.isAnswered ? 'qna-item__status--answered' : 'qna-item__status--waiting'"
                >
                  {{ item.isAnswered ? labels.answeredLabel : labels.waitingLabel }}
                </span>
              </div>
              <div class="qna-item__info">
                <span class="qna-item__date">{{ item.date }}</span>
                <span class="qna-item__arrow" aria-hidden="true">
                  <IconArrow :direction="isOpen(item.id) ? 'up' : 'down'" size="sm" />
                </span>
              </div>
            </div>
            <h3 class="qna-item__title">
              <span v-if="item.isSecret" class="qna-item__secret-icon" aria-hidden="true">
                <IconLock size="sm" />
              </span>
              {{ item.title }}
            </h3>
          </button>

          <!-- 질문/답변 본문 (아코디언 콘텐츠) -->
          <div v-if="isOpen(item.id) && item.question" class="qna-item__body">
            <!-- 질문 내용 -->
            <div class="qna-item__question">
              <p class="qna-item__content">{{ item.question }}</p>
            </div>

            <!-- 답변 (있는 경우) -->
            <div v-if="item.isAnswered && item.answer" class="qna-item__answer">
              <div class="qna-item__answer-header">
                <span class="qna-item__answer-badge">{{ labels.answerTitle }}</span>
                <span v-if="item.answeredAt" class="qna-item__answer-date">{{ item.answeredAt }}</span>
              </div>
              <p class="qna-item__answer-content">{{ item.answer }}</p>
            </div>

            <!-- 삭제 버튼 -->
            <div v-if="showDelete" class="qna-item__actions">
              <button
                type="button"
                class="qna-item__delete-btn"
                @click.stop="emit('delete', item)"
              >
                {{ deleteLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <BaseEmpty v-else :message="emptyText" />
    </template>
  </div>
</template>
