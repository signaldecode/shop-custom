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

const showCardOptions = computed(() => props.modelValue.method === 'card')
const showBankOptions = computed(() => props.modelValue.method === 'bank')

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
    <div class="order-payment">
      <BaseRadioGroup
        :model-value="modelValue.method"
        :options="labels.methods"
        name="payment-method"
        variant="default"
        :aria-label="labels.title"
        @update:model-value="updateField('method', $event)"
      />

      <div v-if="showCardOptions" class="order-payment__card-options">
        <BaseSelect
          :model-value="modelValue.cardCompany"
          :options="labels.card.company.options"
          :placeholder="labels.card.company.placeholder"
          variant="box"
          @update:model-value="updateField('cardCompany', $event)"
        />
        <BaseSelect
          :model-value="modelValue.installment"
          :options="labels.card.installment.options"
          :placeholder="labels.card.installment.placeholder"
          variant="box"
          @update:model-value="updateField('installment', $event)"
        />
      </div>

      <div v-if="showBankOptions" class="order-payment__card-options">
        <BaseSelect
          :model-value="modelValue.bank"
          :options="labels.bank.select.options"
          :placeholder="labels.bank.select.placeholder"
          variant="box"
          @update:model-value="updateField('bank', $event)"
        />
        <BaseInput
          :model-value="modelValue.depositor"
          :placeholder="labels.bank.depositor.placeholder"
          @update:model-value="updateField('depositor', $event)"
        />
      </div>
    </div>
  </section>
</template>
