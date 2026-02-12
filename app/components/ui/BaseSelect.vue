<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Object],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'box'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectRef = ref(null)

const selectedLabel = computed(() => {
  if (typeof props.modelValue === 'object' && props.modelValue !== null) {
    return props.modelValue.label || props.placeholder
  }
  const selected = props.options.find(opt => opt.value === props.modelValue)
  return selected?.label || props.placeholder
})

const hasValue = computed(() => {
  if (typeof props.modelValue === 'object') {
    return props.modelValue !== null
  }
  return props.modelValue !== '' && props.modelValue !== null
})

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const select = (option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const handleClickOutside = (e) => {
  if (selectRef.value && !selectRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div
    ref="selectRef"
    class="base-select"
    :class="[
      `base-select--${variant}`,
      {
        'base-select--open': isOpen,
        'base-select--disabled': disabled,
        'base-select--has-value': hasValue
      }
    ]"
  >
    <button
      type="button"
      class="base-select__trigger"
      :aria-expanded="isOpen"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="base-select__value" :class="{ 'base-select__value--placeholder': !hasValue }">
        {{ selectedLabel }}
      </span>
      <IconArrow
        direction="down"
        size="sm"
        class="base-select__arrow"
      />
    </button>
    <Transition name="dropdown">
      <ul v-show="isOpen" class="base-select__dropdown" role="listbox">
        <li
          v-for="option in options"
          :key="option.value || option"
          class="base-select__option"
          :class="{ 'base-select__option--selected': option.value === modelValue }"
          role="option"
          :aria-selected="option.value === modelValue"
          @click="select(option)"
        >
          {{ option.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>
