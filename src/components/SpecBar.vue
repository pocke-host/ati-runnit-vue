<template>
  <div class="rk-ticker">
    <div class="rk-ticker-track">
      <span class="rk-ticker-text">&nbsp;★&nbsp; NO OFF-SEASON &nbsp;★&nbsp; MILES ARE BETTER SHARED &nbsp;★&nbsp; DRAG YOUR CREW OUT AT 6AM &nbsp;★&nbsp; BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
      <span class="rk-ticker-text">&nbsp;★&nbsp; NO OFF-SEASON &nbsp;★&nbsp; MILES ARE BETTER SHARED &nbsp;★&nbsp; DRAG YOUR CREW OUT AT 6AM &nbsp;★&nbsp; BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
    </div>
  </div>
</template>

<style scoped>
.rk-ticker {
  background: #16130F;
  border-bottom: 3px solid #2A55F5;
  overflow: hidden;
}
.rk-ticker-track {
  display: flex;
  white-space: nowrap;
  animation: rkMarq 26s linear infinite;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #FBF6EC;
  padding: 9px 0;
}
@media (prefers-reduced-motion: reduce) {
  .rk-ticker-track { animation: none; }
}
</style>
