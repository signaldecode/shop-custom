<script setup>
import faqData from '~/data/faq.json'

const props = defineProps({
  faqs: {
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
  }
})

const openItem = ref(null)

const toggleItem = (id) => {
  openItem.value = openItem.value === id ? null : id
}

const isOpen = (id) => openItem.value === id

watch(() => props.faqs, () => {
  openItem.value = null
})

const labels = faqData.list
const emptyText = computed(() => props.emptyMessage || faqData.empty.message)
</script>

<template>
  <div class="faq-list">
    <div v-if="loading" class="faq-list__loading">
      <BaseSpinner />
    </div>

    <template v-else>
      <div v-if="faqs.length > 0" class="faq-list__items">
        <div
          v-for="item in faqs"
          :key="item.id"
          class="faq-item"
          :class="{ 'faq-item--open': isOpen(item.id) }"
        >
          <button
            type="button"
            class="faq-item__header"
            :aria-expanded="isOpen(item.id)"
            @click="toggleItem(item.id)"
          >
            <span class="faq-item__prefix">{{ labels.questionPrefix }}</span>
            <h3 class="faq-item__question">{{ item.question }}</h3>
            <span class="faq-item__arrow" aria-hidden="true">
              <IconArrow :direction="isOpen(item.id) ? 'up' : 'down'" size="sm" />
            </span>
          </button>

          <div v-if="isOpen(item.id)" class="faq-item__body">
            <div class="faq-item__answer">
              <p class="faq-item__answer-content">
                <span class="faq-item__prefix faq-item__prefix--answer">{{ labels.answerPrefix }}</span> {{ item.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <BaseEmpty v-else :message="emptyText" />
    </template>
  </div>
</template>
