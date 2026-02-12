<script setup>
import findData from "~/data/find.json";

useHead({
  title: findData.findPassword.title,
});
useSeoMeta({
  title: findData.seo.findPassword.title,
  description: findData.seo.findPassword.description,
});
const { post, patch } = useApi();
const router = useRouter();

const pageData = findData.findPassword;

const form = reactive({
  email: "",
  code: "",
  newPassword: "",
  newPasswordConfirm: "",
});

// 1: 이메일 입력, 2: 코드 + 비번 입력, 3: 완료
const step = ref(1);
const codeSent = ref(false);
const handleSendCode = async () => {
  // 1. 이메일 검증
  if (!form.email) {
    alert(pageData.messages.emailRequired);
    return;
  }

  try {
    const res = await post("/auth/password-reset/send", {
      email: form.email,
    });

    if (res.success) {
      codeSent.value = true;
      step.value = 2;
      alert(pageData.messages.codeSent);
    } else {
      alert(pageData.messages.codeSendFailed);
    }
  } catch (error) {
    alert(error.data?.error?.message || pageData.messages.codeSendFailed);
  }
};

const handleResetPassword = async () => {
  // 유효성 검사
  if (!form.code) {
    alert(pageData.messages.codeRequired);
    return;
  }

  if (!form.newPassword) {
    alert(pageData.messages.passwordRequired);
    return;
  }
  if (!form.newPasswordConfirm) {
    alert(pageData.messages.passwordConfirmRequired);
    return;
  }
  if (form.newPassword !== form.newPasswordConfirm) {
    alert(pageData.messages.passwordMismatch);
    return;
  }
  try {
    const res = await patch("/auth/password-reset", {
      email: form.email,
      code: form.code,
      newPassword: form.newPassword,
      newPasswordConfirm: form.newPasswordConfirm,
    });

    if (res.success) {
      step.value = 3; // 완료 화면
    } else {
      alert(res.error?.message || pageData.messages.resetFailed);
    }
  } catch (error) {
    alert(error.data?.error?.message || pageData.messages.resetFailed);
  }
};
const goLogin = () => {
  router.push("/login");
};
</script>
<template>
  <div class="find">
    <div class="find__inner">
      <h1 class="find__title">{{ pageData.title }}</h1>

      <!-- Step 1, 2: 폼 -->
      <form v-if="step !== 3" class="find__form" @submit.prevent>
        <!-- 이메일 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.email.label }}</label>
          <BaseInput
            v-model="form.email"
            type="email"
            :placeholder="pageData.form.email.placeholder"
            :disabled="codeSent"
          />
        </div>

        <!-- 발송 버튼 -->
        <div class="find__button">
          <BaseButton
            type="button"
            :label="
              codeSent ? pageData.buttons.resendCode : pageData.buttons.sendCode
            "
            variant="bg"
            color="green"
            size="big"
            full
            @click="handleSendCode"
          />
        </div>

        <!-- Step 2에서만 표시되는 필드들 -->
        <template v-if="step === 2">
          <!-- 인증번호 -->
          <div class="find__field">
            <label class="find__label">{{ pageData.form.code.label }}</label>
            <BaseInput
              v-model="form.code"
              :placeholder="pageData.form.code.placeholder"
            />
          </div>

          <!-- 새 비밀번호 -->
          <div class="find__field">
            <label class="find__label">{{
              pageData.form.newPassword.label
            }}</label>
            <BaseInput
              v-model="form.newPassword"
              type="password"
              :placeholder="pageData.form.newPassword.placeholder"
            />
          </div>

          <!-- 새 비밀번호 확인 -->
          <div class="find__field">
            <label class="find__label">{{
              pageData.form.newPasswordConfirm.label
            }}</label>
            <BaseInput
              v-model="form.newPasswordConfirm"
              type="password"
              :placeholder="pageData.form.newPasswordConfirm.placeholder"
            />
          </div>

          <!-- 변경 버튼 -->
          <div class="find__button">
            <BaseButton
              type="button"
              :label="pageData.buttons.resetPassword"
              variant="bg"
              color="green"
              size="big"
              full
              @click="handleResetPassword"
            />
          </div>
        </template>
        <!-- 인증번호, 새 비밀번호, 비밀번호 확인, 변경 버튼 -->
      </form>

      <!-- Step 3: 완료 화면 -->
      <div v-else class="find__result">
        <h2 class="find__result-title">{{ pageData.result.title }}</h2>
        <p class="find__result-found">{{ pageData.result.success }}</p>
        <BaseButton
          :label="pageData.buttons.login"
          variant="bg"
          color="green"
          size="big"
          @click="goLogin"
        />
      </div>
    </div>
  </div>
</template>
