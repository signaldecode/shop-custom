<script setup>
import mainData from '~/data/main.json'
import signupData from '~/data/signup.json'

useHead({ title: signupData.index.seo.title })
useSeoMeta({
  title: signupData.index.seo.title,
  description: signupData.index.seo.description
})

const router = useRouter()

const handleKakao = () => {
  alert(signupData.index.messages.kakaoPreparing)
}

const handleNaver = () => {
  alert(signupData.index.messages.naverPreparing)
}

const handleGeneral = () => {
  router.push('/signup/terms')
}
</script>

<template>
  <div class="page-signup">
    <main class="signup-page">
      <div class="signup-page__inner layout-480">
        <div class="signup-page__copy">
          <h1 class="signup-page__title">{{ signupData.index.title }}</h1>
          <p class="signup-page__subtitle">{{ signupData.index.subtitle }}</p>
        </div>

        <div class="signup-actions">
          <button
            type="button"
            class="signup-actions__button signup-actions__button--kakao"
            @click="handleKakao"
          >
            <span class="signup-actions__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path
                  d="M12 3C6.477 3 2 6.49 2 10.793c0 2.74 1.82 5.15 4.57 6.52l-.63 3.48a.6.6 0 0 0 .87.64l4.03-2.13c.38.04.77.06 1.17.06 5.523 0 10-3.49 10-7.793C22 6.49 17.523 3 12 3Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            {{ signupData.index.buttons.kakao }}
          </button>

          <button
            type="button"
            class="signup-actions__button signup-actions__button--naver"
            @click="handleNaver"
          >
            <span class="signup-actions__icon signup-actions__icon--naver" aria-hidden="true">N</span>
            {{ signupData.index.buttons.naver }}
          </button>

          <button
            type="button"
            class="signup-actions__button signup-actions__button--general"
            @click="handleGeneral"
          >
            {{ signupData.index.buttons.general }}
          </button>
        </div>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
