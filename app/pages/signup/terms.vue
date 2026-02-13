<script setup>
import signupData from '~/data/signup.json'

useHead({ title: signupData.terms.seo.title })
useSeoMeta({
  title: signupData.terms.seo.title,
  description: signupData.terms.seo.description
})

const router = useRouter()
const signupStore = useSignupStore()
const authStore = useAuthStore()
const { get } = useApi()
const { socialSignupComplete } = useSocialAuth()
const { mergeCart } = useCart()

const currentStepIndex = 0
const isSocial = computed(() => signupStore.isSocialSignup)
const isSubmitting = ref(false)

// 소셜 회원가입 컨텍스트 복원 (새로고침 대비)
onBeforeMount(() => {
  signupStore.restoreSocialAuth()
})

// API에서 가져온 약관 목록
const policies = ref([])
const isLoading = ref(true)

// 약관 동의 상태 (policy id 기반)
const agreements = reactive({})

// 약관 펼침 상태 (policy id 기반)
const open = reactive({})

// 약관 content 로딩/에러 상태
const loadingContent = reactive({})
const contentError = reactive({})

// 전체 동의 computed (getter/setter)
const allAgreement = computed({
  get: () => {
    if (policies.value.length === 0) return false
    return policies.value.every((p) => agreements[p.id])
  },
  set: (val) => {
    policies.value.forEach((policy) => {
      agreements[policy.id] = val
    })
  }
})

// 약관 목록 조회
const fetchPolicies = async () => {
  try {
    const result = await get('/policies/signup')
    if (result.success && result.data) {
      policies.value = result.data
      // 각 약관별 동의 상태 및 펼침 상태 초기화
      policies.value.forEach((policy) => {
        agreements[policy.id] = false
        open[policy.id] = true
      })
      // 펼쳐진 상태로 시작하므로 content 바로 불러오기
      policies.value.forEach((policy) => {
        fetchPolicyContent(policy.id)
      })
    }
  } catch (error) {
    console.error('약관 목록 조회 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 약관 상세 조회 (content lazy loading)
const fetchPolicyContent = async (id) => {
  const policy = policies.value.find((p) => p.id === id)
  if (policy?.content) return

  loadingContent[id] = true
  contentError[id] = false

  try {
    const result = await get(`/policies/${id}`)
    if (result.success && result.data) {
      policy.content = result.data.content
    } else {
      contentError[id] = true
    }
  } catch (error) {
    console.error('약관 상세 조회 실패:', error)
    contentError[id] = true
  } finally {
    loadingContent[id] = false
  }
}

// 약관 토글 핸들러
const handleToggle = async (policy) => {
  open[policy.id] = !open[policy.id]
  if (open[policy.id] && !policy.content) {
    await fetchPolicyContent(policy.id)
  }
}

onMounted(() => {
  fetchPolicies()
})

const handleCancel = () => {
  if (isSocial.value) {
    signupStore.reset()
    router.push('/login')
    return
  }
  router.push('/signup')
}

const handleNext = async () => {
  // 필수 약관 체크 확인
  const requiredPolicies = policies.value.filter((p) => p.isRequired)
  const allRequiredChecked = requiredPolicies.every((p) => agreements[p.id])

  if (!allRequiredChecked) {
    alert(signupData.terms.messages.requiredAlert)
    return
  }

  // API 스펙에 맞게 배열 형태로 변환
  const agreementsArray = policies.value.map((p) => ({
    policyId: p.id,
    agreed: agreements[p.id]
  }))

  // 소셜 회원가입 모드: 약관 동의 → 바로 가입 완료
  if (isSocial.value) {
    isSubmitting.value = true
    try {
      const { tempToken } = signupStore.socialAuth
      const result = await socialSignupComplete(tempToken, agreementsArray)

      if (result.success) {
        await authStore.login()
        signupStore.reset()
        try { await mergeCart() } catch (e) { console.warn('Failed to merge cart:', e) }
        router.replace('/')
      } else {
        alert(signupData.terms.messages.socialSignupFailed)
      }
    } catch (err) {
      alert(err.data?.message || signupData.terms.messages.socialSignupFailed)
    } finally {
      isSubmitting.value = false
    }
    return
  }

  // 일반 회원가입: 다음 단계로
  signupStore.completeTerms(agreementsArray)
  router.push('/signup/info')
}
</script>

<template>
  <div class="page-signup-terms">
    <main class="signup-terms-page">
      <div class="signup-terms-page__inner">
        <div class="signup-terms-page__header">
          <h1 class="signup-terms-page__title">{{ signupData.common.pageTitle }}</h1>

          <ol v-if="!isSocial" class="signup-steps" :aria-label="signupData.common.stepsAriaLabel">
            <li
              v-for="(s, idx) in signupData.common.steps"
              :key="s.value"
              class="signup-steps__item"
              :class="{
                'signup-steps__item--done': idx < currentStepIndex,
                'signup-steps__item--active': idx === currentStepIndex
              }"
            >
              <span
                class="signup-steps__circle"
                :class="{
                  'signup-steps__circle--done': idx < currentStepIndex,
                  'signup-steps__circle--active': idx === currentStepIndex
                }"
                aria-hidden="true"
              />
              <span class="signup-steps__label">{{ s.label }}</span>
            </li>
          </ol>
        </div>

        <section class="signup-terms layout-1000" :aria-label="signupData.terms.sectionAriaLabel">
          <!-- 로딩 중 -->
          <div v-if="isLoading" class="signup-terms__loading">
            약관을 불러오는 중...
          </div>

          <div v-else class="signup-terms__stack">
            <!-- 전체동의 -->
            <div class="signup-terms-card signup-terms-card--all">
              <div class="signup-terms-card__head">
                <BaseCheckbox
                  v-model="allAgreement"
                  :label="signupData.terms.agreements.all.label"
                  variant="line"
                  size="big"
                />
                <IconArrow direction="down" size="md" />
              </div>
            </div>

            <!-- 약관 목록 (API) -->
            <div
              v-for="policy in policies"
              :key="policy.id"
              class="signup-terms-card"
            >
              <button
                type="button"
                class="signup-terms-card__toggle"
                :aria-expanded="open[policy.id]"
                @click="handleToggle(policy)"
              >
                <span @click.stop>
                  <BaseCheckbox
                    v-model="agreements[policy.id]"
                    :label="policy.title"
                    variant="line"
                    size="big"
                  />
                </span>
                <span class="signup-terms-card__required">{{ policy.isRequired ? '[필수]' : '[선택]' }}</span>
                <IconArrow :direction="open[policy.id] ? 'up' : 'down'" size="md" />
              </button>

              <div v-show="open[policy.id]" class="signup-terms-card__body">
                <!-- 로딩 중 -->
                <div v-if="loadingContent[policy.id]" class="signup-terms-card__loading">
                  {{ signupData.terms.messages.contentLoading }}
                </div>
                <!-- 에러 -->
                <div v-else-if="contentError[policy.id]" class="signup-terms-card__error">
                  <span>{{ signupData.terms.messages.contentError }}</span>
                  <BaseButton
                    type="button"
                    variant="bg"
                    color="light"
                    size="small"
                    @click.stop="fetchPolicyContent(policy.id)"
                  >
                    {{ signupData.terms.messages.retry }}
                  </BaseButton>
                </div>
                <!-- 콘텐츠 -->
                <div v-else class="signup-terms-card__text" v-html="policy.content" />
              </div>
            </div>
          </div>

          <div class="signup-terms-actions">
            <BaseButton
              type="button"
              variant="bg"
              color="light"
              size="big"
              class="signup-terms-actions__btn"
              @click="handleCancel"
            >
              {{ signupData.terms.buttons.cancel }}
            </BaseButton>
            <BaseButton
              type="button"
              variant="bg"
              color="black"
              size="big"
              class="signup-terms-actions__btn"
              :disabled="isSubmitting"
              @click="handleNext"
            >
              {{ isSocial ? signupData.terms.buttons.socialComplete : signupData.terms.buttons.next }}
            </BaseButton>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
