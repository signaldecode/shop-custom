<script setup>
import uiData from '~/data/ui.json'

const common = uiData.common
const { toasts, remove } = useToast()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <TransitionGroup name="toast" tag="div" class="base-toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['base-toast', `base-toast--${toast.type}`]"
        role="alert"
        aria-live="polite"
      >
        <span class="base-toast__message">
          {{ toast.message }}
          <NuxtLink
            v-if="toast.link"
            :to="toast.link.href"
            class="base-toast__link"
            @click="remove(toast.id)"
          >
            {{ toast.link.text }}
          </NuxtLink>
        </span>
        <button
          type="button"
          class="base-toast__close"
          :aria-label="common.close"
          @click="remove(toast.id)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      </TransitionGroup>
    </Teleport>
  </ClientOnly>
</template>
