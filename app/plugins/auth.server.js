import { getRequestHeader, appendResponseHeader } from 'h3'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const event = nuxtApp.ssrContext?.event

  if (!event || !config.apiBaseUrl) return

  const cookieHeader = getRequestHeader(event, 'cookie') || ''

  // /me 호출 함수
  const fetchMe = async () => {
    const res = await $fetch(`${config.apiBaseUrl}/users/me`, {
      headers: { cookie: cookieHeader },
      credentials: 'include'
    })
    return res
  }

  // /refresh 호출 함수
  const refreshToken = async () => {
    const res = await $fetch.raw(`${config.apiBaseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { cookie: cookieHeader },
      credentials: 'include'
    })

    // 새 쿠키를 브라우저로 전달
    const setCookies = res.headers.getSetCookie?.() || []
    for (const cookie of setCookies) {
      appendResponseHeader(event, 'Set-Cookie', cookie)
    }

    return res._data
  }

  try {
    // 1차 시도: /me 호출
    const res = await fetchMe()
    if (res.success && res.data) {
      authStore.user = res.data
      authStore.isLoggedIn = true
    }
  } catch (error) {
    const status = error?.response?.status || error?.status
    const errorCode = error?.response?._data?.error?.code || error?.data?.error?.code

    // 401 + AUTH_016 (액세스 토큰 만료/없음) → refresh 시도
    if (status === 401 && errorCode === 'AUTH_016') {
      try {
        await refreshToken()

        // refresh 성공 → /me 재시도
        const res = await fetchMe()
        if (res.success && res.data) {
          authStore.user = res.data
          authStore.isLoggedIn = true
        }
      } catch (refreshError) {
        // refresh 실패 (AUTH_002: 리프레시 토큰도 만료) → 세션 만료
        const message = refreshError?.response?._data?.error?.message
          || refreshError?.data?.error?.message
          || '세션이 만료되었습니다.'
        authStore.setSessionExpired(message)
      }
    }
    // 다른 에러 → 비로그인 상태 (정상)
  }
})
