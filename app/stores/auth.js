import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoggedIn: false,
    loading: false,
    sessionExpired: false,
    sessionExpiredMessage: ''
  }),

  actions: {
    async login() {
      this.isLoggedIn = true
      if (import.meta.client) {
        localStorage.setItem('isLoggedIn', 'true')
      }
      await this.fetchUser()
    },

    logout() {
      this.user = null
      this.isLoggedIn = false
      this.sessionExpired = false
      this.sessionExpiredMessage = ''
      if (import.meta.client) {
        localStorage.removeItem('isLoggedIn')
      }
    },

    setSessionExpired(message = '') {
      this.sessionExpired = true
      this.sessionExpiredMessage = message
      this.user = null
      this.isLoggedIn = false
      if (import.meta.client) {
        localStorage.removeItem('isLoggedIn')
      }
    },

    async fetchUser(apiGet) {
      try {
        const get = apiGet || useApi().get
        const res = await get('/users/me')
        if (res.success && res.data) {
          this.user = res.data
          this.isLoggedIn = true
        }
      } catch {
        this.user = null
        this.isLoggedIn = false
      }
    },

    async ensureUser(apiGet) {
      if (!this.user) {
        this.loading = true
        await this.fetchUser(apiGet)
        this.loading = false
      }
    }
  }
})
