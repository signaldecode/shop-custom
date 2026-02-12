<script setup>
import noticesData from '~/data/notices.json'

const props = defineProps({
  notices: {
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

const emit = defineEmits(['click'])

const labels = noticesData.list
const emptyText = computed(() => props.emptyMessage || noticesData.empty.message)
</script>

<template>
  <div class="notice-list">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="notice-list__loading">
      <BaseSpinner />
    </div>

    <!-- 공지사항 목록 -->
    <template v-else>
      <ul v-if="notices.length > 0" class="notice-list__items">
        <li
          v-for="item in notices"
          :key="item.id"
          class="notice-item"
          :class="{ 'notice-item--pinned': item.isPinned }"
        >
          <button
            type="button"
            class="notice-item__link"
            @click="emit('click', item)"
          >
            <div class="notice-item__badge-wrap">
              <span
                v-if="item.isPinned"
                class="notice-item__badge notice-item__badge--pinned"
              >
                {{ labels.pinnedLabel }}
              </span>
              <span class="notice-item__badge notice-item__badge--type">
                {{ item.typeDescription }}
              </span>
            </div>
            <h3 class="notice-item__title">{{ item.title }}</h3>
            <div class="notice-item__meta">
              <span class="notice-item__date">{{ item.date }}</span>
            </div>
          </button>
        </li>
      </ul>
      <BaseEmpty v-else :message="emptyText" />
    </template>
  </div>
</template>
