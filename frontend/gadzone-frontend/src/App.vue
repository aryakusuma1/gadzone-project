<template>
  <div id="app" class="d-flex flex-column" style="min-height: 100vh;">

    <!-- Loading Screen saat Inisialisasi Auth -->
    <div v-if="authStore.isInitializing" class="loading-screen">
      <div class="loading-content">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Memuat aplikasi...</p>
      </div>
    </div>


    <!-- Main App Content -->
    <template v-else>
    <!-- Header/Navbar -->
    <nav class="navbar navbar-expand-lg modern-navbar">
      <div class="container">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand">
          <span class="logo-text">Gadzone</span>
        </router-link>

        <!-- Toggle button for small screens -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navigation Links -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Right Navigation Menu -->
          <ul class="navbar-nav ms-auto">
            <!-- Search Box (Only show when logged in) - First Item -->
            <li v-if="authStore.isLoggedIn" class="nav-item search-nav-item">
              <div class="navbar-search-box">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="navbar-search-input"
                  placeholder="Cari produk..."
                  @keyup.enter="handleSearch"
                  @input="handleRealTimeSearch"
                />
                <button
                  class="navbar-search-btn"
                  type="button"
                  @click="handleSearch"
                >
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </li>

            <!-- Home Link (Always visible) -->
            <li class="nav-item">
              <router-link class="nav-link modern-nav-link" to="/" exact-active-class="active">
                Home
              </router-link>
            </li>

            <!-- Protected Links (Only when logged in) -->
            <template v-if="authStore.isLoggedIn">
              <li class="nav-item">
                <router-link class="nav-link modern-nav-link" to="/categories" exact-active-class="active">
                  Categories
                </router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link modern-nav-link" to="/products" exact-active-class="active">
                  Products
                </router-link>
              </li>
            </template>

            <!-- Auth Menu & Guest Link -->
            <transition name="fade-slide" mode="out-in">
              <li class="nav-item dropdown" v-if="authStore.isLoggedIn" key="user-menu">
                <a class="nav-link dropdown-toggle modern-user-menu" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Hi, {{ authStore.userName }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end modern-dropdown" aria-labelledby="userDropdown">
                  <li>
                    <a class="dropdown-item" href="#" @click.prevent="viewProfile">
                      <i class="far fa-user me-2"></i> Profile
                    </a>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                      <i class="far fa-sign-out-alt me-2"></i> Logout
                    </a>
                  </li>
                </ul>
              </li>
              <li class="nav-item" v-else key="login-link">
                <router-link class="nav-link modern-nav-link" to="/login" exact-active-class="active">
                  <i class="far fa-user me-2"></i>Masuk
                </router-link>
              </li>
            </transition>
          </ul>
        </div>
      </div>
    </nav>


    <!-- Content -->
    <div class="main-content flex-grow-1">
      <router-view v-slot="{ Component, route }">
        <transition
          :name="isAuthRoute(route) ? 'slide-fade' : ''"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Footer -->
    <footer class="footer py-4 mt-auto" style="background: linear-gradient(90deg, #032541, #0a1f44);">
      <div class="container text-center">
        <p class="text-white mb-2">&copy; 2024 Gadzone | Designed with ❤️ for gadget lovers</p>
        <div class="social-icons">
          <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
          <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </footer>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useRouter } from 'vue-router'

// ==========================================
// SETUP
// ==========================================
const authStore = useAuthStore()
const router = useRouter()

// Search functionality
const searchQuery = ref('')


// ==========================================
// METHODS
// ==========================================

/**
 * Handle logout
 */
const handleLogout = async () => {
  try {
    await authStore.logout()

    // Page reload effect - langsung reload ke home
    window.location.href = '/'

    console.log('Logout berhasil')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

/**
 * View user profile (placeholder)
 */
const viewProfile = () => {
  // TODO: Implement profile page
  alert('Fitur profile akan segera hadir!')
}

/**
 * Check if current route is auth route (login/register)
 */
const isAuthRoute = (route) => {
  return route.path === '/login' || route.path === '/register'
}

/**
 * Handle search functionality
 */
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // Navigate to products page with search query
    router.push({
      path: '/products',
      query: { search: searchQuery.value.trim() }
    })
  }
}


/**
 * Handle real-time search
 */
let searchTimeout = null
const handleRealTimeSearch = () => {
  // Clear previous timeout to debounce
  clearTimeout(searchTimeout)

  // Set new timeout for real-time search
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      // Only navigate if we're not already on products page
      if (router.currentRoute.value.path !== '/products') {
        router.push({
          path: '/products',
          query: { search: searchQuery.value.trim() }
        })
      } else {
        // If already on products page, just update the query
        router.replace({
          path: '/products',
          query: { search: searchQuery.value.trim() }
        })
      }
    } else {
      // If search is empty and we're on products page, clear the query
      if (router.currentRoute.value.path === '/products' && router.currentRoute.value.query.search) {
        router.replace('/products')
      }
    }
  }, 300) // 300ms debounce
}

</script>

<style>
/* Global Reset - Unscoped */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>

<style scoped>
/* Component Scoped Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Modern Navbar Styling */
.modern-navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px 0;
  border-bottom: 1px solid #e9ecef;
}

.navbar-brand {
  font-size: 2rem;
  font-weight: 800;
  color: #2c3e50;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  text-decoration: none;
}

.navbar-brand:hover {
  color: #00c6ff;
  transform: scale(1.05);
}

.navbar-nav {
  align-items: center;
  min-height: 50px;
  display: flex;
}

.navbar-nav .nav-item {
  margin-left: 0;
  margin-right: 20px;
}

.navbar-nav .nav-item:last-child {
  margin-right: 0;
}

/* Modern Navigation Links */
.modern-nav-link {
  color: #6c757d;
  font-size: 1rem;
  font-weight: 500;
  position: relative;
  transition: all 0.3s ease;
  padding: 10px 20px;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.modern-nav-link:hover {
  color: #00c6ff;
}

.modern-nav-link.active {
  color: #00c6ff !important;
  font-weight: 600;
}

.navbar-nav-group {
  align-items: center;
  margin: 0;
  padding: 0;
}

.navbar-nav-group .nav-item {
  list-style: none;
}

.nav-item-animated {
  animation: slideInFromRight 0.5s ease-out;
}

@keyframes slideInFromRight {
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}


/* Footer Styling */
.footer {
  color: white;
  font-size: 0.9rem;
}

.footer .social-icons {
  margin-top: 10px;
}

.footer .social-icons a {
  color: white;
  margin: 0 8px;
  font-size: 1.2rem;
  transition: transform 0.3s ease, color 0.3s ease;
}

.footer .social-icons a:hover {
  color: #00c6ff;
  transform: scale(1.2);
}

/* Main Content */
.main-content {
  margin: 0;
  padding: 0;
  width: 100%;
}


/* Social Media Icons */
.social-icon {
  text-decoration: none;
  color: inherit;
}

/* Navbar Link Animations */
.nav-link-animated {
  position: relative;
  transition: all 0.3s ease;
}

.nav-link-animated:hover {
  color: #00c6ff;
  transform: scale(1.1);
}

.nav-link-animated.active {
  color: #00c6ff !important;
  font-weight: 600;
}

.navbar-nav .dropdown {
  margin-left: 0;
  margin-right: 0;
}

.user-menu-animated {
  position: relative;
  transition: all 0.3s ease;
  color: white;
  font-size: 1.1rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
}

.user-menu-animated:hover {
  color: #00c6ff;
  transform: scale(1.1);
}


/* Transition for Auth State Changes */
.fade-slide-enter-active {
  transition: all 0.5s ease;
}

.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Transition for Auth Pages (Login/Register) */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.4s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}


/* Loading Screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1f44 0%, #032541 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-content .spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3em;
}

.loading-content p {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0;
}


/* Navbar Search Box */
.search-nav-item {
  margin-right: 20px;
}

.navbar-search-box {
  display: flex;
  align-items: center;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  transition: all 0.3s ease;
  min-width: 250px;
}

.navbar-search-box:focus-within {
  border-color: #032541;
  box-shadow: 0 0 0 2px rgba(0, 198, 255, 0.1);
}

.navbar-search-input {
  border: none;
  outline: none;
  padding: 8px 12px;
  font-size: 0.9rem;
  background: transparent;
  color: #495057;
  flex: 1;
  min-width: 0;
}

.navbar-search-input::placeholder {
  color: #adb5bd;
  font-size: 0.85rem;
}

.navbar-search-btn {
  background: none;
  border: none;
  color: #6c757d;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.navbar-search-btn:hover {
  color: #00c6ff;
}

/* Modern User Menu */
.modern-user-menu {
  color: #6c757d !important;
  font-size: 1rem;
  font-weight: 500;
  padding: 10px 20px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.modern-user-menu:hover {
  color: #00c6ff !important;
}

/* Modern Dropdown */
.modern-dropdown {
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 8px 0;
  margin-top: 8px;
}

.modern-dropdown .dropdown-item {
  padding: 10px 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.modern-dropdown .dropdown-item:hover {
  background: rgba(0, 198, 255, 0.1);
  color: #00c6ff;
}

/* Search Modal Styling */
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 9999;
  padding-top: 100px;
}

.search-modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  animation: modalSlideDown 0.3s ease-out;
}

@keyframes modalSlideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.search-modal-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.search-modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.search-modal-close:hover {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
}

.search-modal-body {
  padding: 20px;
}

.search-modal-input-group {
  display: flex;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.search-modal-input-group:focus-within {
  border-color: #032541;
  box-shadow: 0 0 0 3px rgba(0, 198, 255, 0.1);
}

.search-modal-input {
  flex: 1;
  border: none;
  padding: 12px 16px;
  font-size: 1rem;
  outline: none;
  background: white;
}

.search-modal-input::placeholder {
  color: #adb5bd;
}

.search-modal-btn {
  background: linear-gradient(45deg, #032541, #0a1f44);
  border: none;
  color: white;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-modal-btn:hover {
  background: linear-gradient(45deg, #0a1f44, #032541);
}
  .navbar-nav .nav-item {
    margin-left: 0;
    margin-right: 15px;
  }

  .navbar-nav .nav-link {
    font-size: 1rem;
    padding: 6px 10px;
  }

  .navbar-nav .dropdown {
    margin-left: 0;
    margin-right: 0;
  }

  .user-menu-animated {
    font-size: 1rem;
    padding: 6px 10px;
  }

  .footer-container .social-icons a {
    margin: 0 5px;
  }

  .footer-container p {
    font-size: 0.8rem;
  }

  .container {
    padding: 10px;
  }

  .loading-content .spinner-border {
    width: 2rem;
    height: 2rem;
  }

  .loading-content p {
    font-size: 1rem;
  }
</style>
