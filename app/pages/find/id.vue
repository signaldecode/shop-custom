<script setup>
import findData from "~/data/find.json";

const { post } = useApi();
const router = useRouter();

// SEO

useHead({ title: findData.seo.findId.title });
useSeoMeta({
  title: findData.seo.findId.title,
  description: findData.seo.description,
});

const pageData = findData.findId;

const form = reactive({
  name: "",
  mobilePrefix: "010",
  mobile1: "",
  mobile2: "",
  code: "",
});

const step = ref(1); // 1: 정보 입력, 3: 결과
// const codeSent = ref(false); // 인증번호 방식 주석 처리
const accounts = ref([]);
const notFound = ref(false);

// 휴대폰 번호 합치기
const getPhone = () => {
  return `${form.mobilePrefix}-${form.mobile1}-${form.mobile2}`;
};

// 아이디 찾기 (POST /auth/find-email)
const pending = ref(false);
const handleFindId = async () => {
  if (!form.name) {
    alert(pageData.messages.nameRequired);
    return;
  }
  if (!form.mobile1 || !form.mobile2) {
    alert(pageData.messages.phoneRequired);
    return;
  }

  pending.value = true;

  try {
    const res = await post("/auth/find-email", {
      name: form.name,
      phone: getPhone(),
    });

    if (res.success && res.data?.accounts?.length > 0) {
      accounts.value = res.data.accounts;
      notFound.value = false;
    } else {
      accounts.value = [];
      notFound.value = true;
    }
    step.value = 3;
  } catch (error) {
    accounts.value = [];
    notFound.value = true;
    step.value = 3;
  } finally {
    pending.value = false;
  }
};

// 인증번호 발송 (주석 처리)
// const handleSendCode = async () => {
//   if (!form.name) {
//     alert(pageData.messages.nameRequired);
//     return;
//   }
//   if (!form.mobile1 || !form.mobile2) {
//     alert(pageData.messages.phoneRequired);
//     return;
//   }
//
//   try {
//     const res = await post("/auth/find-email/send", {
//       name: form.name,
//       phone: getPhone(),
//     });
//
//     if (res.success) {
//       codeSent.value = true;
//       step.value = 2;
//       alert(pageData.messages.codeSent);
//       if (res.data.code) {
//         form.code = res.data.code;
//       }
//     } else {
//       alert(pageData.messages.codeSendFailed);
//     }
//   } catch (error) {
//     alert(error.data?.error?.messages || pageData.messages.codeSendFailed);
//   }
// };

// 인증번호 확인 (주석 처리)
// const handleVerify = async () => {
//   if (!form.code) {
//     alert(pageData.messages.codeRequired);
//     return;
//   }
//
//   try {
//     const res = await post("/auth/find-email/verify", {
//       name: form.name,
//       phone: getPhone(),
//       code: form.code,
//     });
//
//     if (res.success && res.data?.accounts?.length > 0) {
//       accounts.value = res.data.accounts;
//       notFound.value = false;
//     } else {
//       accounts.value = [];
//       notFound.value = true;
//     }
//     step.value = 3;
//   } catch (error) {
//     accounts.value = [];
//     notFound.value = true;
//     step.value = 3;
//   }
// };

// 로그인 페이지로
const goLogin = () => {
  router.push("/login");
};
</script>
<template>
  <div class="find">
    <div class="find__inner">
      <h1 class="find__title">{{ pageData.title }}</h1>
      <!-- Step 1: 입력 폼 -->
      <form v-if="step !== 3" class="find__form" @submit.prevent="handleFindId">
        <!-- 이름 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.name.label }}</label>
          <BaseInput
            v-model="form.name"
            :placeholder="pageData.form.name.placeholder"
          />
        </div>

        <!-- 휴대폰 번호 -->
        <div class="find__field">
          <label class="find__label">{{ pageData.form.mobile.label }}</label>
          <div class="find__mobile-row">
            <div class="find__mobile-prefix">
              <BaseSelect
                v-model="form.mobilePrefix"
                :options="pageData.options.mobilePrefix"
                variant="box"
              />
            </div>
            <span class="find__mobile-dash" aria-hidden="true">-</span>
            <div class="find__mobile-input">
              <BaseInput
                v-model="form.mobile1"
                type="tel"
                maxlength="4"
              />
            </div>
            <span class="find__mobile-dash" aria-hidden="true">-</span>
            <div class="find__mobile-input">
              <BaseInput
                v-model="form.mobile2"
                type="tel"
                maxlength="4"
              />
            </div>
          </div>
        </div>

        <!-- 아이디 찾기 버튼 -->
        <div class="find__button">
          <BaseButton
            type="submit"
            :label="pageData.buttons.findId"
            variant="bg"
            color="green"
            size="big"
            full
            :disabled="pending"
          />
        </div>

        <!-- 인증번호 발송 버튼 (주석 처리) -->
        <!-- <div class="find__button">
          <BaseButton
            type="button"
            :label="
              codeSent
                ? pageData.buttons.resendCode
                : pageData.buttons.sendCode
            "
            variant="bg"
            color="green"
            size="big"
            full
            @click="handleSendCode"
          />
        </div> -->

        <!-- 인증번호 (step 2에서만 표시) - 주석 처리 -->
        <!-- <div v-if="step === 2" class="find__field">
          <label class="find__label">{{ pageData.form.code.label }}</label>
          <BaseInput
            v-model="form.code"
            :placeholder="pageData.form.code.placeholder"
          />
        </div> -->

        <!-- 확인 버튼 (step 2에서만 표시) - 주석 처리 -->
        <!-- <div v-if="step === 2" class="find__button">
          <BaseButton
            type="button"
            :label="pageData.buttons.verify"
            variant="bg"
            color="green"
            size="big"
            full
            @click="handleVerify"
          />
        </div> -->
      </form>
      <!-- Step 3: 결과 화면 -->
      <div v-else class="find__result">
        <h2 class="find__result-title">{{ pageData.result.title }}</h2>

        <!-- 계정 목록 -->
        <div v-if="!notFound" class="find__accounts">
          <p class="find__result-found">{{ pageData.result.found }}</p>
          <div
            v-for="(account, index) in accounts"
            :key="index"
            class="find__account-item"
          >
            <p class="find__account-email">{{ account.maskedEmail }}</p>
            <p class="find__account-provider">
              {{ account.providerDisplayName }}
            </p>
          </div>
        </div>

        <!-- 결과 없음 -->
        <p v-else class="find__result-not-found">
          {{ pageData.result.notFound }}
        </p>

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
