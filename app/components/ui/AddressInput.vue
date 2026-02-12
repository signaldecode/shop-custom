<script setup>
import addressData from '~/data/address.json'

const props = defineProps({
  zip: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  detail: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:zip', 'update:address', 'update:detail'])

const { openPostcode } = usePostcode()

const handleSearch = async () => {
  const result = await openPostcode()
  emit('update:zip', result.zonecode)
  emit('update:address', result.address)
}

const handleDetailInput = (e) => {
  emit('update:detail', e.target.value)
}
</script>

<template>
  <div class="address-input">
    <div class="address-input__row">
      <div class="address-input__zip">
        <BaseInput
          :model-value="zip"
          :placeholder="addressData.placeholders.zip"
          :disabled="true"
          :readonly="true"
        />
      </div>
      <BaseButton
        type="button"
        variant="bg"
        color="green"
        size="big"
        class="address-input__btn"
        :disabled="disabled"
        :aria-label="addressData.ariaLabels.search"
        @click="handleSearch"
      >
        {{ addressData.buttons.search }}
      </BaseButton>
    </div>
    <BaseInput
      :model-value="address"
      :placeholder="addressData.placeholders.address"
      :disabled="true"
      :readonly="true"
    />
    <BaseInput
      :model-value="detail"
      :placeholder="addressData.placeholders.detail"
      :disabled="disabled"
      :required="required"
      autocomplete="address-line2"
      @input="handleDetailInput"
    />
  </div>
</template>
