<script setup>
const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  },
  ariaLabel: {
    type: String,
    default: '탭 목록'
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'chip'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const scrollContainer = ref(null)

// chip variant 모바일 가로 스크롤용 useSwipe
const SCROLL_AMOUNT = 120

const { swipeEvents } = useSwipe({
  onSwipeLeft: () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
    }
  },
  onSwipeRight: () => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' })
    }
  },
  threshold: 30
})

const handleTabClick = (value) => {
  emit('update:modelValue', value)
}

const handleKeydown = (e, index) => {
  let newIndex = index

  if (e.key === 'ArrowRight') {
    newIndex = (index + 1) % props.tabs.length
  } else if (e.key === 'ArrowLeft') {
    newIndex = (index - 1 + props.tabs.length) % props.tabs.length
  } else if (e.key === 'Home') {
    newIndex = 0
  } else if (e.key === 'End') {
    newIndex = props.tabs.length - 1
  } else {
    return
  }

  e.preventDefault()
  emit('update:modelValue', props.tabs[newIndex].value)
}
</script>

<template>
  <div
    ref="scrollContainer"
    class="base-tabs"
    :class="[`base-tabs--${variant}`]"
    role="tablist"
    :aria-label="ariaLabel"
    v-on="variant === 'chip' ? swipeEvents : {}"
  >
    <button
      v-for="(tab, index) in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      class="base-tabs__tab"
      :class="{ 'base-tabs__tab--active': modelValue === tab.value }"
      :aria-selected="modelValue === tab.value"
      :tabindex="modelValue === tab.value ? 0 : -1"
      @click="handleTabClick(tab.value)"
      @keydown="handleKeydown($event, index)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
