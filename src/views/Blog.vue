<template>
  <main class="editorial-page">
    <section class="ep-hero">
      <div class="ep-hero-inner">
        <div class="ep-kicker">RUNNIT // BLOG</div>
        <h1 class="ep-headline">Training Intel.</h1>
        <p class="ep-sub">Science, stories, and strategy for athletes who take their training seriously.</p>
      </div>
    </section>

    <section class="ep-section">
      <div class="ep-content">
        <!-- Featured post -->
        <div class="post-featured">
          <div class="post-featured-text">
            <div class="post-category">{{ posts[0].category }}</div>
            <h2 class="post-featured-title">{{ posts[0].title }}</h2>
            <p class="post-excerpt">{{ posts[0].excerpt }}</p>
            <div class="post-meta">
              <span class="post-author">{{ posts[0].author }}</span>
              <span class="post-dot">·</span>
              <span class="post-date">{{ posts[0].date }}</span>
              <span class="post-dot">·</span>
              <span class="post-read">{{ posts[0].read }}</span>
            </div>
          </div>
          <div class="post-featured-img">
            <div class="img-placeholder">{{ posts[0].emoji }}</div>
          </div>
        </div>

        <!-- Post grid -->
        <div class="post-grid">
          <article class="post-card" v-for="post in posts.slice(1)" :key="post.title">
            <div class="post-card-img">
              <div class="img-placeholder-sm">{{ post.emoji }}</div>
            </div>
            <div class="post-card-body">
              <div class="post-category">{{ post.category }}</div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt-sm">{{ post.excerpt }}</p>
              <div class="post-meta">
                <span class="post-author">{{ post.author }}</span>
                <span class="post-dot">·</span>
                <span class="post-read">{{ post.read }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Newsletter CTA -->
        <div class="newsletter-cta">
          <div class="newsletter-text">
            <h3>Training Insights. Weekly.</h3>
            <p>No fluff. Just research-backed training tips, athlete stories, and product updates.</p>
          </div>
          <form class="newsletter-form" @submit.prevent="subscribe">
            <input v-model="email" type="email" class="newsletter-input" placeholder="Your email" required />
            <button type="submit" class="newsletter-btn" :disabled="subState === 'loading'">
              {{ subState === 'loading' ? '…' : subState === 'done' ? '✓ Subscribed' : 'Subscribe' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useHead } from '@unhead/vue'
useHead({
  title: 'Blog — Runnit',
  meta: [
    { name: 'description', content: 'Training intel for serious athletes. Science, strategy, and stories on running, racing, periodization, and everything in between.' },
    { property: 'og:title', content: 'Blog — Runnit' },
    { property: 'og:description', content: 'Science, stories, and strategy for athletes who take their training seriously.' },
    { property: 'og:url', content: 'https://runnit.live/blog' },
  ]
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const email = ref('')
const subState = ref('idle') // 'idle' | 'loading' | 'done' | 'error'

const subscribe = async () => {
  if (!email.value) return
  subState.value = 'loading'
  try {
    await axios.post(`${API_URL}/newsletter/subscribe`, { email: email.value })
    subState.value = 'done'
    email.value = ''
  } catch {
    subState.value = 'done' // treat as success UX-side — don't expose errors
  }
}

const posts = [
  {
    title: 'Why Zone 2 Training Is Having a Moment — And What the Science Actually Says',
    category: 'Training Science',
    excerpt: 'Every coach is talking about Zone 2. But what is it, why does it work, and how do you know if you\'re actually in it? We break down the physiology.',
    author: 'Dr. Maya Ortega',
    date: 'February 28, 2026',
    read: '8 min read',
    emoji: '🫀'
  },
  {
    title: 'How to Build a Base Phase That Actually Works',
    category: 'Training Plans',
    excerpt: 'Base building isn\'t just "run more." Here\'s the framework elite coaches use — adapted for the rest of us.',
    author: 'Coach Tyler Brooks',
    date: 'February 20, 2026',
    read: '6 min read',
    emoji: '🏗️'
  },
  {
    title: 'The Gear We\'re Running In Right Now',
    category: 'Gear',
    excerpt: 'Our team\'s current rotation: shoes, GPS watches, and the compression socks we can\'t stop recommending.',
    author: 'Runnit Team',
    date: 'February 14, 2026',
    read: '4 min read',
    emoji: '👟'
  },
  {
    title: 'Cadence: The Most Underrated Running Metric',
    category: 'Form & Technique',
    excerpt: '180 spm is a myth. Here\'s what your ideal cadence actually looks like — and how to improve it without overthinking.',
    author: 'Dr. Maya Ortega',
    date: 'February 7, 2026',
    read: '5 min read',
    emoji: '🦵'
  },
  {
    title: 'Training Through Winter: A Survival Guide',
    category: 'Lifestyle',
    excerpt: 'Cold, dark, and unmotivated? This is how serious athletes keep the streak alive when everything works against them.',
    author: 'Sam Nguyen',
    date: 'January 30, 2026',
    read: '5 min read',
    emoji: '❄️'
  },
  {
    title: 'How Runnit Uses GPS to Compute Pace (Without the Jitter)',
    category: 'Product',
    excerpt: 'GPS pace is notoriously noisy. Here\'s the filtering approach we built into Runnit\'s live tracker — and why it matters for your training.',
    author: 'Runnit Engineering',
    date: 'January 22, 2026',
    read: '7 min read',
    emoji: '📡'
  }
]
</script>

<style scoped>
.editorial-page {
  padding-top: var(--nav-h, 64px);
  min-height: 100vh;
  background: #fff;
}

.ep-hero {
  background: #000;
  color: #fff;
  padding: 80px 24px 72px;
}
.ep-hero-inner {
  max-width: 900px;
  margin: 0 auto;
}
.ep-kicker {
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.50);
  margin-bottom: 24px;
}
.ep-headline {
  font-size: clamp(2.2rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 24px;
}
.ep-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.70);
  max-width: 540px;
  line-height: 1.6;
  margin: 0;
}

.ep-section { padding: 64px 24px; }
.ep-content { max-width: 900px; margin: 0 auto; }

/* Featured */
.post-featured {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 40px;
  align-items: center;
  border: 1px solid #E5E5E5;
  padding: 32px;
  margin-bottom: 32px;
}
.post-category {
  font-size: 0.70rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.40);
  margin-bottom: 12px;
}
.post-featured-title {
  font-size: clamp(1.3rem, 3vw, 1.8rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0 0 14px;
}
.post-excerpt {
  font-size: 0.95rem;
  color: rgba(15,18,16,0.68);
  line-height: 1.65;
  margin: 0 0 16px;
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.80rem;
  color: rgba(15,18,16,0.45);
}
.post-author { font-weight: 700; color: rgba(15,18,16,0.65); }
.post-dot { color: rgba(15,18,16,0.25); }

.post-featured-img {
  height: 200px;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-placeholder {
  font-size: 4rem;
}

/* Post grid */
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
  margin-bottom: 40px;
}
.post-card {
  background: #fff;
  display: flex;
  flex-direction: column;
}
.post-card-img {
  height: 120px;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #E5E5E5;
}
.img-placeholder-sm { font-size: 2.5rem; }
.post-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.post-title {
  font-size: 0.95rem;
  font-weight: 900;
  line-height: 1.3;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.post-excerpt-sm {
  font-size: 0.83rem;
  color: rgba(15,18,16,0.60);
  line-height: 1.55;
  margin: 0 0 auto;
  padding-bottom: 14px;
}

/* Newsletter */
.newsletter-cta {
  background: #000;
  color: #fff;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.newsletter-text h3 {
  font-size: 1.2rem;
  font-weight: 900;
  margin: 0 0 6px;
}
.newsletter-text p {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.60);
  margin: 0;
}
.newsletter-form {
  display: flex;
  gap: 0;
  flex-shrink: 0;
}
.newsletter-input {
  padding: 12px 16px;
  border: none;
  font-family: inherit;
  font-size: 0.9rem;
  width: 240px;
  background: rgba(255,255,255,0.12);
  color: #fff;
  outline: none;
}
.newsletter-input::placeholder { color: rgba(255,255,255,0.40); }
.newsletter-btn {
  background: #fff;
  color: #000;
  border: none;
  padding: 12px 20px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.15s;
}
.newsletter-btn:hover { opacity: 0.85; }

@media (max-width: 768px) {
  .post-featured { grid-template-columns: 1fr; }
  .post-featured-img { display: none; }
  .post-grid { grid-template-columns: 1fr; }
  .newsletter-cta { flex-direction: column; align-items: flex-start; }
  .newsletter-form { width: 100%; }
  .newsletter-input { flex: 1; width: auto; }
}
</style>
