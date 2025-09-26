import { defineStore } from 'pinia'
import Api from '@/api/index.js'

export const useAuthStore = defineStore('auth', {
  // ==========================================
  // STATE - Data yang disimpan
  // ==========================================
  state: () => ({
    user: null,           // Data user yang login
    token: localStorage.getItem('auth_token') || null,  // Token dari localStorage
    isAuthenticated: false, // Status login
    loading: false,        // Loading state untuk UX
    isInitializing: true,  // Loading state untuk inisialisasi app
  }),

  // ==========================================
  // GETTERS - Computed properties
  // ==========================================
  getters: {
    // Cek apakah user sudah login
    isLoggedIn: (state) => {
      return state.token !== null && state.user !== null
    },

    // Get user name
    userName: (state) => {
      return state.user ? state.user.name : null
    },

    // Get user email
    userEmail: (state) => {
      return state.user ? state.user.email : null
    }
  },

  // ==========================================
  // ACTIONS - Functions/methods
  // ==========================================
  actions: {

    /**
     * LOGIN - Masuk ke aplikasi
     */
    async login(credentials) {
      try {
        this.loading = true

        const response = await Api.post('/api/login', credentials)

        if (response.data.success) {
          // Simpan token dan user data
          this.token = response.data.data.token
          this.user = response.data.data.user
          this.isAuthenticated = true

          // Simpan token ke localStorage
          localStorage.setItem('auth_token', this.token)

          // Set default header untuk request selanjutnya
          Api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

          return { success: true, message: response.data.message }
        }
      } catch (error) {
        console.error('Login error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Login gagal'
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * REGISTER - Daftar user baru
     */
    async register(userData) {
      try {
        this.loading = true

        const response = await Api.post('/api/register', userData)

        if (response.data.success) {
          // Otomatis login setelah register
          this.token = response.data.data.token
          this.user = response.data.data.user
          this.isAuthenticated = true

          // Simpan token ke localStorage
          localStorage.setItem('auth_token', this.token)

          // Set default header
          Api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

          return { success: true, message: response.data.message }
        }
      } catch (error) {
        console.error('Register error:', error)
        return {
          success: false,
          message: error.response?.data?.message || 'Registrasi gagal',
          errors: error.response?.data?.errors || {}
        }
      } finally {
        this.loading = false
      }
    },

    /**
     * FETCH USER - Ambil data user dari server
     */
    async fetchUser() {
      try {
        if (!this.token) return false

        // Set header sebelum request
        Api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        const response = await Api.get('/api/me')

        if (response.data.success) {
          this.user = response.data.data.user
          this.isAuthenticated = true
          return true
        }
      } catch (error) {
        console.error('Fetch user error:', error)
        // Jika token invalid, logout otomatis
        this.logout()
        return false
      }
    },

    /**
     * LOGOUT - Keluar dari aplikasi
     */
    async logout() {
      try {
        // Jika ada token, beritahu server untuk hapus token
        if (this.token) {
          await Api.post('/api/logout')
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // Reset state
        this.user = null
        this.token = null
        this.isAuthenticated = false

        // Hapus dari localStorage
        localStorage.removeItem('auth_token')

        // Hapus header Authorization
        delete Api.defaults.headers.common['Authorization']
      }
    },

    /**
     * INIT AUTH - Inisialisasi saat aplikasi dimuat
     */
    async initAuth() {
      try {
        this.isInitializing = true

        // Cek apakah ada token di localStorage
        const token = localStorage.getItem('auth_token')

        if (token) {
          this.token = token

          // Set Authorization header
          Api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          // Coba ambil data user
          const success = await this.fetchUser()

          if (!success) {
            // Jika gagal, bersihkan token invalid
            this.token = null
            localStorage.removeItem('auth_token')
            delete Api.defaults.headers.common['Authorization']
          }
        }
      } catch (error) {
        console.error('Init auth error:', error)
        // Reset state jika terjadi error
        this.user = null
        this.token = null
        this.isAuthenticated = false
        localStorage.removeItem('auth_token')
        delete Api.defaults.headers.common['Authorization']
      } finally {
        this.isInitializing = false
      }
    }
  }
})