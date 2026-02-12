<script setup>
import mainData from "~/data/main.json";
import loginData from "~/data/login.json";

useHead({ title: loginData.seo.title });
useSeoMeta({
  title: loginData.seo.title,
  description: loginData.seo.description,
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { mergeCart } = useCart();

const tab = ref("member"); // member | guest

// redirect 파라미터 (로그인 후 이동할 페이지)
const redirectPath = computed(() => route.query.redirect || "/");

// 이미 로그인 상태면 리다이렉트
onMounted(() => {
  if (authStore.isLoggedIn) {
    router.replace(redirectPath.value);
  }
});

// 회원 로그인 폼
const form = reactive({
  id: "",
  password: "",
  rememberId: false,
});

const { post } = useApi();
const { redirectToNaver, redirectToGoogle, setRedirectPath } = useSocialAuth();

const handleSubmit = async () => {
  try {
    const result = await post("/auth/login", {
      email: form.id,
      password: form.password,
    });

    if (result.success) {
      await authStore.login();

      // 비회원 장바구니를 회원 장바구니로 머지
      try {
        await mergeCart();
      } catch (e) {
        console.warn("Failed to merge cart:", e);
      }

      // redirect 파라미터가 있으면 해당 페이지로, 없으면 홈으로
      router.push(redirectPath.value);
    }
  } catch (error) {
    alert(error.data?.message || "로그인에 실패했습니다.");
  }
};

const handleNaverLogin = async () => {
  setRedirectPath(redirectPath.value);
  await redirectToNaver();
};

const handleGoogleLogin = async () => {
  setRedirectPath(redirectPath.value);
  await redirectToGoogle();
};

const handleKakaoLogin = () => {
  alert(loginData.messages.preparing);
};

// 비회원 주문조회 폼
const { guestOrderLookup, transformOrderDetail } = useOrder();

const guestForm = reactive({
  orderNumber: "",
  password: "",
});

const handleGuestLookup = async () => {
  try {
    const data = await guestOrderLookup(
      guestForm.orderNumber,
      guestForm.password,
    );
    const orderDetail = transformOrderDetail(data);
    // sessionStorage에 저장 후 이동
    sessionStorage.setItem("guestOrderDetail", JSON.stringify(orderDetail));
    router.push(`/guest-order/${data.orderNumber || guestForm.orderNumber}`);
  } catch (err) {
    alert(err.data?.message || loginData.guestForm.errorMessage);
  }
};
</script>

<template>
  <div class="page-login">
    <main class="login-page">
      <div class="login-page__inner layout-480">
        <h1 class="login-page__title">{{ loginData.page.title }}</h1>

        <div
          class="login-tabs"
          role="tablist"
          :aria-label="loginData.page.tabsAriaLabel"
        >
          <button
            v-for="t in loginData.tabs"
            :key="t.value"
            type="button"
            class="login-tabs__tab"
            :class="{ 'login-tabs__tab--active': tab === t.value }"
            role="tab"
            :aria-selected="tab === t.value"
            @click="tab = t.value"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- 회원 로그인 폼 -->
        <form
          v-if="tab === 'member'"
          class="login-form"
          @submit.prevent="handleSubmit"
        >
          <div class="login-form__fields">
            <BaseInput
              v-model="form.id"
              :label="loginData.form.id.label"
              :placeholder="loginData.form.id.placeholder"
              :required="true"
              autocomplete="username"
            />
            <BaseInput
              v-model="form.password"
              type="password"
              :label="loginData.form.password.label"
              :placeholder="loginData.form.password.placeholder"
              :required="true"
              autocomplete="current-password"
            />
          </div>

          <div class="login-form__options">
            <BaseCheckbox
              v-model="form.rememberId"
              :label="loginData.form.rememberId.label"
              size="small"
              variant="line"
            />

            <div class="login-form__links">
              <NuxtLink to="/find/id" class="login-form__link">{{
                loginData.links.findId
              }}</NuxtLink>
              <span class="login-form__divider" aria-hidden="true" />
              <NuxtLink to="/find/password" class="login-form__link">{{
                loginData.links.findPassword
              }}</NuxtLink>
            </div>
          </div>

          <div class="login-form__actions">
            <BaseButton
              type="submit"
              variant="bg"
              color="black"
              size="big"
              :full="true"
            >
              {{ loginData.buttons.login }}
            </BaseButton>

            <p class="login-form__signup">
              <span class="login-form__signup-text">{{
                loginData.signup.text
              }}</span>
              <NuxtLink to="/signup" class="login-form__signup-link">{{
                loginData.signup.link
              }}</NuxtLink>
            </p>
          </div>
<!--
          <div class="login-social" :aria-label="loginData.social.ariaLabel">
            <button
              type="button"
              class="login-social__button login-social__button--naver"
              :aria-label="loginData.social.naver.ariaLabel"
              @click="handleNaverLogin"
            >
              {{ loginData.social.naver.text }}
            </button>
            <button
              type="button"
              class="login-social__button login-social__button--google"
              :aria-label="loginData.social.google.ariaLabel"
              @click="handleGoogleLogin"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09a6.97 6.97 0 0 1 0-4.17V7.07H2.18a11.01 11.01 0 0 0 0 9.86l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>
            <button
              type="button"
              class="login-social__button login-social__button--kakao"
              :aria-label="loginData.social.kakao.ariaLabel"
              @click="handleKakaoLogin"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 3C6.477 3 2 6.49 2 10.793c0 2.74 1.82 5.15 4.57 6.52l-.63 3.48a.6.6 0 0 0 .87.64l4.03-2.13c.38.04.77.06 1.17.06 5.523 0 10-3.49 10-7.793C22 6.49 17.523 3 12 3Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div> -->
        </form>

        <!-- 비회원 주문조회 폼 -->
        <form v-else class="login-form" @submit.prevent="handleGuestLookup">
          <div class="login-form__fields">
            <BaseInput
              v-model="guestForm.orderNumber"
              :label="loginData.guestForm.orderNumber.label"
              :placeholder="loginData.guestForm.orderNumber.placeholder"
              :required="true"
            />
            <BaseInput
              v-model="guestForm.password"
              type="password"
              :label="loginData.guestForm.password.label"
              :placeholder="loginData.guestForm.password.placeholder"
              :required="true"
            />
          </div>

          <div class="login-form__actions">
            <BaseButton
              type="submit"
              variant="bg"
              color="black"
              size="big"
              :full="true"
            >
              {{ loginData.guestForm.submit }}
            </BaseButton>
          </div>
        </form>
      </div>
    </main>

    <Footer :data="mainData.footer" />
  </div>
</template>
