<template>
  <div class="container mt-5">
    <h2>Edit Produk</h2>
    <form @submit.prevent="updateProduk">
      <div class="mb-3">
        <label>Nama Produk <span class="required-asterisk">*</span></label>
        <input type="text" v-model="produk.name" class="form-control" required />
      </div>
      <div class="mb-3">
        <label>Deskripsi <span class="required-asterisk">*</span></label>
        <textarea v-model="produk.description" class="form-control" required></textarea>
      </div>
      <div class="mb-3">
        <label>Harga <span class="required-asterisk">*</span></label>
        <input type="number" v-model="produk.price" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Gambar Produk</label>

        <!-- Current Image Preview -->
        <div v-if="currentImageUrl && !imagePreview" class="mb-2">
          <label class="form-text">Gambar saat ini:</label>
          <div>
            <img :src="getImageUrl(currentImageUrl)" alt="Current Image" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" @error="handleImageError">
          </div>
        </div>

        <input
          type="file"
          @change="handleImageUpload"
          class="form-control"
          :class="{ 'is-invalid': errorMessage && errorMessage.includes('file') }"
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />
        <div class="form-text">Format: JPEG, JPG, PNG, WEBP. Maksimal 2MB. Kosongkan jika tidak ingin mengubah gambar.</div>

        <!-- New Image Preview -->
        <div v-if="imagePreview" class="mt-2">
          <label class="form-text">Preview gambar baru:</label>
          <div>
            <img :src="imagePreview" alt="New Preview" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label>Kategori <span class="required-asterisk">*</span></label>
        <select v-model="produk.category_id" class="form-control" required>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <!-- Error Message -->
      <div v-if="errorMessage" class="alert alert-danger mb-3" role="alert">
        {{ errorMessage }}
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert-success mb-3" role="alert">
        {{ successMessage }}
      </div>

      <button type="submit" class="btn btn-success" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ loading ? 'Memperbarui...' : 'Update' }}
      </button>
      <router-link to="/products" class="btn btn-secondary ms-2">Kembali</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Api from '@/api/index.js';

const route = useRoute();
const router = useRouter();
const produk = ref({
  name: '',
  description: '',
  price: '',
  category_id: null,
  image: null,
});

const currentImageUrl = ref('');
const imagePreview = ref(null);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const categories = ref([]);

// Ambil kategori dan data produk saat komponen dimuat
onMounted(async () => {
  try {
    // Load categories
    const categoriesResponse = await Api.get('/api/categories');
    categories.value = categoriesResponse.data.data;

    // Load product data
    const productResponse = await Api.get(`/api/products/${route.params.id}`);
    const productData = productResponse.data.data;

    produk.value = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      category_id: productData.category_id,
      image: null // Reset for new upload
    };

    // Set current image URL for preview
    if (productData.image_url) {
      currentImageUrl.value = productData.image_url;
    } else if (productData.image) {
      currentImageUrl.value = productData.image;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    errorMessage.value = 'Gagal memuat data';
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

    // Buat preview gambar baru
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    // File input dikosongkan
    produk.value.image = null;
    imagePreview.value = null;
  }
};

// Fungsi untuk mengupdate produk
const updateProduk = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    // Buat FormData untuk file upload
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Laravel method spoofing
    formData.append('name', produk.value.name);
    formData.append('description', produk.value.description);
    formData.append('price', produk.value.price);
    formData.append('category_id', produk.value.category_id);

    // Hanya append image jika ada file baru yang dipilih
    if (produk.value.image) {
      formData.append('image', produk.value.image);
    }

    const response = await Api.post(`/api/products/${route.params.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      successMessage.value = 'Produk berhasil diperbarui!';
      // Redirect setelah delay singkat
      setTimeout(() => {
        router.push('/products');
      }, 1500);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.message || 'Gagal memperbarui produk';
    } else {
      errorMessage.value = 'Terjadi kesalahan saat memperbarui produk';
    }
  } finally {
    loading.value = false;
  }
};

// Helper function untuk URL gambar
const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/300x300?text=No+Image';

  // Jika sudah full URL, return as is
  if (imageUrl.startsWith('http')) return imageUrl;

  // Ambil base URL dari API instance yang sudah dikonfigurasi
  const baseUrl = Api.defaults.baseURL || 'http://127.0.0.1:8000';

  // Jika dimulai dengan /storage, langsung append ke base URL
  if (imageUrl.startsWith('/storage')) {
    return `${baseUrl}${imageUrl}`;
  }

  // Jika relative path tanpa /storage, tambahkan /storage/
  return `${baseUrl}/storage/${imageUrl}`;
};

// Handle image error
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
};
</script>

<style scoped>
.required-asterisk {
  color: #dc3545;
  font-weight: bold;
  margin-left: 2px;
}
</style>
