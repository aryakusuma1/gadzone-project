<template>
  <div class="modern-page-wrapper">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Daftar Produk</h1>
          <div v-if="searchQuery" class="search-result-info">
            <div class="search-badge">
              <i class="fas fa-search"></i>
              <span>Hasil pencarian untuk: "<strong>{{ searchQuery }}</strong>"</span>
              <span class="result-count">({{ produks.length }} produk)</span>
            </div>
            <button @click="clearSearch" class="clear-search-btn">
              <i class="fas fa-times"></i>
              Hapus pencarian
            </button>
          </div>
        </div>
        <button class="add-product-btn" @click="goToCreateProduk">
          <i class="fas fa-plus"></i>
          Tambah Produk
        </button>
      </div>
      <!-- No Results Message -->
      <div v-if="produks.length === 0 && searchQuery" class="no-results-container">
        <div class="no-results-content">
          <i class="fas fa-search"></i>
          <h3>Tidak ada produk ditemukan</h3>
          <p>Coba kata kunci lain atau hapus pencarian untuk melihat semua produk</p>
          <button @click="clearSearch" class="view-all-btn">
            <i class="fas fa-list"></i>
            Lihat Semua Produk
          </button>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="products-grid">
        <div v-for="produk in produks" :key="produk.id" class="product-item">
          <div class="modern-product-card">
            <div class="product-image">
              <!-- Action Menu Button overlay di atas gambar -->
              <div class="product-action-menu">
                <button @click="toggleActionMenu(produk.id)" class="action-menu-btn" :class="{ 'active': activeMenu === produk.id }">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
                <!-- Dropdown Menu -->
                <div v-if="activeMenu === produk.id" class="action-dropdown">
                  <button @click="goToEditProduk(produk.id)" class="dropdown-item edit-item">
                    <i class="fas fa-edit"></i>
                    Edit
                  </button>
                  <button @click="deleteProduk(produk.id)" class="dropdown-item delete-item">
                    <i class="fas fa-trash"></i>
                    Hapus
                  </button>
                </div>
              </div>

              <img
                :src="getImageUrl(produk.image_url)"
                :alt="produk.name"
                @error="handleImageError"
              />
            </div>
            <div class="product-content">
              <div class="product-category">
                {{ produk.category?.name || 'Tanpa Kategori' }}
              </div>
              <h3 class="product-name">{{ produk.name }}</h3>
              <p class="product-description">{{ produk.description }}</p>
              <div class="product-price">Rp {{ produk.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Api from '@/api/index.js';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const produks = ref([]);
const allProduks = ref([]);
const searchQuery = ref('');
const activeMenu = ref(null);

// Fetch Produk
const fetchProduks = () => {
  Api.get('/api/products').then((response) => {
    allProduks.value = response.data.data;
    filterProduks();
  }).catch((error) => {
    console.error("Error fetching products:", error);
  });
};

// Filter produk berdasarkan search query
const filterProduks = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();

    // Split query menjadi kata-kata individual
    const searchWords = query.split(/\s+/).filter(word => word.length > 0);

    produks.value = allProduks.value.filter(produk => {
      const productName = produk.name.toLowerCase();
      const categoryName = (produk.category?.name || '').toLowerCase();

      // Semua kata harus ada di salah satu field (name atau category saja)
      return searchWords.every(word =>
        productName.includes(word) ||
        categoryName.includes(word)
      );
    });
  } else {
    produks.value = allProduks.value;
  }
};

// Delete Produk
const deleteProduk = (id) => {
  Api.delete(`/api/products/${id}`).then(fetchProduks).catch((error) => {
    console.error("Error deleting product:", error);
  });
};

// Clear search
const clearSearch = () => {
  searchQuery.value = '';
  router.push('/products');
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

// Action Menu Handler
const toggleActionMenu = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id;
};

// Navigasi
const goToCreateProduk = () => router.push('/create');
const goToEditProduk = (id) => {
  activeMenu.value = null; // Close menu
  router.push(`/edit/${id}`);
};

// Watch route query changes
watch(() => route.query.search, (newSearch) => {
  searchQuery.value = newSearch || '';
  filterProduks();
}, { immediate: true });

// Watch search query changes
watch(searchQuery, () => {
  filterProduks();
});

onMounted(() => {
  fetchProduks();

  // Event listener untuk menutup menu saat klik di luar
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.product-action-menu')) {
      activeMenu.value = null;
    }
  });
});
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  letter-spacing: -0.02em;
}

/* Search Result Info */
.search-result-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.search-badge {
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #495057;
}

.search-badge i {
  color: #032541;
}

.result-count {
  color: #6c757d;
  font-weight: 500;
}

.clear-search-btn {
  background: white;
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.clear-search-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
}

/* Add Product Button */
.add-product-btn {
  background: linear-gradient(45deg, #032541, #032541);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 198, 255, 0.3);
}

.add-product-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 198, 255, 0.4);
}

/* No Results Container */
.no-results-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
}

.no-results-content {
  text-align: center;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.no-results-content i {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1.5rem;
}

.no-results-content h3 {
  color: #495057;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.no-results-content p {
  color: #6c757d;
  margin-bottom: 2rem;
}

.view-all-btn {
  background: linear-gradient(45deg, #032541, #032541);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  transition: all 0.3s ease;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* Modern Product Card */
.modern-product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modern-product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Product Image */
.product-image {
  position: relative;
  height: 200px;
  background: #f8f9fa;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 1rem;
}

/* Product Action Menu Overlay */
.product-action-menu {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.action-menu-btn {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.action-menu-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.action-menu-btn.active {
  background: #032541;
  transform: rotate(90deg);
}

/* Action Dropdown */
.action-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  z-index: 20;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #495057;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.edit-item:hover {
  background: rgba(255, 193, 7, 0.1);
  color: #f39c12;
}

.dropdown-item.delete-item:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

/* Product Content */
.product-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.product-category {
  background: linear-gradient(45deg, #032541, #032541);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  align-self: flex-start;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-description {
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #27ae60;
  margin-bottom: 1rem;
}


/* Responsive Design */
@media (max-width: 768px) {
  .page-container {
    padding: 2rem 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .search-result-info {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
}

@media (max-width: 576px) {
  .page-container {
    padding: 1.5rem 1rem;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
