<template>
    <div class="container mt-5">
      <h2>Edit Kategori</h2>
      <form @submit.prevent="updateCategory">
        <div class="mb-3">
          <label>Nama Kategori</label>
          <input type="text" v-model="category.name" class="form-control" />
        </div>
        <button type="submit" class="btn btn-success">Update</button>
        <router-link to="/categories" class="btn btn-secondary ms-2">Kembali</router-link>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Api from '@/api/index.js';
  
  const route = useRoute();
  const router = useRouter();
  const category = ref({
    name: '',
  });
  
  onMounted(() => {
    // Mengambil kategori berdasarkan ID
    Api.get(`/api/categories/${route.params.id}`)
      .then(response => {
        category.value = response.data.data;  // Menyimpan data kategori yang akan diedit
      })
      .catch(error => {
        console.error("Error fetching category for editing:", error);
      });
  });
  
  const updateCategory = () => {
    // Mengirim data kategori yang sudah diperbarui
    Api.put(`/api/categories/${route.params.id}`, category.value)
      .then(response => {
        router.push('/categories');  // Redirect setelah sukses mengupdate kategori
      })
      .catch(error => {
        console.error("Error updating category:", error);
      });
  };
  </script>
  