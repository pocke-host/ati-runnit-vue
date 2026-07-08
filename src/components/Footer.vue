<template>
  <footer class="rk-footer" @click="scrollTop">

    <!-- CTA cap -->
    <div class="rk-footer-cta">
      <div class="rk-footer-cta-headline">Lace Up.</div>
      <div class="rk-footer-cta-sub">Claim your @handle and bring the friend who always flakes.</div>
      <div class="rk-footer-cta-form">
        <span class="rk-footer-cta-input">you@email.com</span>
        <router-link to="/waitlist" class="rk-footer-cta-btn">Join →</router-link>
      </div>
    </div>

    <!-- Ticker seam -->
    <div class="rk-footer-ticker-wrap">
      <div class="rk-footer-ticker">
        <span>&nbsp;★ MILES ARE BETTER SHARED ★ NO OFF-SEASON ★ DRAG YOUR CREW OUT AT 6AM ★ PROOF OR IT DIDN'T HAPPEN&nbsp;</span>
        <span>&nbsp;★ MILES ARE BETTER SHARED ★ NO OFF-SEASON ★ DRAG YOUR CREW OUT AT 6AM ★ PROOF OR IT DIDN'T HAPPEN&nbsp;</span>
      </div>
    </div>

    <!-- Main columns -->
    <div class="rk-footer-main">
      <!-- Brand column -->
      <div class="rk-footer-brand-col">
        <span class="rk-footer-wordmark">RUNNIT<span class="rk-footer-dot">.</span></span>
        <p class="rk-footer-tagline">Every mile, on the record.</p>
        <div class="rk-footer-socials">
          <a href="https://www.instagram.com/runnit.co" target="_blank" rel="noopener noreferrer" class="rk-footer-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" class="rk-footer-social" aria-label="Twitter / X">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M18.2 2H21l-6.6 7.5L22 22h-6.2l-4.3-6-4.9 6H2l7-8.5L2 2h6.3l3.9 5.5L18.2 2Zm-1 18h1.6L7.6 3.7H5.9L17.2 20Z"/></svg>
          </a>
          <a href="#" class="rk-footer-social" aria-label="Strava">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.8 2 7.5 14h3.7l2.6-5 2.6 5h3.6L13.8 2ZM13.8 22l2.6-5h-1.9l-.7 1.4-.7-1.4H9.2l2.6 5h2Z"/></svg>
          </a>
        </div>
      </div>

      <nav class="rk-footer-nav">
        <div class="rk-footer-col">
          <div class="rk-footer-col-label">Product</div>
          <router-link to="/features" class="rk-footer-link">Features</router-link>
          <router-link to="/subscribe" class="rk-footer-link">Pricing</router-link>
          <router-link to="/waitlist" class="rk-footer-link">Join Waitlist</router-link>
          <router-link to="/dashboard" class="rk-footer-link">Dashboard</router-link>
          <router-link to="/feed" class="rk-footer-link">Feed</router-link>
        </div>
        <div class="rk-footer-col">
          <div class="rk-footer-col-label">Company</div>
          <router-link to="/about" class="rk-footer-link">About</router-link>
          <router-link to="/blog" class="rk-footer-link">Blog</router-link>
          <router-link to="/careers" class="rk-footer-link">Careers</router-link>
          <router-link to="/press" class="rk-footer-link">Press</router-link>
          <router-link to="/support" class="rk-footer-link">Support</router-link>
        </div>
        <div class="rk-footer-col">
          <div class="rk-footer-col-label">Legal</div>
          <router-link to="/privacy" class="rk-footer-link">Privacy Policy</router-link>
          <router-link to="/terms" class="rk-footer-link">Terms of Service</router-link>
          <router-link to="/cookies" class="rk-footer-link">Cookie Policy</router-link>
        </div>
      </nav>
    </div>

    <!-- Legal bar -->
    <div class="rk-footer-bottom">
      <div class="rk-footer-bottom-inner">
        <span class="rk-footer-copy">&copy; {{ year }} Runnit, Inc. All rights reserved.</span>
        <span class="rk-footer-made">Made by athletes, for athletes<span class="rk-footer-spark"> ✦</span></span>
      </div>
    </div>

  </footer>
</template>

<script>
export default {
  methods: {
    scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }
}
</script>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.rk-footer {
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  cursor: default;
}

/* ── CTA Cap ── */
.rk-footer-cta {
  background: #2A55F5;
  color: #fff;
  text-align: center;
  padding: 46px 32px 42px;
}
.rk-footer-cta-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(3.5rem, 8vw, 6rem);
  line-height: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.01em;
}
.rk-footer-cta-sub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
  margin: 14px 0 22px;
}
.rk-footer-cta-form {
  display: inline-flex;
  max-width: 520px;
  width: 100%;
  border: 2px solid #16130F;
  background: #FBF6EC;
}
.rk-footer-cta-input {
  flex: 1;
  padding: 15px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.92rem;
  font-weight: 500;
  color: #8a8a8a;
  text-align: left;
}
.rk-footer-cta-btn {
  background: #16130F;
  color: #FBF6EC;
  padding: 15px 24px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  flex-shrink: 0;
  transition: opacity 0.15s;
}
.rk-footer-cta-btn:hover { opacity: 0.8; }

/* ── Ticker Seam ── */
.rk-footer-ticker-wrap {
  background: #16130F;
  overflow: hidden;
  border-top: 3px solid #2A55F5;
  border-bottom: 2px solid rgba(251, 246, 236, 0.15);
}
.rk-footer-ticker {
  display: flex;
  white-space: nowrap;
  animation: rkMarq 26s linear infinite;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.55);
  padding: 9px 0;
}

@keyframes rkMarq {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Main columns ── */
.rk-footer-main {
  background: #16130F;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
}

/* Brand column */
.rk-footer-brand-col {
  padding: 40px 32px;
  border-right: 2px solid rgba(251, 246, 236, 0.12);
}
.rk-footer-wordmark {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 2.5rem;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: #FBF6EC;
  display: block;
  margin-bottom: 14px;
}
.rk-footer-dot { color: #2A55F5; }
.rk-footer-tagline {
  font-size: 0.82rem;
  color: rgba(251, 246, 236, 0.6);
  margin: 0 0 22px;
  line-height: 1.5;
}

/* Socials */
.rk-footer-socials { display: flex; gap: 10px; }
.rk-footer-social {
  width: 42px;
  height: 42px;
  border: 2px solid rgba(251, 246, 236, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FBF6EC;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.rk-footer-social:hover { border-color: #2A55F5; color: #2A55F5; }

/* Nav columns */
.rk-footer-nav { display: contents; }
.rk-footer-col {
  display: flex;
  flex-direction: column;
  gap: 13px;
  padding: 40px 28px;
  border-right: 2px solid rgba(251, 246, 236, 0.12);
}
.rk-footer-col:last-child { border-right: none; }
.rk-footer-col-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 5px;
}
.rk-footer-link {
  font-size: 0.92rem;
  font-weight: 500;
  color: rgba(251, 246, 236, 0.8);
  text-decoration: none;
  transition: color 0.15s;
  line-height: 1;
}
.rk-footer-link:hover { color: #2A55F5; }
.rk-footer-link.router-link-active { color: #2A55F5; }

/* Legal bar */
.rk-footer-bottom {
  background: #16130F;
  border-top: 2px solid rgba(251, 246, 236, 0.15);
}
.rk-footer-bottom-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 32px;
  gap: 16px;
}
.rk-footer-copy {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.5);
}
.rk-footer-made {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #FBF6EC;
}
.rk-footer-spark { color: #2A55F5; }

/* Mobile */
@media (max-width: 768px) {
  .rk-footer-cta { padding: 36px 20px 32px; }
  .rk-footer-cta-headline { font-size: 3.5rem; }
  .rk-footer-main { grid-template-columns: 1fr; }
  .rk-footer-brand-col {
    padding: 28px 20px 18px;
    border-right: none;
    border-bottom: 2px solid rgba(251, 246, 236, 0.12);
  }
  .rk-footer-nav { display: grid; grid-template-columns: 1fr 1fr; }
  .rk-footer-col {
    padding: 22px 20px;
    border-right: none;
    border-bottom: 2px solid rgba(251, 246, 236, 0.12);
    gap: 11px;
  }
  .rk-footer-col:nth-child(odd) { border-right: 2px solid rgba(251, 246, 236, 0.12); }
  .rk-footer-bottom-inner {
    padding: 18px 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
