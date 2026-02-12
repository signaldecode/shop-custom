<script setup>
import popupData from '~/data/popup.json'

defineProps({
  popups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss'])

const labels = popupData.floating

const getCloseOption = (popup) => {
  return (popup.closeOption || 'TODAY').toUpperCase()
}

const handleClose = (popup) => {
  emit('dismiss', popup.id, getCloseOption(popup))
}

const handleClick = (popup) => {
  if (!popup.linkUrl) return
  emit('dismiss', popup.id, 'close')
  window.open(popup.linkUrl, popup.linkTarget || '_blank')
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="popup-floating" tag="div" class="popup-floating-wrap">
      <div
        v-for="popup in popups"
        :key="popup.id"
        class="popup-floating"
      >
        <button
          type="button"
          class="popup-floating__close"
          :aria-label="labels.close"
          @click="handleClose(popup)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <a
          v-if="popup.linkUrl"
          :href="popup.linkUrl"
          :target="popup.linkTarget || '_blank'"
          rel="noopener noreferrer"
          class="popup-floating__link"
          @click.prevent="handleClick(popup)"
        >
          <NuxtImg
            :src="popup.image"
            :alt="popup.name"
            class="popup-floating__image"
            format="webp"
            width="480"
            quality="80"
            loading="eager"
          />
        </a>
        <NuxtImg
          v-else
          :src="popup.image"
          :alt="popup.name"
          class="popup-floating__image"
          format="webp"
          loading="eager"
        />
      </div>
    </TransitionGroup>
  </Teleport>
</template>
