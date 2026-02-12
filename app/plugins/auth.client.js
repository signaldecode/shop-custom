export default defineNuxtPlugin(async () => {
  // localStorage 플래그 없으면 API 호출 스킵
  const hasLoginFlag = localStorage.getItem('isLoggedIn') === 'true'
  if (!hasLoginFlag) return

  const authStore = useAuthStore()
  await authStore.fetchUser()
})
