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
  link: [{ rel: 'canonical', href: 'https://runnit.live/blog' }],
  meta: [
    { name: 'description', content: 'Training intel for serious athletes. Science, strategy, and stories on running, racing, periodization, and everything in between.' },
    { property: 'og:title', content: 'Blog — Runnit' },
    { property: 'og:description', content: 'Science, stories, and strategy for athletes who take their training seriously.' },
    { property: 'og:url', content: 'https://runnit.live/blog' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Blog — Runnit' },
    { name: 'twitter:description', content: 'Science, stories, and strategy for athletes who take their training seriously.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
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
  padding-top: var(--nav-h, 66px);
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.ep-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 80px 24px 72px;
}
.ep-hero-inner {
  max-width: 900px;
  margin: 0 auto;
}
.ep-kicker {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
  margin-bottom: 24px;
}
.ep-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(2.4rem, 7vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.88;
  margin: 0 0 24px;
}
.ep-sub {
  font-size: 1.05rem;
  color: rgba(251,246,236,0.72);
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
  border: 2px solid #16130F;
  box-shadow: 4px 4px 0 #16130F;
  padding: 32px;
  margin-bottom: 32px;
  background: #fff;
}
.post-category {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin-bottom: 12px;
}
.post-featured-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  margin: 0 0 14px;
  color: #16130F;
}
.post-excerpt {
  font-size: 0.95rem;
  color: #5A5348;
  line-height: 1.65;
  margin: 0 0 16px;
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: #8A8A8A;
}
.post-author { font-weight: 700; color: #5A5348; }
.post-dot { color: #E7DFCE; }

.post-featured-img {
  height: 200px;
  background: #F1EADC;
  border: 2px solid #E7DFCE;
  display: flex;
  align-items: center;
  justify-content: center;
}
.img-placeholder { font-size: 4rem; }

/* Post grid */
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  background: #E7DFCE;
  border: 2px solid #16130F;
  margin-bottom: 40px;
}
.post-card {
  background: #fff;
  display: flex;
  flex-direction: column;
}
.post-card-img {
  height: 120px;
  background: #F1EADC;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #E7DFCE;
}
.img-placeholder-sm { font-size: 2.5rem; }
.post-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
.post-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.05rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.92;
  margin: 0 0 8px;
  color: #16130F;
}
.post-excerpt-sm {
  font-size: 0.83rem;
  color: #5A5348;
  line-height: 1.55;
  margin: 0 0 auto;
  padding-bottom: 14px;
}

/* Newsletter */
.newsletter-cta {
  background: #16130F;
  color: #FBF6EC;
  border: 2px solid #16130F;
  box-shadow: 4px 4px 0 #2A55F5;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}
.newsletter-text h3 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.9;
  margin: 0 0 10px;
}
.newsletter-text p {
  font-size: 0.88rem;
  color: rgba(251,246,236,0.65);
  margin: 0;
}
.newsletter-form {
  display: flex;
  gap: 0;
  flex-shrink: 0;
  border: 2px solid rgba(251,246,236,0.3);
}
.newsletter-input {
  padding: 12px 16px;
  border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.85rem;
  width: 240px;
  background: rgba(251,246,236,0.10);
  color: #FBF6EC;
  outline: none;
}
.newsletter-input::placeholder { color: rgba(251,246,236,0.35); }
.newsletter-btn {
  background: #2A55F5;
  color: #fff;
  border: none;
  padding: 12px 20px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.newsletter-btn:hover { background: #1E42D6; }

@media (max-width: 768px) {
  .post-featured { grid-template-columns: 1fr; }
  .post-featured-img { display: none; }
  .post-grid { grid-template-columns: 1fr; }
  .newsletter-cta { flex-direction: column; align-items: flex-start; }
  .newsletter-form { width: 100%; border: 2px solid rgba(251,246,236,0.3); }
  .newsletter-input { flex: 1; width: auto; }
}
</style>
