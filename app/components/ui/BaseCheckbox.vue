<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: null
  },
  id: {
    type: String,
    default: null
  },
  variant: {
    type: String,
    default: 'line',
    validator: (v) => ['line', 'bg', 'circle'].includes(v)
  },
  size: {
    type: String,
    default: 'big',
    validator: (v) => ['small', 'big'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])
const slots = useSlots()

// useId()는 SSR-safe한 고유 ID 생성
const uniqueId = useId()
const inputId = computed(() => props.id || uniqueId)

const hasCustomLabel = computed(() => !!slots.default)

const checkboxClasses = computed(() => [
  'base-checkbox',
  `base-checkbox--style-${props.variant}`,
  `base-checkbox--size-${props.size}`
])

const handleChange = (e) => {
  const checked = e.target.checked
  emit('update:modelValue', checked)
  emit('change', checked)
}
</script>

<template>
  <label :class="checkboxClasses">
    <input
      type="checkbox"
      class="base-checkbox__input"
      :id="inputId"
      :name="name"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="base-checkbox__box" aria-hidden="true" />
    <span class="base-checkbox__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>
