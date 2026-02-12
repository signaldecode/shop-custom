<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'email', 'tel', 'password', 'number'].includes(v)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
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
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  autocomplete: {
    type: String,
    default: 'off'
  },
  inputmode: {
    type: String,
    default: null,
    validator: (v) => [null, 'none', 'text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// useId()는 SSR-safe한 고유 ID 생성
const uniqueId = useId()
const inputId = computed(() => props.id || uniqueId)

const inputClasses = computed(() => [
  'base-input',
  {
    'base-input--error': props.error,
    'base-input--disabled': props.disabled
  }
])

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const handleBlur = (e) => {
  emit('blur', e)
}

const handleFocus = (e) => {
  emit('focus', e)
}
</script>

<template>
  <div :class="inputClasses">
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :required="required"
      :maxlength="maxlength"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="base-input__field"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
    />
    <p v-if="error" :id="`${inputId}-error`" class="base-input__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>
