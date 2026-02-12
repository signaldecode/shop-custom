<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const passwordError = computed(() => {
  if (!props.modelValue.passwordConfirm) return ''
  if (props.modelValue.password !== props.modelValue.passwordConfirm) {
    return props.labels.error.mismatch
  }
  return ''
})

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}
</script>

<template>
  <section class="order-section">
    <header class="order-section__header">
      <h2 class="order-section__title">{{ labels.title }}</h2>
    </header>
    <div class="order-section__content">
      <p class="order-section__note">{{ labels.description }}</p>
      <div class="order-section__row">
        <BaseInput
          :model-value="modelValue.password"
          type="password"
          :label="labels.fields.password.label"
          :placeholder="labels.fields.password.placeholder"
          :required="true"
          autocomplete="new-password"
          @update:model-value="updateField('password', $event)"
        />
        <BaseInput
          :model-value="modelValue.passwordConfirm"
          type="password"
          :label="labels.fields.passwordConfirm.label"
          :placeholder="labels.fields.passwordConfirm.placeholder"
          :required="true"
          :error="passwordError"
          autocomplete="new-password"
          @update:model-value="updateField('passwordConfirm', $event)"
        />
      </div>
    </div>
  </section>
</template>
