<script setup>
import addressData from '~/data/address.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'select',
    validator: (v) => ['select', 'manage'].includes(v)
  }
})

const emit = defineEmits(['update:modelValue', 'select', 'setDefault'])

const { transformedAddresses, pending, error, fetchAddresses, setDefaultAddress, deleteAddress } = useAddress()

const labels = addressData.modal

// 모달 열림/닫힘
const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 모달이 열릴 때 배송지 목록 조회
watch(isOpen, async (open) => {
  if (open) {
    await fetchAddresses()
  }
})

// 배송지 선택
const handleSelect = (address) => {
  emit('select', address)
  isOpen.value = false
}

// 기본 배송지 설정
const handleSetDefault = async (addressId) => {
  try {
    await setDefaultAddress(addressId)
    emit('setDefault', addressId)
  } catch (e) {
    console.error('Failed to set default address:', e)
  }
}

// 배송지 삭제
const handleDelete = async (addressId) => {
  if (confirm(labels.deleteConfirm)) {
    try {
      await deleteAddress(addressId)
    } catch (e) {
      console.error('Failed to delete address:', e)
    }
  }
}

// 주소 포맷팅
const formatAddress = (address) => {
  return `${address.address} ${address.addressDetail || ''}`
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="labels.title"
    size="medium"
  >
    <div class="address-modal">
      <!-- 로딩 상태 -->
      <div v-if="pending" class="address-modal__loading">
        {{ labels.loading }}
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="error" class="address-modal__error">
        {{ labels.error }}
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="transformedAddresses.length === 0" class="address-modal__empty">
        {{ labels.empty }}
      </div>

      <!-- 배송지 목록 -->
      <ul v-else class="address-modal__list">
        <li
          v-for="address in transformedAddresses"
          :key="address.id"
          class="address-modal__item"
        >
          <div class="address-modal__info">
            <div class="address-modal__header">
              <span class="address-modal__name">{{ address.name }}</span>
              <BaseBadge
                v-if="address.isDefault"
                :label="labels.defaultBadge"
                variant="primary"
                size="sm"
              />
            </div>
            <p class="address-modal__recipient">
              {{ address.recipient }} · {{ address.phone }}
            </p>
            <p class="address-modal__address">
              [{{ address.zipcode }}] {{ formatAddress(address) }}
            </p>
          </div>

          <div class="address-modal__actions">
            <!-- select 모드: 선택 버튼 -->
            <template v-if="mode === 'select'">
              <BaseButton
                type="button"
                variant="solid"
                color="green"
                size="small"
                @click="handleSelect(address)"
              >
                {{ labels.select }}
              </BaseButton>
            </template>

            <!-- manage 모드: 기본배송지 설정, 수정, 삭제 -->
            <template v-else>
              <BaseButton
                v-if="!address.isDefault"
                type="button"
                variant="outline"
                color="green"
                size="small"
                @click="handleSetDefault(address.id)"
              >
                {{ labels.setDefault }}
              </BaseButton>
              <BaseButton
                type="button"
                variant="ghost"
                color="gray"
                size="small"
                @click="handleDelete(address.id)"
              >
                {{ labels.delete }}
              </BaseButton>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </BaseModal>
</template>
