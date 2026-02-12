export default defineNuxtPlugin(async () => {
  const cart = useCart()
  try {
    await cart.fetchCart()
  } catch {
    // 헤더 뱃지용이므로 초기 로드 실패는 조용히 무시(페이지에서 별도 처리 가능)
  }
})

