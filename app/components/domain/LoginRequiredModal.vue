<script setup>
import uiData from '~/data/ui.json'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  feature: {
    type: String,
    default: ''
  },
  redirectPath: {
    type: String,
    default: ''
  },
  goBackOnCancel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'login', 'cancel'])

const route = useRoute()
const router = useRouter()

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const labels = uiData.loginRequiredModal

const message = computed(() => {
  return `${props.feature} ${labels.messageSuffix}`
})

const handleLogin = () => {
  const redirect = props.redirectPath || route.fullPath
  emit('update:modelValue', false)
  emit('login')
  router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
  if (props.goBackOnCancel) {
    router.back()
  }
}
</script>

<template>
  <BaseModal
    v-model="isOpen"
    :title="labels.title"
    size="small"
  >
    <div class="login-required-modal">
      <p class="login-required-modal__message">{{ message }}</p>
    </div>

    <template #footer>
      <div class="login-required-modal__actions">
        <BaseButton
          :label="labels.loginButton"
          variant="bg"
          color="green"
          size="small"
          @click="handleLogin"
        />
        <BaseButton
          :label="labels.cancelButton"
          variant="bg"
          color="light"
          size="small"
          @click="handleCancel"
        />
      </div>
    </template>
  </BaseModal>
</template>
