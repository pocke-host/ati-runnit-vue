<template>
  <main class="notfound-page">

    <!-- Ticker -->
    <div class="notfound-ticker-wrap" aria-hidden="true">
      <div class="notfound-ticker">
        <span>&nbsp;★ WRONG TURN ★ OFF THE ROUTE ★ RECALCULATING ★ WRONG TURN ★ OFF THE ROUTE ★ RECALCULATING&nbsp;</span>
        <span>&nbsp;★ WRONG TURN ★ OFF THE ROUTE ★ RECALCULATING ★ WRONG TURN ★ OFF THE ROUTE ★ RECALCULATING&nbsp;</span>
      </div>
    </div>

    <div class="notfound-inner">
      <div class="notfound-code">404</div>
      <h1 class="notfound-title">You went off route.</h1>
      <p class="notfound-sub">This page isn't on the map. Double-check the link or head back to the start line.</p>
      <router-link to="/" class="notfound-btn">Back to Home</router-link>
    </div>
  </main>
</template>

<style scoped>
.notfound-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

/* Ticker */
.notfound-ticker-wrap {
  background: #16130F;
  overflow: hidden;
  border-top: 3px solid #2A55F5;
}
.notfound-ticker {
  display: flex;
  white-space: nowrap;
  animation: rkMarq 18s linear infinite;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.6);
  padding: 9px 0;
}

/* Content */
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
  font-size: clamp(8rem, 22vw, 14rem);
  font-weight: 900;
  line-height: 0.85;
  color: #2A55F5;
  margin-bottom: 16px;
  letter-spacing: 0.01em;
}

.notfound-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.9;
  margin: 0 0 16px;
  color: #FBF6EC;
}

.notfound-sub {
  font-size: 0.96rem;
  color: rgba(251, 246, 236, 0.6);
  line-height: 1.6;
  margin: 0 0 36px;
  max-width: 380px;
}

.notfound-btn {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  text-decoration: none;
  padding: 15px 32px;
  border: 2px solid #FBF6EC;
  border-radius: 999px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 rgba(251, 246, 236, 0.3);
  transition: background 0.15s;
}
.notfound-btn:hover { background: #1E42D6; text-decoration: none; }
</style>
