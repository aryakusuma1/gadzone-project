<template>
  <div class="modern-page-wrapper">
    <div class="page-container">
      <div class="hero-section">
        <h1 class="hero-title">Welcome to Gadzone</h1>
        <p class="hero-subtitle">Your one-stop destination for managing products and categories</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
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
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Page Container */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1rem;
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #6e7f80, #3d5a6e);
  color: white;
  padding: 5rem 3rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  max-width: 900px;
  margin: 0 auto;
}

.hero-section:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.3);
}

/* Hero Title */
.hero-title {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  font-weight: 800;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
  color: white;
}

/* Hero Subtitle */
.hero-subtitle {
  font-size: 1.4rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-container {
    padding: 2rem 1rem;
  }

  .hero-section {
    padding: 3rem 2rem;
    border-radius: 15px;
  }

  .hero-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }
}

@media (max-width: 576px) {
  .hero-section {
    padding: 2.5rem 1.5rem;
    border-radius: 12px;
  }

  .hero-title {
    font-size: 2rem;
    letter-spacing: 1px;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
