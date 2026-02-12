import { getRequestHeader, appendResponseHeader } from 'h3'

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const event = nuxtApp.ssrContext?.event

  if (!event || !config.apiBaseUrl) return

  const cookieHeader = getRequestHeader(event, 'cookie') || ''

  // 쿠키에서 토큰 존재 여부 확인 (빈 값 제외)
  const getCookieValue = (name) => {
    const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`))
    return match ? match[1] : null
  }

  const accessToken = getCookieValue('access_token')
  const refreshTokenValue = getCookieValue('refresh_token')

  // 토큰이 하나도 없으면 비로그인 상태 → API 호출 불필요
  if (!accessToken && !refreshTokenValue) {
    return
  }

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

    // 새 쿠키를 브라우저로 전달 (프록시와 동일한 수정 적용)
    const setCookies = res.headers.getSetCookie?.() || []
    for (const cookie of setCookies) {
      const modifiedCookie = cookie
        .replace(/;\s*Secure/gi, '')
        .replace(/SameSite=None/gi, 'SameSite=Lax')
        .replace(/Path=\/api[^;]*/gi, 'Path=/')
        .replace(/Domain=[^;]+;?/gi, '')
      appendResponseHeader(event, 'Set-Cookie', modifiedCookie)
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
    const status = error?.response?.status || error?.status || error?.statusCode
    // 에러 응답 구조: { data: { error: { code, message } } }
    const errorData = error?.response?._data || error?.data || {}
    const errorCode = errorData?.data?.error?.code || errorData?.error?.code

    // 401 + AUTH_016 (액세스 토큰 만료/없음) + 리프레시 토큰 존재 → refresh 시도
    // 리프레시 토큰이 없으면 첫 진입(비로그인)이므로 모달 표시 안 함
    if (status === 401 && errorCode === 'AUTH_016' && refreshTokenValue) {
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
        const refreshErrorData = refreshError?.response?._data || refreshError?.data || {}
        const message = refreshErrorData?.data?.error?.message
          || refreshErrorData?.error?.message
          || '세션이 만료되었습니다.'
        authStore.setSessionExpired(message)
      }
    }
    // 리프레시 토큰 없거나 다른 에러 → 비로그인 상태 (정상, 모달 없음)
  }
})
