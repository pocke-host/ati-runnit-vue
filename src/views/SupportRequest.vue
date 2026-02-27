<!-- src/pages/SupportRequest.vue -->
<template>
  <main class="request-page">
    <!-- Header -->
    <section class="hero">
      <div class="container-xxl text-center">
        <p class="kicker mb-2">Support queue</p>
        <h1 class="fw-bold mb-2">Submit a Request</h1>
        <p class="lead m-0">
          Tell us what’s up — we’ll get you unstuck and back to moving.
        </p>
      </div>
    </section>

    <!-- Form -->
    <section class="form-section">
      <div class="container-xxl">
        <form class="request-form" @submit.prevent="onSubmit">
          <div class="panel">
            <div class="panel-top">
              <div class="panel-title">
                <span class="dot"></span>
                <span>RUNNIT Support</span>
              </div>
              <span class="panel-status">ONLINE</span>
            </div>

            <div class="panel-body">
              <!-- Name -->
              <div class="mb-3">
                <label for="name" class="form-label">Full Name</label>
                <input
                  id="name"
                  v-model.trim="name"
                  type="text"
                  class="form-control"
                  placeholder="Enter your name"
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
                  <option>Account / Join Us</option>
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
                  placeholder="Short summary (ex: Can’t log in)"
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
                  placeholder="What happened? What did you expect? Any steps to reproduce?"
                  required
                ></textarea>
                <div class="hint mt-2">
                  Pro tip: include device + browser (ex: iPhone 15 / Safari).
                </div>
              </div>

              <!-- File upload -->
              <div class="mb-3">
                <label for="screenshot" class="form-label">Attachments (optional)</label>
                <input id="screenshot" type="file" class="form-control" multiple />
              </div>

              <!-- Submit -->
              <button class="btn btn-primary w-100">Submit Request</button>

              <div v-if="submitted" class="alert alert-success mt-3 mb-0" role="status">
                ✅ Request received. We’ll get back to you soon.
              </div>
            </div>
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
  submitted.value = true
  setTimeout(() => (submitted.value = false), 4000)
}
</script>

<style scoped>
/* ===== RUNNIT Brand Tokens (page-local) ===== */
.request-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  --nav-h: 72px;
  --footer-h: 40px;

  padding-top: var(--nav-h);
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  background: var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* ===== HERO: cinematic + subtle “simulation” feel ===== */
.hero{
  padding: 52px 0 40px;
  color: var(--r-white);
  border-bottom: 1px solid rgba(255,255,255,0.10);
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.12), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
}
.kicker{
  letter-spacing: .18em;
  text-transform: uppercase;
  font-weight: 900;
  font-size: .78rem;
  color: rgba(255,255,255,0.82);
}
.hero :deep(.lead){
  color: rgba(255,255,255,0.78) !important;
}

/* ===== FORM SECTION ===== */
.form-section{ padding: 34px 0 64px; }
.request-form{ max-width: 720px; margin: 0 auto; }

/* “Control panel” container (feel like a system, not literal) */
.panel{
  border-radius: 18px;
  background:
    radial-gradient(900px 360px at 30% 0%, rgba(90,107,78,0.18), rgba(90,107,78,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.50));
  border: 1px solid rgba(15,18,16,0.12);
  box-shadow: 0 18px 50px rgba(15,18,16,0.10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

.panel-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding: 14px 16px;
  background: rgba(15,18,16,0.06);
  border-bottom: 1px solid rgba(15,18,16,0.10);
}
.panel-title{
  display:flex;
  align-items:center;
  gap:10px;
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
  font-size: .78rem;
  color: rgba(15,18,16,0.78);
}
.panel-title .dot{
  width:10px; height:10px; border-radius:50%;
  background: rgba(196,106,42,0.95);
  box-shadow: 0 0 0 4px rgba(196,106,42,0.16);
}
.panel-status{
  font-weight: 900;
  font-size: .74rem;
  letter-spacing: .14em;
  color: rgba(15,18,16,0.70);
}

.panel-body{ padding: 18px; }

/* Inputs */
.form-label{ font-weight: 800; color: rgba(15,18,16,0.78); }

.form-control,
.form-select{
  border-radius: 12px;
  border: 1px solid rgba(15,18,16,0.14);
  height: 46px;
  background: rgba(255,255,255,0.86);
}
textarea.form-control{
  height: auto;
  min-height: 140px;
  resize: vertical;
}

.form-control:focus,
.form-select:focus{
  border-color: rgba(196,106,42,0.75);
  box-shadow: 0 0 0 4px rgba(196,106,42,0.18);
}

/* Hint text */
.hint{
  font-size: .85rem;
  color: rgba(15,18,16,0.55);
}

/* Button */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(15,18,16,0.10);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(15,18,16,0.10);

  font-weight: 900;
  letter-spacing: .02em;
  height: 50px;
  border-radius: 14px;
}

/* Mobile spacing */
@media (max-width: 576px){
  .panel-body{ padding: 16px; }
}
</style>
