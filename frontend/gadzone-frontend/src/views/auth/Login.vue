<template>
  <div class="auth-container">
    <div class="auth-card">
      <!-- Left Side - Branding -->
      <div class="auth-left">
      <div class="branding-content">
        <div class="brand-logo">
          <h1>GADZONE</h1>
        </div>
        <div class="brand-description">
          <h3>Temukan Gadget Impian</h3>
          <p>Dapatkan informasi lengkap tentang gadget terbaru dan terpopuler. Temukan spesifikasi, review, dan rekomendasi terbaik.</p>
        </div>
        <div class="decorative-element">
          <i class="fas fa-mobile-alt"></i>
          <i class="fas fa-laptop"></i>
          <i class="fas fa-tablet-alt"></i>
        </div>
      </div>
    </div>

    <!-- Right Side - Form -->
    <div class="auth-right">
      <div class="auth-form-container">
        <!-- Header -->
        <div class="auth-header mb-4">
          <h2 class="auth-title">Masuk</h2>
          <p class="auth-subtitle">Selamat datang kembali di Gadzone</p>
        </div>

        <!-- Form Login -->
        <form @submit.prevent="handleLogin" class="auth-form" autocomplete="off">
          <!-- Email Field -->
          <div class="form-group mb-3">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              name="email"
              class="form-control auth-input"
              :class="{ 'is-invalid': errors.email }"
              placeholder="Masukkan email Anda"
              autocomplete="username"
              required
            />
            <div v-if="errors.email" class="invalid-feedback">
              {{ errors.email[0] }}
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group mb-4">
            <label class="form-label">Password</label>
            <div class="input-group">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                name="password"
                class="form-control auth-input"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Masukkan password Anda"
                autocomplete="current-password"
                data-lpignore="true"
                required
              />
              <button
                type="button"
                class="btn btn-outline-light password-toggle"
                @click="togglePassword"
              >
                <i :class="showPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
              </button>
            </div>
            <div v-if="errors.password" class="invalid-feedback">
              {{ errors.password[0] }}
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-danger" role="alert">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success" role="alert">
            {{ successMessage }}
          </div>

          <!-- Login Button -->
          <button
            type="submit"
            class="btn auth-btn w-100 mb-4"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Masuk...' : 'Masuk' }}
          </button>

          <!-- Links -->
          <div class="auth-links text-center">
            <p class="mb-0">
              Belum punya akun?
              <router-link to="/register" class="auth-link">Daftar di sini</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

// ==========================================
// SETUP
// ==========================================
const router = useRouter()
const authStore = useAuthStore()

// ==========================================
// REACTIVE DATA
// ==========================================
const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref({})

// ==========================================
// METHODS
// ==========================================

/**
 * Toggle show/hide password
 */
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

/**
 * Handle form login submit
 */
const handleLogin = async () => {
  try {
    // Reset messages
    errorMessage.value = ''
    successMessage.value = ''
    errors.value = {}

    loading.value = true

    // Call auth store login
    const result = await authStore.login({
      email: form.email,
      password: form.password
    })

    if (result.success) {
      // Langsung redirect ke home tanpa delay
      window.location.href = '/'
    } else {
      // Handle different error messages
      if (result.message === 'Invalid credentials') {
        errorMessage.value = 'Email atau password yang Anda masukkan salah. Silakan coba lagi.'
        // Kosongkan password saja, email tetap
        form.password = ''
      } else if (result.message && result.message.includes('email')) {
        errorMessage.value = 'Format email tidak valid. Periksa kembali email Anda.'
      } else if (result.message && result.message.includes('password')) {
        errorMessage.value = 'Password yang Anda masukkan salah. Silakan coba lagi.'
        // Kosongkan password saja, email tetap
        form.password = ''
      } else {
        errorMessage.value = result.message || 'Login gagal. Silakan coba lagi.'
        // Untuk error umum, kosongkan password saja
        form.password = ''
      }
    }

  } catch (error) {
    console.error('Login error:', error)

    // Handle validation errors from backend
    if (error.response && error.response.status === 422) {
      const validationErrors = error.response.data.errors || {}
      errors.value = validationErrors

      if (validationErrors.email) {
        errorMessage.value = 'Format email tidak valid. Periksa kembali email Anda.'
      } else if (validationErrors.password) {
        errorMessage.value = 'Password wajib diisi.'
      } else {
        errorMessage.value = 'Data yang Anda masukkan tidak valid.'
      }
    } else if (error.response && error.response.status === 401) {
      errorMessage.value = 'Email atau password yang Anda masukkan salah. Silakan coba lagi.'
      // Kosongkan password saja, email tetap
      form.password = ''
    } else {
      errorMessage.value = 'Terjadi kesalahan. Silakan coba lagi.'
      // Kosongkan password untuk keamanan
      form.password = ''
    }
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
/* ==========================================
   AUTH CONTAINER & LAYOUT
   ========================================== */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: #f8f9fa;
}

.auth-card {
  display: flex;
  max-width: 1200px;
  width: 100%;
  min-height: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

/* ==========================================
   LEFT SIDE - BRANDING
   ========================================== */
.auth-left {
  flex: 0 0 60%;
  background: linear-gradient(135deg, #0a1f44 0%, #032541 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;
  border-radius: 20px 0 0 20px;
}

/* ==========================================
   RIGHT SIDE - FORM
   ========================================== */
.auth-right {
  flex: 0 0 40%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  border-radius: 0 20px 20px 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
}

.branding-content {
  text-align: center;
  color: white;
  z-index: 2;
}

.brand-logo h1 {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #00c6ff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 3px;
}

.brand-description h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
}

.brand-description p {
  font-size: 1rem;
  opacity: 0.9;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.decorative-element {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.decorative-element i {
  font-size: 2.5rem;
  color: #00c6ff;
  opacity: 0.7;
  animation: float 3s ease-in-out infinite;
  transition: all 0.3s ease;
  cursor: pointer;
}

.decorative-element i:nth-child(2) {
  animation-delay: -1s;
}

.decorative-element i:nth-child(3) {
  animation-delay: -2s;
}

.decorative-element i:hover {
  color: #00c6ff;
  opacity: 1;
  transform: scale(1.1);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* ==========================================
   FORM ELEMENTS
   ========================================== */
.auth-header {
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: #666;
  font-size: 0.95rem;
}

.form-label {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.auth-input {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.auth-input:focus {
  border-color: #00c6ff;
  box-shadow: 0 0 0 3px rgba(0, 198, 255, 0.1);
  background: white;
  outline: none;
}

.auth-input.is-invalid {
  border-color: #dc3545;
}

.password-toggle {
  border: 1px solid #e1e5e9;
  border-left: none;
  background: #f8f9fa;
  color: #666;
}

.password-toggle:hover {
  background: #e9ecef;
  color: #333;
}

/* ==========================================
   BUTTON
   ========================================== */
.auth-btn {
  background: linear-gradient(45deg, #032541, #032541);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.auth-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #00c6ff, #00c6ff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 198, 255, 0.3);
}

.auth-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* ==========================================
   LINKS
   ========================================== */
.auth-links p {
  color: #666;
  font-size: 0.9rem;
}

.auth-link {
  color: #6c757d;
  text-decoration: none;
  font-weight: 600;
}

.auth-link:hover {
  color: #00c6ff;
}

/* ==========================================
   RESPONSIVE
   ========================================== */
@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
  }

  .auth-right {
    display: none;
  }

  .auth-left {
    padding: 20px;
  }

  .brand-logo h1 {
    font-size: 2.5rem;
  }
}
</style>