<template>
  <div class="modern-page-wrapper">
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Daftar Kategori</h1>
          <p class="page-subtitle">Kelola kategori produk Anda</p>
        </div>
        <div class="header-actions">
          <button
            v-if="isBulkDeleteMode && selectedCategories.length > 0"
            @click="deleteSelectedCategories"
            class="delete-selected-btn"
          >
            <i class="fas fa-trash-alt"></i>
            Hapus Terpilih ({{ selectedCategories.length }})
          </button>
          <button
            v-if="isBulkDeleteMode"
            @click="cancelBulkDelete"
            class="cancel-bulk-btn"
          >
            <i class="fas fa-times"></i>
            Batal
          </button>
          <button
            v-if="!isBulkDeleteMode"
            class="add-category-btn"
            @click="goToCreateCategory"
          >
            <i class="fas fa-plus"></i>
            Tambah Kategori
          </button>
        </div>
      </div>

      <!-- Bulk Actions Header - hanya muncul saat bulk delete mode -->
      <div v-if="isBulkDeleteMode && categories.length > 0" class="bulk-actions-header">
        <label class="select-all-container">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="select-all-checkbox"
          >
          <span class="checkmark"></span>
          <span class="select-all-text">Pilih Semua ({{ categories.length }})</span>
        </label>
        <div class="selection-info">
          {{ selectedCategories.length }} dari {{ categories.length }} kategori dipilih
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="categories-grid">
        <div v-for="category in categories" :key="category.id" class="category-item">
          <div class="modern-category-card" :class="{ 'selected': isSelected(category.id) }">
            <!-- Checkbox hanya muncul saat bulk delete mode -->
            <label v-if="isBulkDeleteMode" class="category-checkbox-container">
              <input
                type="checkbox"
                :checked="isSelected(category.id)"
                @change="toggleCategorySelection(category.id)"
                class="category-checkbox"
              >
              <span class="category-checkmark"></span>
            </label>

            <!-- Action Menu Button (hanya saat tidak dalam bulk mode) -->
            <div v-if="!isBulkDeleteMode" class="category-action-menu">
              <button @click="toggleActionMenu(category.id)" class="action-menu-btn" :class="{ 'active': activeMenu === category.id }">
                <i class="fas fa-plus"></i>
              </button>
              <!-- Dropdown Menu -->
              <div v-if="activeMenu === category.id" class="action-dropdown">
                <button @click="goToEditCategory(category.id)" class="dropdown-item edit-item">
                  <i class="fas fa-edit"></i>
                  Edit
                </button>
                <button @click="startBulkDeleteMode(category.id)" class="dropdown-item delete-item">
                  <i class="fas fa-trash"></i>
                  Hapus
                </button>
              </div>
            </div>

            <div class="category-content">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">Kategori produk elektronik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import Api from "@/api/index.js";
import { useRouter } from "vue-router";

const router = useRouter();
const categories = ref([]);
const selectedCategories = ref([]);
const isBulkDeleteMode = ref(false);
const activeMenu = ref(null);

// Computed properties untuk bulk selection
const isAllSelected = computed(() => {
  return categories.value.length > 0 && selectedCategories.value.length === categories.value.length;
});

const hasSelections = computed(() => {
  return selectedCategories.value.length > 0;
});

// Fetch data kategori
const fetchCategories = async () => {
  try {
    const response = await Api.get('/api/categories');
    categories.value = response.data.data;
    // Clear selections that no longer exist
    selectedCategories.value = selectedCategories.value.filter(id =>
      categories.value.some(category => category.id === id)
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    alert('Gagal memuat data kategori. Silakan refresh halaman.');
  }
};

// Selection Functions
const isSelected = (categoryId) => {
  return selectedCategories.value.includes(categoryId);
};

const toggleCategorySelection = (categoryId) => {
  const index = selectedCategories.value.indexOf(categoryId);
  if (index > -1) {
    selectedCategories.value.splice(index, 1);
  } else {
    selectedCategories.value.push(categoryId);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedCategories.value = [];
  } else {
    selectedCategories.value = categories.value.map(category => category.id);
  }
};

const clearSelections = () => {
  selectedCategories.value = [];
};

const startBulkDeleteMode = (categoryId = null) => {
  closeActionMenu();
  isBulkDeleteMode.value = true;
  // Auto select kategori yang diklik delete (opsional)
  if (categoryId) {
    selectedCategories.value = [categoryId];
  }
};

const cancelBulkDelete = () => {
  isBulkDeleteMode.value = false;
  clearSelections();
};

// Action Menu Functions
const toggleActionMenu = (categoryId) => {
  if (activeMenu.value === categoryId) {
    activeMenu.value = null;
  } else {
    activeMenu.value = categoryId;
  }
};

const closeActionMenu = () => {
  activeMenu.value = null;
};

// Delete Functions
const deleteCategory = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
    try {
      await Api.delete(`/api/categories/${id}`);
      await fetchCategories();
      // Remove from selection if it was selected
      const index = selectedCategories.value.indexOf(id);
      if (index > -1) {
        selectedCategories.value.splice(index, 1);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Gagal menghapus kategori. Silakan coba lagi.');
    }
  }
};

const deleteSelectedCategories = async () => {
  if (selectedCategories.value.length === 0) return;

  const confirmMessage = `Apakah Anda yakin ingin menghapus ${selectedCategories.value.length} kategori yang dipilih?`;
  if (confirm(confirmMessage)) {
    try {
      // Delete all selected categories
      const deletePromises = selectedCategories.value.map(id =>
        Api.delete(`/api/categories/${id}`)
      );

      await Promise.all(deletePromises);
      await fetchCategories();
      const deletedCount = selectedCategories.value.length;
      clearSelections();
      cancelBulkDelete(); // Keluar dari bulk mode setelah delete

      alert(`${deletedCount} kategori berhasil dihapus.`);
    } catch (error) {
      console.error('Error deleting selected categories:', error);
      alert('Gagal menghapus beberapa kategori. Silakan coba lagi.');
    }
  }
};

// Navigasi ke halaman Tambah Kategori
const goToCreateCategory = () => {
  router.push("/create-category");
};

// Navigasi ke halaman Edit Kategori
const goToEditCategory = (id) => {
  closeActionMenu();
  router.push(`/edit-category/${id}`);
};

// Ambil data kategori saat komponen dipasang
onMounted(() => {
  fetchCategories();

  // Event listener untuk menutup menu saat klik di luar
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.category-action-menu')) {
      closeActionMenu();
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
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
}

/* Header Actions */
.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Add Category Button */
.add-category-btn {
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

.add-category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 198, 255, 0.4);
}

/* Delete Selected Button */
.delete-selected-btn {
  background: linear-gradient(45deg, #dc3545, #c82333);
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.delete-selected-btn:hover {
  background: linear-gradient(45deg, #c82333, #bd2130);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
}

/* Cancel Bulk Button */
.cancel-bulk-btn {
  background: linear-gradient(45deg, #6c757d, #5a6268);
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.cancel-bulk-btn:hover {
  background: linear-gradient(45deg, #5a6268, #545b62);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}

/* Bulk Actions Header */
.bulk-actions-header {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Select All Container */
.select-all-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #495057;
}

.select-all-checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
}

.select-all-container:hover .checkmark {
  border-color: #032541;
}

.select-all-checkbox:checked + .checkmark {
  background: #032541;
  border-color: #032541;
}

.select-all-checkbox:checked + .checkmark::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: 2px solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.selection-info {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

/* Modern Category Card */
.modern-category-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.modern-category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.modern-category-card.selected {
  border: 2px solid #032541;
  box-shadow: 0 8px 32px rgba(3, 37, 65, 0.15);
}

/* Category Checkbox */
.category-checkbox-container {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.category-checkbox {
  display: none;
}

.category-checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.category-checkbox-container:hover .category-checkmark {
  border-color: #032541;
}

.category-checkbox:checked + .category-checkmark {
  background: #032541;
  border-color: #032541;
}

.category-checkbox:checked + .category-checkmark::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}


/* Action Menu */
.category-action-menu {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
}

.action-menu-btn {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-menu-btn:hover {
  background: #032541;
  color: white;
  border-color: #032541;
  transform: rotate(45deg);
}

.action-menu-btn.active {
  background: #032541;
  color: white;
  border-color: #032541;
  transform: rotate(45deg);
}

.action-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 120px;
  overflow: hidden;
  z-index: 20;
}

.dropdown-item {
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.edit-item:hover {
  background: #fff3cd;
  color: #856404;
}

.delete-item:hover {
  background: #f8d7da;
  color: #721c24;
}

/* Category Content */
.category-content {
  padding: 3rem 2rem 2rem 2rem;
  flex-grow: 1;
  text-align: center;
}

.category-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.category-description {
  color: #6c757d;
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-container {
    padding: 2rem 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 576px) {
  .page-container {
    padding: 1.5rem 1rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .category-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .page-title {
    font-size: 1.75rem;
  }
}
</style>
