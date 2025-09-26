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
          <h3>Bergabung Sekarang</h3>
          <p>Jelajahi dunia gadget terbaru dan dapatkan informasi lengkap tentang spesifikasi, review, dan rekomendasi terbaik.</p>
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
          <h2 class="auth-title">Daftar</h2>
          <p class="auth-subtitle">Bergabung dengan komunitas Gadzone</p>
        </div>

        <!-- Form Register -->
        <form @submit.prevent="handleRegister" class="auth-form">
          <!-- Name Field -->
          <div class="form-group mb-3">
            <label class="form-label">Nama Lengkap</label>
            <input
              v-model="form.name"
              type="text"
              class="form-control auth-input"
              :class="{ 'is-invalid': errors.name }"
              placeholder="Masukkan nama lengkap"
              required
            />
            <div v-if="errors.name" class="invalid-feedback">
              {{ errors.name[0] }}
            </div>
          </div>

          <!-- Email Field -->
          <div class="form-group mb-3">
            <label class="form-label">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-control auth-input"
              :class="{ 'is-invalid': errors.email }"
              placeholder="Masukkan email Anda"
              required
            />
            <div v-if="errors.email" class="invalid-feedback">
              {{ errors.email[0] }}
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group mb-3">
            <label class="form-label">Password</label>
            <div class="input-group">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control auth-input"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Minimal 8 karakter"
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

          <!-- Confirm Password Field -->
          <div class="form-group mb-4">
            <label class="form-label">Konfirmasi Password</label>
            <div class="input-group">
              <input
                v-model="form.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control auth-input"
                :class="{ 'is-invalid': !passwordsMatch && form.password_confirmation }"
                placeholder="Ulangi password Anda"
                required
              />
              <button
                type="button"
                class="btn btn-outline-light password-toggle"
                @click="toggleConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'far fa-eye-slash' : 'far fa-eye'"></i>
              </button>
            </div>
            <div v-if="!passwordsMatch && form.password_confirmation" class="invalid-feedback">
              Password tidak sama
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

          <!-- Register Button -->
          <button
            type="submit"
            class="btn auth-btn w-100 mb-4"
            :disabled="loading || !formValid"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Mendaftar...' : 'Buat Akun' }}
          </button>

          <!-- Links -->
          <div class="auth-links text-center">
            <p class="mb-0">
              Sudah punya akun?
              <router-link to="/login" class="auth-link">Masuk di sini</router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const errors = ref({})

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

// Cek apakah password dan konfirmasi sama
const passwordsMatch = computed(() => {
  if (!form.password || !form.password_confirmation) return true
  return form.password === form.password_confirmation
})

// Cek validitas form keseluruhan
const formValid = computed(() => {
  return form.name &&
         form.email &&
         form.password &&
         form.password_confirmation &&
         passwordsMatch.value &&
         form.password.length >= 8
})

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
 * Toggle show/hide confirm password
 */
const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

/**
 * Handle form register submit
 */
const handleRegister = async () => {
  try {
    // Reset messages
    errorMessage.value = ''
    successMessage.value = ''
    errors.value = {}

    // Validasi client-side
    if (!passwordsMatch.value) {
      errorMessage.value = 'Password dan konfirmasi password tidak sama'
      return
    }

    loading.value = true

    // Call auth store register
    const result = await authStore.register(form)

    if (result.success) {
      // Redirect langsung ke halaman utama
      router.push('/')
    } else {
      errorMessage.value = result.message

      // Display validation errors
      if (result.errors) {
        errors.value = result.errors
      }
    }

  } catch (error) {
    console.error('Register error:', error)
    errorMessage.value = 'Terjadi kesalahan saat mendaftar'
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
}

.decorative-element i:nth-child(2) {
  animation-delay: -1s;
}

.decorative-element i:nth-child(3) {
  animation-delay: -2s;
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
  background: linear-gradient(45deg, #28a745, #20c997);
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
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
  color: #28a745;
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