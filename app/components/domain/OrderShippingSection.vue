<script setup>
import AddressInput from '../ui/AddressInput.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  labels: {
    type: Object,
    required: true
  },
  showSameAsOrderer: {
    type: Boolean,
    default: false
  },
  showSelectAddress: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'selectAddress'])

const isCustomMemo = computed(() => props.modelValue.memo === 'custom')

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

// 주소 검색 결과 처리
const handleAddressUpdate = (field, value) => {
  updateField(field, value)
}

// 배송지 선택 버튼 클릭
const handleSelectAddress = () => {
  emit('selectAddress')
}
</script>

<template>
  <section class="order-section">
    <header class="order-section__header">
      <h2 class="order-section__title">{{ labels.title }}</h2>
      <BaseButton
        v-if="showSelectAddress"
        type="button"
        variant="outline"
        color="green"
        size="small"
        @click="handleSelectAddress"
      >
        {{ labels.selectAddress }}
      </BaseButton>
    </header>
    <div class="order-section__content">
      <BaseCheckbox
        v-if="showSameAsOrderer"
        :model-value="modelValue.sameAsOrderer"
        :label="labels.sameAsOrderer"
        size="small"
        @update:model-value="updateField('sameAsOrderer', $event)"
      />

      <div class="order-section__row">
        <BaseInput
          :model-value="modelValue.recipient"
          :label="labels.fields.recipient.label"
          :placeholder="labels.fields.recipient.placeholder"
          :required="true"
          autocomplete="name"
          @update:model-value="updateField('recipient', $event)"
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

      <AddressInput
        :zip="modelValue.zipcode"
        :address="modelValue.address"
        :detail="modelValue.addressDetail"
        :required="true"
        @update:zip="handleAddressUpdate('zipcode', $event)"
        @update:address="handleAddressUpdate('address', $event)"
        @update:detail="handleAddressUpdate('addressDetail', $event)"
      />

      <div class="order-section__row order-section__row--full">
        <BaseSelect
          :model-value="modelValue.memo"
          :options="labels.fields.memo.options"
          :placeholder="labels.fields.memo.placeholder"
          variant="box"
          @update:model-value="updateField('memo', $event)"
        />
      </div>

      <div v-if="isCustomMemo" class="order-section__row order-section__row--full">
        <BaseInput
          :model-value="modelValue.customMemo"
          :placeholder="labels.fields.customMemo.placeholder"
          @update:model-value="updateField('customMemo', $event)"
        />
      </div>
    </div>
  </section>
</template>
