/**
 * 쇼핑몰 정보 초기화 플러그인
 * - SSR 시점에 shop-info 로드 (SEO meta에 반영)
 * - 서버에서만 실행 (.server.js)
 */
export default defineNuxtPlugin(async () => {
  const { fetchShopInfo, isLoaded } = useShopInfo()

  // 이미 로드되었으면 스킵
  if (isLoaded.value) return

  // SSR에서 await → HTML에 meta 태그 포함
  try {
    await fetchShopInfo()
  } catch (err) {
    console.warn('Shop info fetch failed:', err)
  }
})
