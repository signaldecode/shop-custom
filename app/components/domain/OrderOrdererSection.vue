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

const updateField = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
}

// 연락처 필드 업데이트 (숫자만 허용, 최대 11자리)
const updatePhone = (value) => {
  const numericOnly = (value || '').replace(/[^0-9]/g, '').slice(0, 11)
  updateField('phone', numericOnly)
}
</script>

<template>
  <section class="order-section">
    <header class="order-section__header">
      <h2 class="order-section__title">{{ labels.title }}</h2>
    </header>
    <div class="order-section__content">
      <div class="order-section__row">
        <BaseInput
          :model-value="modelValue.name"
          :label="labels.fields.name.label"
          :placeholder="labels.fields.name.placeholder"
          :required="true"
          autocomplete="name"
          @update:model-value="updateField('name', $event)"
        />
        <BaseInput
          :model-value="modelValue.phone"
          type="tel"
          inputmode="numeric"
          :maxlength="11"
          :label="labels.fields.phone.label"
          :placeholder="labels.fields.phone.placeholder"
          :required="true"
          autocomplete="tel"
          @update:model-value="updatePhone"
        />
      </div>
      <div class="order-section__row order-section__row--full">
        <BaseInput
          :model-value="modelValue.email"
          type="email"
          :label="labels.fields.email.label"
          :placeholder="labels.fields.email.placeholder"
          :required="true"
          autocomplete="email"
          @update:model-value="updateField('email', $event)"
        />
      </div>
    </div>
  </section>
</template>
