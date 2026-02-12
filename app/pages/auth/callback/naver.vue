<script setup>
import loginData from '~/data/login.json'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const signupStore = useSignupStore()
const { verifyState, naverLogin, naverLink, linkAccount, clearLinkCredentials, getOAuthMode, getRedirectPath } = useSocialAuth()
const { mergeCart } = useCart()

const status = ref('loading') // loading | error | link
const errorMessage = ref('')

// 계정 연동 모달 상태
const showLinkModal = ref(false)
const linkData = ref(null) // { linkToken, provider, email }
const linkPassword = ref('')
const linkSubmitting = ref(false)
const linkError = ref('')

const handleError = (redirectPath, message) => {
  status.value = 'error'
  errorMessage.value = message || loginData.social.callback.error
  setTimeout(() => router.replace(redirectPath), 2000)
}

// 계정 연동 처리
const handleLinkConfirm = async () => {
  if (!linkPassword.value) return

  linkSubmitting.value = true
  linkError.value = ''

  try {
    const result = await linkAccount(
      linkData.value.linkToken,
      linkData.value.provider.toLowerCase(),
      linkData.value.email,
      linkPassword.value
    )

    if (result.success) {
      await authStore.login()
      showLinkModal.value = false
      try { await mergeCart() } catch (e) { console.warn('Failed to merge cart:', e) }
      router.replace(getRedirectPath())
    } else {
      linkError.value = loginData.social.callback.linkError
    }
  } catch (err) {
    linkError.value = err.data?.error?.message || loginData.social.callback.linkError
  } finally {
    linkSubmitting.value = false
  }
}

const handleLinkCancel = () => {
  showLinkModal.value = false
  router.replace('/login')
}

onMounted(async () => {
  const { code, state, error } = route.query
  const mode = getOAuthMode()
  const errorRedirect = mode === 'link' ? '/mypage/profile' : '/login'

  // 사용자가 로그인 취소했거나 에러 발생
  if (error || !code || !state) {
    clearLinkCredentials()
    handleError(errorRedirect)
    return
  }

  // CSRF state 검증
  if (!verifyState(state)) {
    clearLinkCredentials()
    handleError(errorRedirect)
    return
  }

  // 계정 연동 모드 (마이페이지에서 진입)
  if (mode === 'link') {
    try {
      const result = await naverLink(code, state)

      if (result.success) {
        alert(loginData.social.callback.linkSuccess)
        router.replace('/mypage/profile')
      } else {
        handleError('/mypage/profile')
      }
    } catch (err) {
      clearLinkCredentials()
      handleError('/mypage/profile', err.data?.error?.message)
    }
    return
  }

  // 로그인 모드
  try {
    const result = await naverLogin(code, state)

    if (!result.success) {
      handleError('/login')
      return
    }

    const { data } = result

    // 신규 유저 → 약관 동의 후 회원가입
    if (data.isNewUser) {
      signupStore.setSocialAuth(data.signupToken, 'naver')
      router.replace('/signup/terms')
      return
    }

    // 기존 유저 → 바로 로그인
    await authStore.login()
    try { await mergeCart() } catch (e) { console.warn('Failed to merge cart:', e) }
    router.replace(getRedirectPath())
  } catch (err) {
    // AUTH_013: 동일 이메일 일반 가입 유저 → 비밀번호 확인 후 연동
    if (err.data?.error?.code === 'AUTH_013' && err.data?.data?.linkToken) {
      linkData.value = err.data.data
      status.value = 'link'
      showLinkModal.value = true
      return
    }

    handleError('/login', err.data?.error?.message)
  }
})
</script>

<template>
  <div class="social-callback">
    <div class="social-callback__inner">
      <p v-if="status === 'loading'" class="social-callback__message">
        {{ loginData.social.callback.loading }}
      </p>
      <p v-else-if="status === 'error'" class="social-callback__message social-callback__message--error">
        {{ errorMessage }}
      </p>
    </div>

    <!-- 계정 연동 모달 -->
    <BaseModal
      v-model="showLinkModal"
      :title="loginData.social.linkModal.title"
      size="small"
      :close-on-backdrop="false"
      :close-on-esc="false"
      :show-close="false"
    >
      <p class="social-callback__link-message">{{ loginData.social.linkModal.message }}</p>
      <p v-if="linkData" class="social-callback__link-email">{{ linkData.email }}</p>

      <BaseInput
        v-model="linkPassword"
        type="password"
        :label="loginData.social.linkModal.passwordLabel"
        :placeholder="loginData.social.linkModal.passwordPlaceholder"
        :required="true"
        autocomplete="current-password"
        @keyup.enter="handleLinkConfirm"
      />

      <p v-if="linkError" class="social-callback__link-error">{{ linkError }}</p>

      <template #footer>
        <BaseButton
          type="button"
          variant="bg"
          color="light"
          size="big"
          @click="handleLinkCancel"
        >
          {{ loginData.social.linkModal.cancel }}
        </BaseButton>
        <BaseButton
          type="button"
          variant="bg"
          color="black"
          size="big"
          :disabled="linkSubmitting || !linkPassword"
          @click="handleLinkConfirm"
        >
          {{ loginData.social.linkModal.confirm }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
