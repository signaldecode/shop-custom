<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'box'].includes(v)
  },
  layout: {
    type: String,
    default: 'horizontal',
    validator: (v) => ['horizontal', 'vertical', 'grid'].includes(v)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ariaLabel: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const groupClasses = computed(() => [
  'base-radio-group',
  {
    'base-radio-group--vertical': props.layout === 'vertical',
    'base-radio-group--grid': props.layout === 'grid'
  }
])

const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<template>
  <div
    :class="groupClasses"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <BaseRadio
      v-for="option in options"
      :key="option.value"
      :model-value="modelValue"
      :value="option.value"
      :label="option.label"
      :name="name"
      :variant="variant"
      :disabled="disabled || option.disabled"
      @update:model-value="handleChange"
    />
  </div>
</template>
