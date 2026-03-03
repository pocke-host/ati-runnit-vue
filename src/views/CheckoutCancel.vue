<!-- src/views/CheckoutCancel.vue -->
<template>
  <main class="cancel-page">
    <div class="cancel-inner">
      <div class="cancel-icon"><i class="bi bi-x-lg"></i></div>
      <p class="cancel-eyebrow">PAYMENT CANCELLED</p>
      <h1 class="cancel-headline">No worries.</h1>
      <p class="cancel-sub">Your payment was cancelled. You have not been charged.</p>
      <router-link to="/subscribe" class="cancel-btn">Back to Plans →</router-link>
    </div>
  </main>
</template>

<script setup>
</script>

<style scoped>
.cancel-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  font-family: Futura, 'Avenir Next', system-ui, sans-serif;
}
.cancel-inner {
  text-align: center;
  max-width: 440px;
}
.cancel-icon {
  width: 64px;
  height: 64px;
  background: #f5f5f5;
  border: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #767676;
  margin: 0 auto 28px;
  border-radius: 0;
}
.cancel-eyebrow {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #767676;
  margin-bottom: 12px;
}
.cancel-headline {
  font-size: 3rem;
  font-weight: 800;
  color: #000;
  margin-bottom: 16px;
  line-height: 1;
}
.cancel-sub {
  font-size: 0.95rem;
  color: #767676;
  margin-bottom: 40px;
  line-height: 1.5;
}
.cancel-btn {
  display: inline-block;
  background: #000;
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 14px 32px;
  border-radius: 0;
  transition: background 0.15s;
}
.cancel-btn:hover { background: #333; }
</style>
