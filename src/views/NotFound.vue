<template>
  <main class="not-found-page">
    <div class="container text-center py-5">
      <h1 class="display-1 fw-bold">404</h1>
      <p class="lead mb-4">Page not found.</p>
      <router-link to="/" class="btn btn-primary btn-lg">Go Home</router-link>
    </div>
  </main>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F6F3;
}
</style>
