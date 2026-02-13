<script setup>
import findData from "~/data/find.json";

useHead({
  title: findData.findPassword.title,
});
useSeoMeta({
  title: findData.seo.findPassword.title,
  description: findData.seo.findPassword.description,
});

const { patch } = useApi();
const router = useRouter();

const pageData = findData.findPassword;

const form = reactive({
  email: "",
  name: "",
  phone: "",
  newPassword: "",
  newPasswordConfirm: "",
});

// 1: 입력, 2: 완료
const step = ref(1);
const pending = ref(false);

// 비밀번호 재설정
const handleResetPassword = async () => {
  // 유효성 검사
  if (!form.email) {
    alert(pageData.messages.emailRequired);
    return;
  }
  if (!form.name) {
    alert(pageData.messages.nameRequired);
    return;
  }
  if (!form.phone) {
    alert(pageData.messages.phoneRequired);
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

  pending.value = true;

  try {
    const res = await patch("/auth/password-reset", {
      email: form.email,
      name: form.name,
      phone: form.phone,
      newPassword: form.newPassword,
      newPasswordConfirm: form.newPasswordConfirm,
    });

    if (res.success) {
      step.value = 2; // 완료 화면
    } else {
      alert(res.error?.message || pageData.messages.resetFailed);
    }
  } catch (error) {
    alert(error.data?.error?.message || pageData.messages.resetFailed);
  } finally {
    pending.value = false;
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

      <!-- Step 1: 폼 -->
      <form v-if="step === 1" class="find__form" @submit.prevent="handleResetPassword">
        <!-- 이메일 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.email.label }}</label>
          <BaseInput
            v-model="form.email"
            type="email"
            :placeholder="pageData.form.email.placeholder"
          />
        </div>

        <!-- 이름 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.name.label }}</label>
          <BaseInput
            v-model="form.name"
            :placeholder="pageData.form.name.placeholder"
          />
        </div>

        <!-- 전화번호 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.phone.label }}</label>
          <BaseInput
            v-model="form.phone"
            type="tel"
            :placeholder="pageData.form.phone.placeholder"
          />
        </div>

        <!-- 새 비밀번호 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.newPassword.label }}</label>
          <BaseInput
            v-model="form.newPassword"
            type="password"
            :placeholder="pageData.form.newPassword.placeholder"
          />
        </div>

        <!-- 새 비밀번호 확인 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.newPasswordConfirm.label }}</label>
          <BaseInput
            v-model="form.newPasswordConfirm"
            type="password"
            :placeholder="pageData.form.newPasswordConfirm.placeholder"
          />
        </div>

        <!-- 변경 버튼 -->
        <div class="find__button">
          <BaseButton
            type="submit"
            :label="pageData.buttons.resetPassword"
            variant="bg"
            color="green"
            size="big"
            full
            :disabled="pending"
          />
        </div>
      </form>

      <!-- Step 2: 완료 화면 -->
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
