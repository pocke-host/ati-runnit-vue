<template>
  <div class="spec-bar">
    <div class="spec-bar-inner">
      <span class="spec-left">RUNNIT&reg; &mdash; Distance Division</span>
      <span class="spec-center">Social Training System</span>
      <span class="spec-right">Est. MMXXVI</span>
    </div>
  </div>
</template>

<style scoped>
.spec-bar {
  background: #000;
  color: #fff;
  width: 100%;
}
.spec-bar-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 9px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.spec-left  { color: #fff; }
.spec-center { color: rgba(255,255,255,0.5); }
.spec-right  { color: rgba(255,255,255,0.5); }

@media (max-width: 600px) {
  .spec-center { display: none; }
  .spec-bar-inner { justify-content: space-between; }
}
</style>
