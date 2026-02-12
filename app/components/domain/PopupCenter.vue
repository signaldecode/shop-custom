<script setup>
import popupData from '~/data/popup.json'

defineProps({
  popups: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss'])

const labels = popupData.center

const handleHide = (popup) => {
  if (!popup) return
  emit('dismiss', popup.id, getHideType(popup))
}

const handleClose = (popup) => {
  if (!popup) return
  emit('dismiss', popup.id, 'close')
}

const handleImageClick = (popup) => {
  if (!popup?.linkUrl) return
  emit('dismiss', popup.id, 'close')
  window.open(popup.linkUrl, popup.linkTarget || '_blank')
}

const getHideType = (popup) => {
  return (popup.closeOption || 'TODAY').toUpperCase()
}

const hideLabel = (popup) => {
  if (getHideType(popup) === 'WEEK') return labels.closeWeek
  return labels.closeDay
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-center">
      <div
        v-if="popups.length"
        class="popup-center"
        role="dialog"
        aria-modal="true"
        :aria-label="popups[0].name"
      >
        <div class="popup-center__backdrop" @click="handleClose(popups[0])" />
        <div class="popup-center__container">
          <div class="popup-center__body">
            <a
              v-if="popups[0].linkUrl"
              :href="popups[0].linkUrl"
              :target="popups[0].linkTarget || '_blank'"
              rel="noopener noreferrer"
              class="popup-center__link"
              @click.prevent="handleImageClick(popups[0])"
            >
              <NuxtImg
                :src="popups[0].image"
                :alt="popups[0].name"
                class="popup-center__image"
                format="webp"
                width="480"
                quality="80"
                loading="eager"
              />
            </a>
            <NuxtImg
              v-else
              :src="popups[0].image"
              :alt="popups[0].name"
              class="popup-center__image"
              format="webp"
              loading="eager"
            />
          </div>
          <div class="popup-center__footer">
            <button
              type="button"
              class="popup-center__hide"
              @click="handleHide(popups[0])"
            >
              {{ hideLabel(popups[0]) }}
            </button>
            <button
              type="button"
              class="popup-center__close"
              @click="handleClose(popups[0])"
            >
              {{ labels.close }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
