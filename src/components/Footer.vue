<template>
  <footer class="rk-footer">
    <div class="rk-footer-inner">
      <span class="rk-footer-brand">RUNNIT&reg;</span>
      <span class="rk-footer-tagline">Built For The Long Run</span>
      <span class="rk-footer-copy">&copy; MMXXVI</span>
    </div>
  </footer>
</template>

<style scoped>
.rk-footer {
  background: #fff;
  border-top: 1px solid #E5E5E5;
}
.rk-footer-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 28px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
}
.rk-footer-brand {
  color: #000;
  font-weight: 600;
}

@media (max-width: 480px) {
  .rk-footer-tagline { display: none; }
}
</style>
