/**
 * 동적 robots.txt 생성
 * shop-info API의 seoInfo.robotTxt 값을 사용
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || ''

  let robotsTxt = 'User-Agent: *\nAllow: /'

  try {
    // shop-info API 호출
    const response = await $fetch(`${baseURL}/main/shop-info`)
    const data = response?.data || response

    // robotsTxt 필드 확인 (seoInfo 내부)
    if (data?.seoInfo?.robotsTxt) {
      robotsTxt = data.seoInfo.robotsTxt
    }
  } catch (error) {
    console.error('[robots.txt] Failed to fetch shop-info:', error)
    // API 실패 시 기본값 사용
  }

  // Content-Type 설정
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600') // 1시간 캐시

  return robotsTxt
})
