<script setup>
defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="layout-page">
    <main class="layout-page__main">
      <div class="layout-page__inner">
        <header class="layout-page__header">
          <h1 class="layout-page__title">{{ title }}</h1>
        </header>

        <slot />
      </div>
    </main>

    <slot name="footer" />
  </div>
</template>
