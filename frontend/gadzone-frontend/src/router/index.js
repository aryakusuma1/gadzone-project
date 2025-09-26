import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js';

// ==========================================
// IMPORT COMPONENTS
// ==========================================
// Public Pages
import Home from '../views/Home.vue';

// Auth Pages
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';

// Protected Pages - Products
import ProductIndex from '../views/produk/index.vue';
import CreateProduct from '../views/produk/create.vue';
import EditProduct from '../views/produk/Edit.vue';

// Protected Pages - Categories
import CategoryIndex from '../views/categories/Index.vue';
import CreateCategory from '../views/categories/CreateCategory.vue';
import EditCategory from '../views/categories/EditCategory.vue';

// ==========================================
// ROUTE DEFINITIONS
// ==========================================
const routes = [

  // ===========================================
  // PUBLIC ROUTES (Tidak perlu login)
  // ===========================================
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: false }
  },

  // ===========================================
  // AUTH ROUTES (Guest only - sudah login tidak bisa akses)
  // ===========================================
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },

  // ===========================================
  // PROTECTED ROUTES (Perlu login)
  // ===========================================

  // Products Management
  {
    path: '/products',
    name: 'ProductIndex',
    component: ProductIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/create',
    name: 'CreateProduct',
    component: CreateProduct,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit/:id',
    name: 'EditProduct',
    component: EditProduct,
    props: true,
    meta: { requiresAuth: true }
  },

  // Categories Management
  {
    path: '/categories',
    name: 'CategoryIndex',
    component: CategoryIndex,
    meta: { requiresAuth: true }
  },
  {
    path: '/create-category',
    name: 'CreateCategory',
    component: CreateCategory,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-category/:id',
    name: 'EditCategory',
    component: EditCategory,
    props: true,
    meta: { requiresAuth: true }
  },

  // ===========================================
  // 404 NOT FOUND
  // ===========================================
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
];

// ==========================================
// ROUTER INSTANCE
// ==========================================
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ==========================================
// NAVIGATION GUARDS
// ==========================================
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Tunggu sampai inisialisasi auth selesai
  while (authStore.isInitializing) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait 50ms
  }

  // Cek apakah route membutuhkan authentication
  if (to.meta.requiresAuth) {
    // Jika tidak login, redirect ke login
    if (!authStore.isLoggedIn) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath } // Simpan halaman tujuan untuk redirect setelah login
      });
      return;
    }
  }

  // Cek apakah route hanya untuk guest (belum login)
  if (to.meta.requiresGuest) {
    // Jika sudah login, redirect ke home
    if (authStore.isLoggedIn) {
      next({ name: 'Home' });
      return;
    }
  }

  // Lanjutkan navigasi
  next();
});

export default router;
