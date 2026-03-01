<template>
  <footer class="footer mt-auto">
    <div class="container-xxl">
      <div class="row">
        <div class="col-md-3 mb-3">
          <h5 class="fw-bold">RUNNIT</h5>
          <p class="small">Movement with purpose.</p>
        </div>
        <div class="col-6 col-md-2 mb-3">
          <h6 class="fw-bold">Explore</h6>
          <ul class="list-unstyled">
            <li><router-link to="/features" class="footer-link">Features</router-link></li>
            <li><router-link to="/maps" class="footer-link">Maps</router-link></li>
            <li><router-link to="/challenges" class="footer-link">Challenges</router-link></li>
            <li><router-link to="/subscribe" class="footer-link">Subscription</router-link></li>
          </ul>
        </div>
        <div class="col-6 col-md-2 mb-3">
          <h6 class="fw-bold">Community</h6>
          <ul class="list-unstyled">
            <li><router-link to="/feed" class="footer-link">Athletes</router-link></li>
            <li><router-link to="/clubs" class="footer-link">Clubs</router-link></li>
            <li><router-link to="/races" class="footer-link">Events</router-link></li>
            <li><router-link to="/support" class="footer-link">Support</router-link></li>
          </ul>
        </div>
        <div class="col-6 col-md-2 mb-3">
          <h6 class="fw-bold">Company</h6>
          <ul class="list-unstyled">
            <li><router-link to="/about" class="footer-link">About</router-link></li>
            <li><a href="#" class="footer-link">Careers</a></li>
            <li><a href="#" class="footer-link">Press</a></li>
            <li><a href="#" class="footer-link">Blog</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <h6 class="fw-bold">Legal</h6>
          <ul class="list-unstyled">
            <li><router-link to="/privacy" class="footer-link">Privacy Policy</router-link></li>
            <li><router-link to="/terms" class="footer-link">Terms of Service</router-link></li>
            <li><router-link to="/cookies" class="footer-link">Cookie Policy</router-link></li>
          </ul>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center border-top pt-3 mt-3">
        <p class="small mb-0">© 2026 RUNNIT. All rights reserved.</p>
        <div>
          <a href="https://www.tiktok.com/@RUNNIT.app" class="footer-link me-3" target="_blank" rel="noopener">TikTok</a>
          <a href="https://www.instagram.com/runnit.co" class="footer-link me-3" target="_blank" rel="noopener">Instagram</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--r-offwhite);
  color: var(--r-black);
  padding: 40px 0;
  font-size: 0.95rem;
  border-top: 1px solid rgba(15,18,16,0.08);
}

.footer h5, .footer h6 {
  color: var(--r-black);
}

.footer-link {
  color: rgba(15,18,16,0.70);
  text-decoration: none;
  transition: color .2s ease;
}
.footer-link:hover {
  color: var(--r-accent);
}
</style>
