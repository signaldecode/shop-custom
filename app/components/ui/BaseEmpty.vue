<script setup>
defineProps({
  message: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'list'
  }
})
</script>

<template>
  <div class="base-empty">
    <div class="base-empty__icon" aria-hidden="true">
      <!-- 빈 리스트 (기본) - 클립보드에 빈 체크리스트 -->
      <svg v-if="icon === 'list'" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="4" width="32" height="40" rx="3" stroke="currentColor" stroke-width="1.5"/>
        <path d="M16 16H32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
        <path d="M16 24H32" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
        <path d="M16 32H26" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
      </svg>
      <!-- 빈 문서 - 접힌 모서리가 있는 빈 문서 -->
      <svg v-else-if="icon === 'document'" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6H30L36 12V42H12V6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M30 6V12H36" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M18 22H30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
        <path d="M18 28H30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
        <path d="M18 34H24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
      </svg>
      <!-- 검색 결과 없음 -->
      <svg v-else-if="icon === 'search'" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="12" stroke="currentColor" stroke-width="1.5"/>
        <path d="M31 31L40 40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M17 19L27 29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
        <path d="M27 19L17 29" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      </svg>
      <!-- 빈 장바구니 -->
      <svg v-else-if="icon === 'cart'" width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8H10L12 12M12 12L18 32H38L44 12H12Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="20" cy="40" r="3" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="36" cy="40" r="3" stroke="currentColor" stroke-width="1.5"/>
        <path d="M22 20L30 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 3"/>
      </svg>
    </div>
    <p class="base-empty__message">{{ message }}</p>
  </div>
</template>
