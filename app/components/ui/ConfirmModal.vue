<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmLabel: {
    type: String,
    default: ''
  },
  cancelLabel: {
    type: String,
    default: ''
  },
  confirmVariant: {
    type: String,
    default: 'primary'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const confirmText = computed(() => props.confirmLabel || common.confirm)
const cancelText = computed(() => props.cancelLabel || common.cancel)

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  isOpen.value = false
  emit('cancel')
}

const handleClose = () => {
  isOpen.value = false
  emit('cancel')
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="title"
    size="small"
    @close="handleClose"
  >
    <p class="confirm-modal__message">{{ message }}</p>
    <template #footer>
      <BaseButton variant="outline" @click="handleCancel">
        {{ cancelText }}
      </BaseButton>
      <BaseButton :variant="confirmVariant" @click="handleConfirm">
        {{ confirmText }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
