import { defineStore } from 'pinia'

/**
 * Signup Store
 * 회원가입 단계별 상태 관리
 */
export const useSignupStore = defineStore('signup', {
  state: () => ({
    step: 0, // 0: 시작, 1: 약관완료, 2: 정보입력완료

    // 소셜 회원가입 컨텍스트 (null이면 일반 회원가입)
    socialAuth: null, // { tempToken, provider }

    // 약관 동의 (API 스펙: [{ policyId, agreed }])
    agreements: [],

    // 회원정보 (API 스펙 기준)
    form: {
      email: '',
      password: '',
      passwordConfirm: '',
      name: '',
      phone: '',
      gender: 'MALE',
      birthDate: '',
      postalCode: '',
      address1: '',
      address2: '',
      verificationToken: ''
    }
  }),

  getters: {
    canAccessInfo: (state) => state.step >= 1,
    canAccessDone: (state) => state.step >= 2,
    isSocialSignup: (state) => !!state.socialAuth
  },

  actions: {
    /**
     * 소셜 회원가입 컨텍스트 설정
     */
    setSocialAuth(tempToken, provider) {
      this.socialAuth = { tempToken, provider }
      this.step = 0
      sessionStorage.setItem('social_auth', JSON.stringify({ tempToken, provider }))
    },

    /**
     * 소셜 회원가입 컨텍스트 복원 (새로고침 대비)
     */
    restoreSocialAuth() {
      const saved = sessionStorage.getItem('social_auth')
      if (saved) {
        this.socialAuth = JSON.parse(saved)
      }
    },

    /**
     * 약관 동의 완료
     */
    completeTerms(agreements) {
      this.agreements = [...agreements]
      this.step = 1
    },

    /**
     * 회원정보 저장
     */
    setForm(data) {
      this.form = { ...this.form, ...data }
    },

    /**
     * 회원가입 완료
     */
    completeSignup() {
      this.step = 2
    },

    /**
     * 초기화 (가입 완료 후 또는 처음부터 다시)
     */
    reset() {
      this.step = 0
      this.socialAuth = null
      this.agreements = []
      sessionStorage.removeItem('social_auth')
      this.form = {
        email: '',
        password: '',
        passwordConfirm: '',
        name: '',
        phone: '',
        gender: 'MALE',
        birthDate: '',
        postalCode: '',
        address1: '',
        address2: '',
        verificationToken: ''
      }
    }
  }
})
