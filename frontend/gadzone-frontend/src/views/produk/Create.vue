<template>
  <div class="modern-page-wrapper">
    <div class="page-container">
      <div class="form-card">
        <div class="form-header">
          <h1 class="form-title">Tambah Produk</h1>
          <p class="form-subtitle">Buat produk baru untuk toko Anda</p>
        </div>

        <form @submit.prevent="storeProduk" class="modern-form">
          <div class="form-group">
            <label class="form-label">Nama Produk</label>
            <input
              type="text"
              v-model="produk.name"
              class="form-input"
              placeholder="Masukkan nama produk..."
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi</label>
            <textarea
              v-model="produk.description"
              class="form-textarea"
              placeholder="Masukkan deskripsi produk..."
              rows="4"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Harga</label>
            <input
              type="number"
              v-model="produk.price"
              class="form-input"
              placeholder="Masukkan harga produk..."
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Gambar Produk</label>
            <input
              type="file"
              @change="handleImageUpload"
              class="form-file-input"
              :class="{ 'error': errorMessage && errorMessage.includes('file') }"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              required
            />
            <div class="form-help">Format: JPEG, JPG, PNG, WEBP. Maksimal 2MB.</div>
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" class="preview-image">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select v-model="produk.category_id" class="form-select" required>
              <option value="" disabled>Pilih kategori...</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="alert alert-error" role="alert">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="alert alert-success" role="alert">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ loading ? 'Menyimpan...' : 'Simpan' }}
            </button>
            <router-link to="/products" class="cancel-btn">
              <i class="fas fa-arrow-left"></i>
              Kembali
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Api from '@/api/index.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const produk = ref({
  name: '',
  description: '',
  price: '',
  category_id: null,
  image: null,
});

const imagePreview = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const categories = ref([]);

// Ambil kategori saat komponen dimuat
onMounted(async () => {
  try {
    const response = await Api.get('/api/categories');
    categories.value = response.data.data;
  } catch (error) {
    console.error('Error loading categories:', error);
    errorMessage.value = 'Gagal memuat kategori';
  }
});

// Handle image upload dan preview
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validasi ukuran file (2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorMessage.value = 'Ukuran file terlalu besar. Maksimal 2MB.';
      event.target.value = '';
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Format file tidak didukung. Gunakan JPEG, JPG, PNG, atau WEBP.';
      event.target.value = '';
      return;
    }

    produk.value.image = file;
    errorMessage.value = '';

    // Buat preview gambar
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Fungsi untuk menyimpan produk
const storeProduk = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    // Buat FormData untuk file upload
    const formData = new FormData();
    formData.append('name', produk.value.name);
    formData.append('description', produk.value.description);
    formData.append('price', produk.value.price);
    formData.append('category_id', produk.value.category_id);
    if (produk.value.image) {
      formData.append('image', produk.value.image);
    }

    const response = await Api.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      successMessage.value = 'Produk berhasil ditambahkan!';
      // Redirect setelah delay singkat
      setTimeout(() => {
        router.push('/products');
      }, 1500);
    }
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || 'Gagal menyimpan produk';
    } else {
      errorMessage.value = 'Terjadi kesalahan saat menyimpan produk';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Modern Page Wrapper */
.modern-page-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  margin: 0;
  padding: 0;
  width: 100%;
}

/* Page Container */
.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

/* Form Card */
.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Form Header */
.form-header {
  background: linear-gradient(45deg, #032541, #0a1f44);
  color: white;
  padding: 2rem;
  text-align: center;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.form-subtitle {
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
}

/* Modern Form */
.modern-form {
  padding: 2rem;
}

/* Form Group */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.form-input, .form-textarea, .form-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus, .form-textarea:focus, .form-select:focus {
  outline: none;
  border-color: #032541;
  background: white;
  box-shadow: 0 0 0 3px rgba(3, 37, 65, 0.1);
}

.form-input::placeholder, .form-textarea::placeholder {
  color: #adb5bd;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-file-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px dashed #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #f8f9fa;
  cursor: pointer;
}

.form-file-input:hover {
  border-color: #032541;
  background: white;
}

.form-file-input.error {
  border-color: #dc3545;
  background: #fff5f5;
}

.form-help {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

/* Image Preview */
.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.preview-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  object-fit: cover;
}

/* Alerts */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.alert-error {
  background: #fff5f5;
  color: #dc3545;
  border: 1px solid #f5c6cb;
}

.alert-success {
  background: #f0f9ff;
  color: #28a745;
  border: 1px solid #b8daff;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.save-btn, .cancel-btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.save-btn {
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
  text-decoration: none;
  color: white;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-container {
    padding: 2rem 1rem;
  }

  .form-header {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .modern-form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .save-btn, .cancel-btn {
    justify-content: center;
  }
}
</style>
