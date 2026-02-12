<script setup>
import mypageData from '~/data/mypage.json'
import { formatPhoneNumber } from '~/utils/validators'

const profileData = mypageData.pages.profile
const { get, post, patch, del } = useApi()
const authStore = useAuthStore()
// const { redirectToNaverLink } = useSocialAuth()
const { openPostcode } = usePostcode()
const router = useRouter()

const isLoading = ref(true)

const form = reactive({
  id: '',
  name: '',
  phone: '',
  postalCode: '',
  address1: '',
  address2: '',
  marketingAgreed: false,
  gender: 'MALE',
  birth: { year: '', month: '', day: '' },
  joinPath: ''
})

// 휴대폰 유효성 검사 에러
const phoneError = ref('')

// 비밀번호 변경 모달
const showPasswordModal = ref(false)
const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
})

// 소셜 유저 여부
const isSocialUser = ref(false)

// 네이버 연동 모달 - 주석처리
// const showNaverLinkModal = ref(false)
// const naverLinkPassword = ref('')

// const openNaverLinkModal = () => {
//   naverLinkPassword.value = ''
//   showNaverLinkModal.value = true
// }

// const handleNaverLink = () => {
//   if (!naverLinkPassword.value) return
//   showNaverLinkModal.value = false
//   redirectToNaverLink(form.id, naverLinkPassword.value)
// }

// 회원탈퇴 모달
const showWithdrawModal = ref(false)

// 유저 정보로 폼 초기화 (authStore.user 사용)
const initFormFromUser = (user) => {
  if (!user) return

  form.id = user.email || ''
  form.name = user.name || ''
  form.gender = user.gender || 'MALE'

  // 소셜 유저 판단
  isSocialUser.value = !!user.provider && user.provider !== "LOCAL"

  // phone: "01012345678" → 하이픈 포맷으로 변환
  if (user.phone) {
    form.phone = formatPhoneNumber(user.phone)
  }

  // birthDate: "1990-01-15" → { year, month, day }
  if (user.birthDate) {
    const parts = user.birthDate.split('-')
    if (parts.length === 3) {
      form.birth.year = parts[0]
      form.birth.month = parts[1]
      form.birth.day = parts[2]
    }
  }

  // 주소 (defaultAddress 객체에서 가져옴)
  if (user.defaultAddress) {
    form.postalCode = user.defaultAddress.postalCode || ''
    form.address1 = user.defaultAddress.address1 || ''
    form.address2 = user.defaultAddress.address2 || ''
  }

  // 마케팅 동의 (userAgreements에서 policyId 3번 찾기)
  if (user.userAgreements && Array.isArray(user.userAgreements)) {
    const marketingAgreement = user.userAgreements.find(a => a.policyId === 3)
    form.marketingAgreed = marketingAgreement?.isAgreed || false
  }
}

// 유저 정보 불러오기 (SSR에서 가져온 데이터 사용)
const fetchUserInfo = () => {
  isLoading.value = true
  initFormFromUser(authStore.user)
  isLoading.value = false
}

onMounted(() => {
  fetchUserInfo()
})

// 휴대폰 입력 핸들러
const handlePhoneInput = (value) => {
  form.phone = formatPhoneNumber(value)
  validatePhone()
}

// 휴대폰 유효성 검사
const validatePhone = () => {
  const numbers = form.phone.replace(/[^0-9]/g, '')

  if (!numbers) {
    phoneError.value = ''
    return true
  }

  // 한국 휴대폰 번호 패턴: 010, 011, 016, 017, 018, 019로 시작하는 10~11자리
  const phoneRegex = /^01[0-9]{8,9}$/

  if (!phoneRegex.test(numbers)) {
    phoneError.value = '올바른 휴대폰 번호를 입력해주세요.'
    return false
  }

  phoneError.value = ''
  return true
}

// 휴대폰 번호에서 하이픈 제거 (API 전송용)
const getPhone = () => {
  return form.phone.replace(/[^0-9]/g, '')
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 100 }, (_, i) => {
  const y = String(currentYear - i)
  return { value: y, label: y }
})
const monthOptions = Array.from({ length: 12 }, (_, i) => {
  const m = String(i + 1).padStart(2, '0')
  return { value: m, label: m }
})
const dayOptions = Array.from({ length: 31 }, (_, i) => {
  const d = String(i + 1).padStart(2, '0')
  return { value: d, label: d }
})

// 우편번호 검색
const searchZipcode = async () => {
  const result = await openPostcode()
  form.postalCode = result.zonecode
  form.address1 = result.address
}

// birthDate 조합 (YYYY-MM-DD)
const getBirthDate = () => {
  if (!form.birth.year || !form.birth.month || !form.birth.day) return ''
  const month = form.birth.month.toString().padStart(2, '0')
  const day = form.birth.day.toString().padStart(2, '0')
  return `${form.birth.year}-${month}-${day}`
}

const handleCancel = () => {
  phoneError.value = ''
  fetchUserInfo()
}

const handleSubmit = async () => {
  // 휴대폰 유효성 검사
  if (!validatePhone()) {
    return
  }

  try {
    const phone = getPhone()
    const birthDate = getBirthDate()

    const payload = {
      name: form.name,
      phone: phone || undefined,
      birthDate: birthDate || undefined,
      postalCode: form.postalCode || undefined,
      address1: form.address1 || undefined,
      address2: form.address2 || undefined,
      agreements: [
        { policyId: 3, agreed: form.marketingAgreed }
      ]
    }

    // 빈 값(undefined) 제거
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key]
      }
    })

    const res = await patch('/users/me', payload)

    if (res.success) {
      authStore.fetchUser()
      alert(profileData.messages.updateSuccess)
    }
  } catch (error) {
    console.error('Profile update error:', error)
    console.error('Error response:', error.data)
    alert(error.data?.message || profileData.messages.updateError)
  }
}

// 비밀번호 변경 모달
const openPasswordModal = () => {
  passwordForm.current = ''
  passwordForm.new = ''
  passwordForm.confirm = ''
  showPasswordModal.value = true
}

const handlePasswordSubmit = async () => {
  if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
    alert(profileData.passwordModal.messages.required)
    return
  }

  if (passwordForm.new !== passwordForm.confirm) {
    alert(profileData.passwordModal.messages.mismatch)
    return
  }

  try {
    const res = await patch('/users/me/password', {
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
      newPasswordConfirm: passwordForm.confirm
    })

    if (res.success) {
      alert(profileData.passwordModal.messages.success)
      showPasswordModal.value = false
    }
  } catch (error) {
    alert(error.data?.message || profileData.passwordModal.messages.error)
  }
}

// 회원탈퇴
const openWithdrawModal = () => {
  showWithdrawModal.value = true
}

const handleWithdraw = async () => {
  try {
    const res = await del('/users/me')

    if (res.success) {
      alert(profileData.withdrawModal.messages.success)
      showWithdrawModal.value = false
      authStore.logout()
      router.push('/')
    }
  } catch (error) {
    alert(error.data?.message || profileData.withdrawModal.messages.error)
  }
}
</script>

<template>
  <div>
    <form v-if="!isLoading" class="mypage-profile-edit" @submit.prevent="handleSubmit">
    <!-- 섹션 1: 회원정보 수정 -->
    <section class="mypage-profile-edit__section">
      <header class="mypage-profile-edit__section-header">
        <h2 class="mypage-profile-edit__title">{{ profileData.sections.info.title }}</h2>
        <p class="mypage-profile-edit__required-note">{{ profileData.sections.info.requiredNote }}</p>
      </header>

      <div class="mypage-profile-edit__section-body">
        <!-- 아이디 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.email.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <BaseInput v-model="form.id" readonly />
          </div>
        </div>

        <!-- 비밀번호 변경 버튼 (소셜 유저는 숨김) -->
        <div v-if="!isSocialUser" class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.password.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <div class="mypage-profile-edit__password-btn">
              <BaseButton
                type="button"
                :label="profileData.fields.password.button"
                variant="bg"
                color="black"
                size="small"
                @click="openPasswordModal"
              />
            </div>
          </div>
        </div>

        <!-- 네이버 계정 연동 - 주석처리
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.naverLink.button }}</p>
          <div class="mypage-profile-edit__field">
            <div class="mypage-profile-edit__password-btn">
              <BaseButton
                type="button"
                :label="profileData.naverLink.button"
                variant="bg"
                color="green"
                size="small"
                @click="openNaverLinkModal"
              />
            </div>
          </div>
        </div>
        -->

        <!-- 이름 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.name.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <BaseInput v-model="form.name" readonly />
          </div>
        </div>

        <!-- 일반전화 (사용 안함) -->
        <!-- <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">일반전화<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <div class="mypage-profile-edit__triple">
              <BaseSelect v-model="form.tel.area" :options="[{value:'02',label:'02'},{value:'031',label:'031'}]" />
              <span class="mypage-profile-edit__dash" aria-hidden="true" />
              <BaseInput v-model="form.tel.mid" />
              <span class="mypage-profile-edit__dash" aria-hidden="true" />
              <BaseInput v-model="form.tel.last" />
            </div>
          </div>
        </div> -->

        <!-- 휴대전화 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.phone.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <BaseInput
              :model-value="form.phone"
              placeholder="010-0000-0000"
              maxlength="13"
              :error="phoneError"
              @update:model-value="handlePhoneInput"
            />
          </div>
        </div>

        <!-- 주소 -->
        <div class="mypage-profile-edit__row mypage-profile-edit__row--address">
          <p class="mypage-profile-edit__label">{{ profileData.fields.address.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <div class="mypage-profile-edit__address">
              <div class="mypage-profile-edit__address-top">
                <div class="mypage-profile-edit__zipcode">
                  <BaseInput v-model="form.postalCode" :placeholder="profileData.fields.address.placeholder" readonly />
                </div>
                <div class="mypage-profile-edit__zipcode-btn">
                  <BaseButton
                    type="button"
                    :label="profileData.fields.address.searchButton"
                    variant="bg"
                    color="green"
                    size="small"
                    @click="searchZipcode"
                  />
                </div>
              </div>
              <BaseInput v-model="form.address1" readonly />
              <BaseInput v-model="form.address2" />
            </div>
          </div>
        </div>

        <!-- 마케팅 동의 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label mypage-profile-edit__label--multiline">
            {{ profileData.fields.marketing.label }}
          </p>
          <div class="mypage-profile-edit__field">
            <div class="mypage-profile-edit__checks">
              <BaseRadio
                :model-value="form.marketingAgreed ? 'agree' : 'disagree'"
                value="agree"
                name="marketing"
                :label="profileData.fields.marketing.options.agree"
                @update:model-value="form.marketingAgreed = true"
              />
              <BaseRadio
                :model-value="form.marketingAgreed ? 'agree' : 'disagree'"
                value="disagree"
                name="marketing"
                :label="profileData.fields.marketing.options.disagree"
                @update:model-value="form.marketingAgreed = false"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 섹션 2: 회원정보 -->
    <section class="mypage-profile-edit__section">
      <header class="mypage-profile-edit__section-header">
        <h2 class="mypage-profile-edit__title">{{ profileData.sections.additional.title }}</h2>
        <p class="mypage-profile-edit__required-note">{{ profileData.sections.additional.requiredNote }}</p>
      </header>

      <div class="mypage-profile-edit__section-body">
        <!-- 성별 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.gender.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <BaseRadioGroup
              v-model="form.gender"
              name="gender"
              :options="[
                { value: 'MALE', label: profileData.fields.gender.options.male },
                { value: 'FEMALE', label: profileData.fields.gender.options.female }
              ]"
              disabled
            />
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.birth.label }}<span class="mypage-profile-edit__req">*</span></p>
          <div class="mypage-profile-edit__field">
            <div class="mypage-profile-edit__triple">
              <BaseSelect v-model="form.birth.year" :options="yearOptions" variant="box" />
              <span class="mypage-profile-edit__dash" aria-hidden="true" />
              <BaseSelect v-model="form.birth.month" :options="monthOptions" variant="box" />
              <span class="mypage-profile-edit__dash" aria-hidden="true" />
              <BaseSelect v-model="form.birth.day" :options="dayOptions" variant="box" />
            </div>
          </div>
        </div>

        <!-- 가입경로 -->
        <div class="mypage-profile-edit__row">
          <p class="mypage-profile-edit__label">{{ profileData.fields.joinPath.label }}</p>
          <div class="mypage-profile-edit__field">
            <BaseInput v-model="form.joinPath" readonly />
          </div>
        </div>
      </div>
    </section>

    <!-- 하단 버튼 -->
    <div class="mypage-profile-edit__bottom">
      <BaseButton :label="profileData.buttons.withdraw" variant="line" color="black" size="small" type="button" @click="openWithdrawModal" />

      <div class="mypage-profile-edit__bottom-actions">
        <BaseButton :label="profileData.buttons.cancel" variant="bg" color="light" size="small" @click="handleCancel" />
        <BaseButton :label="profileData.buttons.submit" type="submit" variant="bg" color="black" size="small" />
      </div>
    </div>
  </form>

  <!-- 비밀번호 변경 모달 -->
  <BaseModal v-model="showPasswordModal" :title="profileData.passwordModal.title" width="400px" class="password-modal">
    <div class="password-modal-form">
      <div class="password-modal-form__row">
        <label class="password-modal-form__label">{{ profileData.passwordModal.fields.current.label }}</label>
        <BaseInput
          v-model="passwordForm.current"
          type="password"
          :placeholder="profileData.passwordModal.fields.current.placeholder"
        />
      </div>
      <div class="password-modal-form__row">
        <label class="password-modal-form__label">{{ profileData.passwordModal.fields.new.label }}</label>
        <BaseInput
          v-model="passwordForm.new"
          type="password"
          :placeholder="profileData.passwordModal.fields.new.placeholder"
        />
      </div>
      <div class="password-modal-form__row">
        <label class="password-modal-form__label">{{ profileData.passwordModal.fields.confirm.label }}</label>
        <BaseInput
          v-model="passwordForm.confirm"
          type="password"
          :placeholder="profileData.passwordModal.fields.confirm.placeholder"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton
        :label="profileData.passwordModal.buttons.submit"
        variant="bg"
        color="green"
        size="small"
        @click="handlePasswordSubmit"
      />
      <BaseButton
        :label="profileData.passwordModal.buttons.cancel"
        variant="bg"
        color="light"
        size="small"
        @click="showPasswordModal = false"
      />
    </template>
  </BaseModal>

  <!-- 회원탈퇴 모달 -->
  <BaseModal v-model="showWithdrawModal" :title="profileData.withdrawModal.title" width="400px" class="withdraw-modal">
    <div class="withdraw-modal-content">
      <p>{{ profileData.withdrawModal.message1 }}</p>
      <p>{{ profileData.withdrawModal.message2 }}</p>
    </div>

    <template #footer>
      <BaseButton
        :label="profileData.withdrawModal.buttons.submit"
        variant="bg"
        color="black"
        size="small"
        @click="handleWithdraw"
      />
      <BaseButton
        :label="profileData.withdrawModal.buttons.cancel"
        variant="bg"
        color="light"
        size="small"
        @click="showWithdrawModal = false"
      />
    </template>
  </BaseModal>
  <!-- 네이버 연동 비밀번호 확인 모달 - 주석처리
  <BaseModal v-model="showNaverLinkModal" :title="profileData.naverLink.modalTitle" width="400px">
    <div class="password-modal-form">
      <p>{{ profileData.naverLink.modalMessage }}</p>
      <div class="password-modal-form__row">
        <label class="password-modal-form__label">{{ profileData.naverLink.passwordLabel }}</label>
        <BaseInput
          v-model="naverLinkPassword"
          type="password"
          :placeholder="profileData.naverLink.passwordPlaceholder"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton
        :label="profileData.naverLink.confirm"
        variant="bg"
        color="green"
        size="small"
        @click="handleNaverLink"
      />
      <BaseButton
        :label="profileData.naverLink.cancel"
        variant="bg"
        color="light"
        size="small"
        @click="showNaverLinkModal = false"
      />
    </template>
  </BaseModal>
  -->
  </div>
</template>
