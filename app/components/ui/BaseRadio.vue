<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    default: null
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

const emit = defineEmits(['update:modelValue', 'change'])

const inputId = computed(() => props.id || `radio-${props.name}-${props.value}`)

const isChecked = computed(() => props.modelValue === props.value)

const radioClasses = computed(() => [
  'base-radio',
  `base-radio--${props.variant}`,
  {
    'base-radio--checked': isChecked.value,
    'base-radio--disabled': props.disabled
  }
])

const handleChange = () => {
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<template>
  <label :class="radioClasses">
    <input
      type="radio"
      class="base-radio__input"
      :id="inputId"
      :name="name"
      :value="value"
      :checked="isChecked"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="base-radio__circle" aria-hidden="true" />
    <span class="base-radio__label">{{ label }}</span>
  </label>
</template>
