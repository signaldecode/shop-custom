<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common
const imageUploadLabels = uiData.imageUpload

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 5
  },
  maxSizeMB: {
    type: Number,
    default: 10
  },
  accept: {
    type: String,
    default: 'image/jpeg, image/png, image/webp'
  },
  placeholder: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  deleteLabel: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'error'])

const placeholderText = computed(() => props.placeholder || imageUploadLabels.placeholder)
const deleteText = computed(() => props.deleteLabel || common.delete)

const fileInputRef = ref(null)

const canAddMore = computed(() => props.modelValue.length < props.maxCount)

const handleClick = () => {
  if (props.disabled || !canAddMore.value) return
  fileInputRef.value?.click()
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files || [])
  if (files.length === 0) return

  const maxBytes = props.maxSizeMB * 1024 * 1024
  const validFiles = []

  for (const file of files) {
    if (props.modelValue.length + validFiles.length >= props.maxCount) break

    if (file.size > maxBytes) {
      emit('error', imageUploadLabels.fileSizeError.replace('{size}', props.maxSizeMB))
      continue
    }

    validFiles.push({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file)
    })
  }

  if (validFiles.length > 0) {
    emit('update:modelValue', [...props.modelValue, ...validFiles])
  }

  // Reset input
  e.target.value = ''
}

const handleDelete = (id) => {
  const item = props.modelValue.find(i => i.id === id)
  if (item?.preview) {
    URL.revokeObjectURL(item.preview)
  }
  emit('update:modelValue', props.modelValue.filter(i => i.id !== id))
}

// Cleanup on unmount
onUnmounted(() => {
  props.modelValue.forEach(item => {
    if (item.preview) {
      URL.revokeObjectURL(item.preview)
    }
  })
})
</script>

<template>
  <div class="base-image-upload" :class="{ 'base-image-upload--disabled': disabled }">
    <div class="base-image-upload__grid">
      <!-- Upload Button -->
      <button
        v-if="canAddMore"
        type="button"
        class="base-image-upload__add"
        :disabled="disabled"
        @click="handleClick"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="base-image-upload__add-text">{{ placeholderText }}</span>
      </button>

      <!-- Preview Items -->
      <div
        v-for="item in modelValue"
        :key="item.id"
        class="base-image-upload__item"
      >
        <img
          :src="item.preview"
          :alt="imageUploadLabels.uploadedImageAlt"
          class="base-image-upload__preview"
        />
        <button
          type="button"
          class="base-image-upload__delete"
          :aria-label="deleteText"
          @click="handleDelete(item.id)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <p v-if="helpText" class="base-image-upload__help">{{ helpText }}</p>

    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      multiple
      class="base-image-upload__input"
      @change="handleFileChange"
    />
  </div>
</template>
