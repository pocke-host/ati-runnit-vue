<!-- src/pages/SupportRequest.vue -->
<template>
    <main class="request-page">
      <!-- Header -->
      <section class="hero">
        <div class="container-xxl text-center">
          <h1 class="fw-bold">Submit a Request</h1>
          <p class="lead text-muted">
            Need help? Fill out the form below and we’ll get back to you.
          </p>
        </div>
      </section>
  
      <!-- Form -->
      <section class="form-section">
        <div class="container-xxl">
          <form class="request-form" @submit.prevent="onSubmit">
            <!-- Name -->
            <div class="mb-3">
              <label for="name" class="form-label">Full Name</label>
              <input
                id="name"
                v-model.trim="name"
                type="text"
                class="form-control"
                placeholder="Enter Your Name Here"
                required
              />
            </div>
  
            <!-- Email -->
            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model.trim="email"
                type="email"
                class="form-control"
                placeholder="you@example.com"
                required
              />
            </div>
  
            <!-- Category -->
            <div class="mb-3">
              <label for="category" class="form-label">Category</label>
              <select id="category" v-model="category" class="form-select" required>
                <option disabled value="">Select a category</option>
                <option>Account/Login Issues</option>
                <option>Billing & Subscription</option>
                <option>Technical Bug</option>
                <option>Feature Request</option>
                <option>Other</option>
              </select>
            </div>
  
            <!-- Subject -->
            <div class="mb-3">
              <label for="subject" class="form-label">Subject</label>
              <input
                id="subject"
                v-model.trim="subject"
                type="text"
                class="form-control"
                placeholder="Short summary of your issue"
                required
              />
            </div>
  
            <!-- Description -->
            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea
                id="description"
                v-model.trim="description"
                rows="5"
                class="form-control"
                placeholder="Tell us more about your issue..."
                required
              ></textarea>
            </div>
  
            <!-- File upload -->
            <div class="mb-3">
              <label for="screenshot" class="form-label">Attachments (optional)</label>
              <input
                id="screenshot"
                type="file"
                class="form-control"
                multiple
              />
            </div>
  
            <!-- Submit -->
            <button class="btn btn-primary w-100">Submit Request</button>
  
            <div v-if="submitted" class="alert alert-success mt-3">
              ✅ Your request has been submitted! We’ll get back to you soon.
            </div>
          </form>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const name = ref('')
  const email = ref('')
  const category = ref('')
  const subject = ref('')
  const description = ref('')
  const submitted = ref(false)
  
  const onSubmit = () => {
    // For now, just fake a success message
    submitted.value = true
    setTimeout(() => (submitted.value = false), 4000)
  }
  </script>
  
  <style scoped>
  .request-page {
    --nav-h: 60px;
    padding-top: var(--nav-h); 
    --footer-h: 40px;
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    background: #fff;
  }
  
  .hero {
    padding: 48px 0 32px;
    background: #f7f5f2;
    border-bottom: 1px solid #eee;
  }
  
  .form-section {
    padding: 32px 0 64px;
  }
  
  .request-form {
    max-width: 640px;
    margin: 0 auto;
  }
  
  /* Inputs */
  .form-control,
  .form-select {
    border-radius: 8px;
    border: 1px solid #ddd;
    height: 44px;
  }
  textarea.form-control {
    height: auto;
  }
  .form-control:focus,
  .form-select:focus {
    border-color: #800080;
    box-shadow: 0 0 0 3px rgba(128, 0, 128, 0.2);
  }
  
  /* Button */
  .btn-primary {
    --bs-btn-bg: #800080;
    --bs-btn-border-color: #800080;
    --bs-btn-hover-bg: #6a006a;
    --bs-btn-hover-border-color: #6a006a;
    font-weight: 600;
    height: 48px;
    border-radius: 8px;
  }
  </style>
  