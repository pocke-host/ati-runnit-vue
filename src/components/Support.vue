<!-- src/pages/Support.vue -->
<template>
    <main class="support-page">
      <!-- Header -->
      <section class="hero">
        <div class="container-xxl">
          <h1 class="display-5 fw-bold">Support</h1>
          <p class="lead text-muted">Find answers or get in touch with our team.</p>
        </div>
      </section>
  
      <!-- Featured Articles -->
      <section class="help-list">
        <div class="container-xxl">
          <h2 class="h4 mb-3">Featured help topics</h2>
          <ul class="list-unstyled row g-3">
            <li class="col-md-6" v-for="item in articles" :key="item.title">
              <a href="#" class="help-link d-flex align-items-center p-3 rounded-3">
                <i class="bi bi-file-earmark-text me-3 fs-3"></i>
                <div>
                  <strong>{{ item.title }}</strong>
                  <p class="small text-muted mb-0">{{ item.subtitle }}</p>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </section>
  
      <!-- Footer CTA -->
      <section class="cta">
        <div class="container-xxl text-center">
          <p class="mb-2">Can’t find what you're looking for?</p>
          <router-link to="/request" class="btn btn-outline-primary">Submit a Request</router-link>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  const articles = [
    { title: 'Login Problems on iOS?', subtitle: 'Known issue for app version 4.25' },
    { title: 'How are distances calculated?', subtitle: 'Understand how we measure activity distance' },
    { title: 'How to cancel your subscription', subtitle: 'Steps to cancel or manage billing' },
    { title: 'Data and privacy', subtitle: 'Your choices and our commitments' }
  ]
  </script>
  
  <style scoped>
  .support-page {
    --nav-h: 60px;
    --footer-h: 40px;
    padding-top: var(--nav-h); 
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    background: #fff;
  }
  
  .hero {
    padding: 48px 0;
    background: #f7f5f2;
    border-bottom: 1px solid #eee;
    text-align: center;
  }
  .hero .btn-primary {
    --bs-btn-bg: #800080;
    --bs-btn-border-color: #800080;
    --bs-btn-hover-bg: #6a006a;
    --bs-btn-hover-border-color: #6a006a;
  }
  
  .help-list {
    padding: 32px 0;
  }
  .help-link {
    text-decoration: none;
    color: inherit;
    background: #faf9f8;
    transition: background .2s;
  }
  .help-link:hover {
    background: #f0eff0;
  }
  
  .cta {
    padding: 32px 0;
    background: #f7f5f2;
  }
  .btn-outline-primary {
    --bs-btn-border-color: #800080;
    --bs-btn-color: #800080;
  }
  .btn-outline-primary:hover {
    background: #800080;
    color: #fff;
  }
  </style>
  