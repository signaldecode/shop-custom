export default defineNuxtRouteMiddleware(async () => {
  // SSR에서는 스킵
  if (import.meta.server) return

  // localStorage 플래그 없으면 비로그인 상태 → API 호출 불필요
  const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true'
  if (!hasLoginFlag) return

  const authStore = useAuthStore()
  await authStore.ensureUser()

  if (authStore.isLoggedIn) {
    return navigateTo('/')
  }
})
