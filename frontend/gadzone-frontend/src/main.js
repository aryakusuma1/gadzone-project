import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App);
const pinia = createPinia();

// Setup Pinia dan Router
app.use(pinia);
app.use(router);

// Inisialisasi auth store saat aplikasi dimuat (async dengan await)
const initializeApp = async () => {
  const authStore = useAuthStore();
  await authStore.initAuth();

  // Mount aplikasi setelah auth state terinisialisasi
  app.mount('#app');
};

// Jalankan inisialisasi
initializeApp();


