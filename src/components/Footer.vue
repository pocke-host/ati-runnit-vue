<template>
  <footer class="rk-footer">

    <!-- Top band: brand + tagline -->
    <div class="rk-footer-top">
      <div class="rk-footer-inner">
        <div class="rk-footer-brand-col">
          <span class="rk-footer-wordmark">RUNNIT<span class="rk-footer-dot">.</span></span>
          <p class="rk-footer-tagline">Every mile, on the record.</p>
          <div class="rk-footer-socials">
            <a href="#" class="rk-footer-social" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="#" class="rk-footer-social" aria-label="Twitter / X">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" class="rk-footer-social" aria-label="Strava">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
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
    </div>

    <!-- Bottom bar: copyright -->
    <div class="rk-footer-bottom">
      <div class="rk-footer-inner">
        <span class="rk-footer-copy">&copy; {{ year }} Runnit, Inc. All rights reserved.</span>
        <span class="rk-footer-made">Made by athletes, for athletes.</span>
      </div>
    </div>

  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.rk-footer {
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  border-top: 2px solid rgba(251, 246, 236, 0.12);
}

.rk-footer-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px;
}

/* Top section */
.rk-footer-top {
  padding: 56px 0 48px;
  border-bottom: 2px solid rgba(251, 246, 236, 0.1);
}
.rk-footer-top .rk-footer-inner {
  display: flex;
  gap: 64px;
  align-items: flex-start;
}

/* Brand column */
.rk-footer-brand-col {
  flex-shrink: 0;
  min-width: 180px;
}
.rk-footer-wordmark {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.6rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #FBF6EC;
  display: block;
  margin-bottom: 10px;
}
.rk-footer-dot { color: #2A55F5; }

.rk-footer-tagline {
  font-size: 0.88rem;
  color: rgba(251, 246, 236, 0.55);
  margin: 0 0 24px;
  line-height: 1.5;
}

/* Socials */
.rk-footer-socials {
  display: flex;
  gap: 10px;
}
.rk-footer-social {
  width: 34px;
  height: 34px;
  border: 2px solid rgba(251, 246, 236, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(251, 246, 236, 0.55);
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}
.rk-footer-social:hover {
  border-color: #2A55F5;
  color: #2A55F5;
}

/* Nav columns */
.rk-footer-nav {
  display: flex;
  gap: 48px;
  flex: 1;
  flex-wrap: wrap;
}
.rk-footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
}
.rk-footer-col-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.35);
  margin-bottom: 4px;
}
.rk-footer-link {
  font-size: 0.88rem;
  color: rgba(251, 246, 236, 0.65);
  text-decoration: none;
  transition: color 0.15s;
  line-height: 1;
}
.rk-footer-link:hover { color: #FBF6EC; }
.rk-footer-link.router-link-active { color: #2A55F5; }

/* Bottom bar */
.rk-footer-bottom {
  padding: 18px 0;
}
.rk-footer-bottom .rk-footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.rk-footer-copy,
.rk-footer-made {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.3);
}

/* Mobile */
@media (max-width: 768px) {
  .rk-footer-top .rk-footer-inner {
    flex-direction: column;
    gap: 40px;
  }
  .rk-footer-nav { gap: 32px; }
}
@media (max-width: 640px) {
  .rk-footer-inner { padding: 0 20px; }
  .rk-footer-top { padding: 40px 0 36px; }
  .rk-footer-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px 20px;
  }
  .rk-footer-bottom .rk-footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
