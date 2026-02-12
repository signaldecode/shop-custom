export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // SSR에서 이미 로그인 확인됐으면 localStorage 동기화
  if (authStore.isLoggedIn) {
    localStorage.setItem('isLoggedIn', 'true')
  }
})
