<template>
  <div class="modern-page-wrapper">
    <div class="page-container">
      <div class="form-card">
        <div class="form-header">
          <h1 class="form-title">Tambah Kategori</h1>
          <p class="form-subtitle">Buat kategori baru untuk produk Anda</p>
        </div>

        <form @submit.prevent="storeCategory" class="modern-form">
          <div class="form-group">
            <label class="form-label">Nama Kategori</label>
            <input
              type="text"
              v-model="category.name"
              class="form-input"
              placeholder="Masukkan nama kategori..."
              required
            />
          </div>

          <div class="form-actions">
            <button type="submit" class="save-btn">
              <i class="fas fa-save"></i>
              Simpan
            </button>
            <router-link to="/categories" class="cancel-btn">
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
  import { ref } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const category = ref({
    name: '',
  });
  
  const storeCategory = () => {
    axios.post('http://127.0.0.1:8000/api/categories', category.value)
      .then(response => {
        router.push('/categories');  // Redirect ke halaman kategori setelah sukses
      })
      .catch(error => {
        console.error("Error saving category:", error);
      });
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
  max-width: 600px;
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus {
  outline: none;
  border-color: #032541;
  background: white;
  box-shadow: 0 0 0 3px rgba(3, 37, 65, 0.1);
}

.form-input::placeholder {
  color: #adb5bd;
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

.save-btn:hover {
  background: linear-gradient(45deg, #229954, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
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
  