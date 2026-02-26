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
            <li><a href="/features" class="footer-link">Features</a></li>
            <li><a href="/maps" class="footer-link">Maps</a></li>
            <li><a href="/challenges" class="footer-link">Challenges</a></li>
            <li><a href="/subscribe" class="footer-link">Subscription</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-2 mb-3">
          <h6 class="fw-bold">Community</h6>
          <ul class="list-unstyled">
            <li><a href="#" class="footer-link">Athletes</a></li>
            <li><a href="#" class="footer-link">Clubs</a></li>
            <li><a href="#" class="footer-link">Events</a></li>
            <li><a href="/support" class="footer-link">Support</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-2 mb-3">
          <h6 class="fw-bold">Company</h6>
          <ul class="list-unstyled">
            <li><a href="/about" class="footer-link">About</a></li>
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
        <p class="small mb-0">© 2025 RUNNIT. All rights reserved.</p>
        <div>
          <a href="https://www.tiktok.com/@RUNNIT.app" class="footer-link me-3">Tiktok</a>
          <a href="https://www.instagram.com/runnit.co" class="footer-link me-3">Instagram</a>
          <a href="" class="footer-link">Facebook</a>
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
