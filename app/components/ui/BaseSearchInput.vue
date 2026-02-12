<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '검색어를 입력하세요'
  },
  closeLabel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit'])

const inputRef = ref(null)

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleSubmit = () => {
  emit('submit', props.modelValue)
}

const handleClose = () => {
  emit('update:modelValue', '')
  emit('close')
}

const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

defineExpose({ focus })
</script>

<template>
  <div class="base-search-input">
    <form class="base-search-input__form" @submit.prevent="handleSubmit">
      <input
        ref="inputRef"
        type="text"
        class="base-search-input__input"
        :value="modelValue"
        :placeholder="placeholder"
        @input="handleInput"
      />
      <button
        type="submit"
        class="base-search-input__search"
        :aria-label="common.search"
      >
        <IconSearch size="md" />
      </button>
      <button
        type="button"
        class="base-search-input__close"
        :aria-label="closeLabel || common.close"
        @click="handleClose"
      >
        <IconClose size="sm" />
      </button>
    </form>
  </div>
</template>
