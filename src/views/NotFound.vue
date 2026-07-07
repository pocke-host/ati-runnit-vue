<template>
  <main class="notfound-page">
    <!-- Ticker -->
    <div class="nf-ticker" aria-hidden="true">
      <div class="nf-ticker-track">
        <span>&nbsp;★ WRONG TURN &nbsp;★ OFF THE ROUTE &nbsp;★ RECALCULATING &nbsp;★ WRONG TURN &nbsp;★ OFF THE ROUTE &nbsp;★ RECALCULATING &nbsp;</span>
        <span>&nbsp;★ WRONG TURN &nbsp;★ OFF THE ROUTE &nbsp;★ RECALCULATING &nbsp;★ WRONG TURN &nbsp;★ OFF THE ROUTE &nbsp;★ RECALCULATING &nbsp;</span>
      </div>
    </div>

    <div class="notfound-inner">
      <div class="notfound-code">404</div>
      <h1 class="notfound-title">You went off route.</h1>
      <p class="notfound-sub">This page isn't on the map. Let's get you back on course.</p>
      <router-link to="/" class="notfound-btn">Back to Home</router-link>
    </div>
  </main>
</template>

<style scoped>
@keyframes rkMarq { from { transform: translateX(0) } to { transform: translateX(-50%) } }

.notfound-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.nf-ticker {
  background: #16130F;
  border-bottom: 3px solid #2A55F5;
  overflow: hidden;
}
.nf-ticker-track {
  display: flex;
  white-space: nowrap;
  animation: rkMarq 22s linear infinite;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #FBF6EC;
  padding: 7px 0;
}
@media (prefers-reduced-motion: reduce) { .nf-ticker-track { animation: none; } }

.notfound-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 24px;
}

.notfound-code {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(80px, 20vw, 120px);
  font-weight: 900;
  line-height: 0.85;
  color: #2A55F5;
  margin-bottom: 20px;
}

.notfound-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(28px, 6vw, 40px);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.9;
  color: #FBF6EC;
  margin: 0 0 16px;
}

.notfound-sub {
  font-size: 0.95rem;
  color: rgba(251, 246, 236, 0.68);
  line-height: 1.6;
  margin: 0 0 36px;
  max-width: 360px;
}

.notfound-btn {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  text-decoration: none;
  padding: 15px 36px;
  border: 2px solid #FBF6EC;
  border-radius: 999px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 rgba(251, 246, 236, 0.3);
  transition: background 0.15s;
}
.notfound-btn:hover { background: #1E42D6; }
</style>
