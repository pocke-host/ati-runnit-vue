<template>
  <main class="notfound-page">
    <div class="notfound-inner">
      <div class="notfound-code">404</div>
      <h1 class="notfound-title">Page not found.</h1>
      <p class="notfound-sub">The page you're looking for doesn't exist or was moved.</p>
      <router-link to="/" class="notfound-btn">Go Home</router-link>
    </div>
  </main>
</template>

<style scoped>
.notfound-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--rk-paper, #ffffff);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  padding: 40px 24px;
}

.notfound-inner {
  text-align: center;
  max-width: 480px;
}

.notfound-code {
  font-size: clamp(6rem, 20vw, 10rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1;
  color: #000;
  margin-bottom: 16px;
}

.notfound-title {
  font-size: clamp(1.3rem, 4vw, 1.8rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  margin: 0 0 12px;
  color: #000;
}

.notfound-sub {
  font-size: 0.95rem;
  color: rgba(15,18,16,0.55);
  line-height: 1.6;
  margin: 0 0 32px;
}

.notfound-btn {
  display: inline-block;
  background: #000;
  color: #fff;
  text-decoration: none;
  padding: 14px 32px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: opacity 0.15s;
}
.notfound-btn:hover { opacity: 0.80; }
</style>
