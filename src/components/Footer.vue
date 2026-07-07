<template>
  <footer class="rk-footer">
    <div class="rk-footer-inner">
      <span class="rk-footer-brand">RUNNIT<span class="rk-footer-dot">.</span></span>
      <span class="rk-footer-tagline">Made by runners, for runners</span>
      <span class="rk-footer-copy">&copy; MMXXVI</span>
    </div>
  </footer>
</template>

<style scoped>
.rk-footer {
  background: #16130F;
}
.rk-footer-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 22px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.6);
}
.rk-footer-brand {
  color: #FBF6EC;
  font-weight: 700;
}
.rk-footer-dot {
  color: #2A55F5;
}

@media (max-width: 640px) {
  .rk-footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 20px 22px;
  }
}
</style>
