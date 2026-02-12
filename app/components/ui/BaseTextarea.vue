<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
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
  rows: {
    type: [String, Number],
    default: 4
  },
  maxlength: {
    type: [String, Number],
    default: null
  },
  showCount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const uniqueId = useId()
const inputId = computed(() => props.id || uniqueId)

const textareaClasses = computed(() => [
  'base-textarea',
  {
    'base-textarea--error': props.error,
    'base-textarea--disabled': props.disabled
  }
])

const characterCount = computed(() => props.modelValue?.length || 0)

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
  <div :class="textareaClasses">
    <label v-if="label" :for="inputId" class="base-textarea__label">
      {{ label }}
      <span v-if="required" class="base-textarea__required" aria-hidden="true">*</span>
    </label>
    <div class="base-textarea__wrapper">
      <textarea
        :id="inputId"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :maxlength="maxlength"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${inputId}-error` : undefined"
        class="base-textarea__field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <span v-if="showCount && maxlength" class="base-textarea__count">
        {{ characterCount }}/{{ maxlength }}
      </span>
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="base-textarea__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>
