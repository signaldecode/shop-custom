<script setup>
import mainData from '~/data/main.json'
import signupData from '~/data/signup.json'

useHead({ title: signupData.done.seo.title })
useSeoMeta({
  title: signupData.done.seo.title,
  description: signupData.done.seo.description
})

const router = useRouter()

const currentStepIndex = 2

const goEdit = () => {
  // TODO: 마이페이지/회원정보 수정 페이지 연결
  router.push('/support')
}

const goShop = () => {
  router.push('/')
}
</script>

<template>
  <div class="page-signup-done">
    <main class="signup-done-page">
      <div class="signup-done-page__inner">
        <div class="signup-done-page__header">
          <h1 class="signup-done-page__title">{{ signupData.common.pageTitle }}</h1>

          <ol class="signup-steps" :aria-label="signupData.common.stepsAriaLabel">
            <li
              v-for="(s, idx) in signupData.common.steps"
              :key="s.value"
              class="signup-steps__item"
              :class="{
                'signup-steps__item--done': idx <= currentStepIndex,
                'signup-steps__item--active': idx === currentStepIndex
              }"
            >
              <span
                class="signup-steps__circle"
                :class="{
                  'signup-steps__circle--done': idx <= currentStepIndex,
                  'signup-steps__circle--active': idx === currentStepIndex
                }"
                aria-hidden="true"
              />
              <span class="signup-steps__label">{{ s.label }}</span>
            </li>
          </ol>
        </div>

        <div class="signup-done-content">
          <img
            :src="signupData.done.image.src"
            :alt="signupData.done.image.alt"
            class="signup-done-content__image"
            aria-hidden="true"
          />

          <div class="signup-done-content__copy">
            <p class="signup-done-content__headline">{{ signupData.done.headline }}</p>
            <p class="signup-done-content__sub">{{ signupData.done.sub }}</p>
          </div>

          <div class="signup-done-actions">
            <!-- <BaseButton
              type="button"
              variant="bg"
              color="light"
              size="big"
              class="signup-done-actions__btn"
              @click="goEdit"
            >
              {{ signupData.done.buttons.edit }}
            </BaseButton> -->
            <BaseButton
              type="button"
              variant="bg"
              color="black"
              size="big"
              class="signup-done-actions__btn"
              @click="goShop"
            >
              {{ signupData.done.buttons.shop }}
            </BaseButton>
          </div>
        </div>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
