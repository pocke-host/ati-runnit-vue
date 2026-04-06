<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">RUNNIT</div>
        <div class="footer-tagline">Movement with purpose.</div>
        <a href="https://www.instagram.com/runnit.co" class="footer-social" target="_blank" rel="noopener">
          <i class="bi bi-instagram"></i>
        </a>
      </div>

      <nav class="footer-nav" @click.capture="scrollTop">
        <div class="footer-col">
          <div class="footer-col-label">Explore</div>
          <router-link to="/maps" class="footer-link">Maps</router-link>
          <router-link to="/challenges" class="footer-link">Challenges</router-link>
          <router-link to="/subscribe" class="footer-link">Subscription</router-link>
        </div>
        <div class="footer-col">
          <div class="footer-col-label">Community</div>
          <router-link to="/clubs" class="footer-link">Clubs</router-link>
          <router-link to="/races" class="footer-link">Events</router-link>
          <router-link to="/support" class="footer-link">Support</router-link>
        </div>
        <div class="footer-col">
          <div class="footer-col-label">Company</div>
          <router-link to="/about" class="footer-link">About</router-link>
          <router-link to="/careers" class="footer-link">Careers</router-link>
          <router-link to="/blog" class="footer-link">Blog</router-link>
        </div>
        <div class="footer-col">
          <div class="footer-col-label">Legal</div>
          <router-link to="/privacy" class="footer-link">Privacy Policy</router-link>
          <router-link to="/terms" class="footer-link">Terms of Service</router-link>
          <router-link to="/cookies" class="footer-link">Cookie Policy</router-link>
        </div>
      </nav>
    </div>

    <div class="footer-bottom">
      <span>© 2026 RUNNIT. All rights reserved.</span>
    </div>
  </footer>
</template>

<script setup>
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<style scoped>
.site-footer {
  background: #000;
  color: #fff;
  padding: 56px 24px 0;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.10);
}

.footer-logo {
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  margin-bottom: 8px;
}
.footer-tagline {
  font-size: 0.80rem;
  color: rgba(255,255,255,0.45);
  margin-bottom: 20px;
  line-height: 1.5;
}
.footer-social {
  color: rgba(255,255,255,0.50);
  font-size: 1.1rem;
  text-decoration: none;
  transition: color 0.15s;
}
.footer-social:hover { color: #fff; }

.footer-nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.footer-col-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-bottom: 14px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.60);
  text-decoration: none;
  transition: color 0.15s;
  line-height: 1;
}
.footer-link:hover { color: #fff; }

.footer-bottom {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 0 24px;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.30);
  letter-spacing: 0.04em;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .footer-nav {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }
}

@media (max-width: 480px) {
  .footer-nav {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
