<template>
  <main class="terms-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Terms of Service</h1>
        <p class="lead mb-0">Last updated: February 26, 2026</p>
      </div>
    </section>

    <!-- CONTENT -->
    <section class="content">
      <div class="container-xxl">
        <div class="content-grid">
          <!-- Sidebar TOC -->
          <aside class="toc">
            <p class="toc-label">On this page</p>
            <ul class="toc-list">
              <li v-for="section in sections" :key="section.id">
                <a :href="`#${section.id}`" class="toc-link">{{ section.title }}</a>
              </li>
            </ul>
          </aside>

          <!-- Terms Body -->
          <article class="terms-body">
            <section
              v-for="section in sections"
              :key="section.id"
              :id="section.id"
              class="terms-section"
            >
              <h2 class="section-title">{{ section.title }}</h2>
              <div v-for="(block, i) in section.blocks" :key="i">
                <h3 v-if="block.heading" class="block-heading">{{ block.heading }}</h3>
                <p v-if="block.text" class="block-text">{{ block.text }}</p>
                <ul v-if="block.list" class="block-list">
                  <li v-for="(item, j) in block.list" :key="j">{{ item }}</li>
                </ul>
              </div>
            </section>

            <!-- Contact box -->
            <div class="contact-box">
              <h3 class="contact-title">Have questions about these terms?</h3>
              <p class="contact-text">
                If you have any questions or need clarification on our terms, our support team is happy to help.
              </p>
              <router-link to="/support" class="btn-contact">Contact Support</router-link>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'
useHead({
  title: 'Terms of Service — Runnit',
  meta: [
    { name: 'description', content: 'Read the Runnit Terms of Service. Review our usage policies, account terms, and guidelines for the Runnit training platform.' },
    { property: 'og:title', content: 'Terms of Service — Runnit' },
    { property: 'og:url', content: 'https://runnit.live/terms' },
  ]
})

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    blocks: [
      {
        text: 'By accessing or using RUNNIT ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.'
      },
      {
        text: 'We reserve the right to modify these Terms at any time. We will notify you of material changes via email or an in-app notice. Continued use of the Service after changes become effective constitutes your acceptance of the revised Terms.'
      }
    ]
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    blocks: [
      {
        text: 'You must be at least 13 years of age to use RUNNIT. By creating an account, you represent that you meet this requirement. If you are under 18, you represent that you have your parent or guardian\'s permission to use the Service.'
      },
      {
        text: 'The Service is intended for personal, non-commercial use. Use of the Service for any commercial purpose without our prior written consent is prohibited.'
      }
    ]
  },
  {
    id: 'accounts',
    title: '3. Accounts',
    blocks: [
      {
        heading: 'Registration',
        text: 'You must create an account to access most features of RUNNIT. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.'
      },
      {
        heading: 'Account Security',
        text: 'You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized use of your account.'
      },
      {
        heading: 'Account Termination',
        text: 'You may delete your account at any time through your account settings. We reserve the right to suspend or terminate accounts that violate these Terms or that have been inactive for an extended period.'
      }
    ]
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable Use',
    blocks: [
      {
        text: 'You agree not to use the Service to:'
      },
      {
        list: [
          'Post or transmit any content that is unlawful, harmful, threatening, abusive, or otherwise objectionable',
          'Impersonate any person or entity or misrepresent your affiliation with any person or entity',
          'Harass, bully, or intimidate other users',
          'Distribute spam, chain letters, or unsolicited commercial messages',
          'Upload or transmit malware, viruses, or any code designed to damage or disrupt systems',
          'Scrape, crawl, or extract data from the Service through automated means without our consent',
          'Attempt to gain unauthorized access to any portion of the Service or its related systems',
          'Use the Service to infringe on any intellectual property rights'
        ]
      },
      {
        text: 'Violation of these rules may result in immediate suspension or termination of your account.'
      }
    ]
  },
  {
    id: 'user-content',
    title: '5. User Content',
    blocks: [
      {
        heading: 'Your Content',
        text: 'You retain ownership of any content you post on RUNNIT, including activity data, stories, photos, and comments ("User Content"). By posting User Content, you grant RUNNIT a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content solely for the purpose of operating and improving the Service.'
      },
      {
        heading: 'Content Standards',
        text: 'You are solely responsible for your User Content. You represent that you have all necessary rights to post it and that it does not violate any third-party rights or applicable law.'
      },
      {
        heading: 'Removal',
        text: 'We reserve the right to remove any User Content that violates these Terms or that we deem inappropriate, without prior notice.'
      }
    ]
  },
  {
    id: 'third-party-services',
    title: '6. Third-Party Integrations',
    blocks: [
      {
        text: 'RUNNIT integrates with third-party services such as Garmin, Apple Health, COROS, and Spotify. Your use of those integrations is subject to the respective third-party\'s terms and privacy policies.'
      },
      {
        text: 'We are not responsible for the availability, accuracy, or practices of any third-party service. Disconnecting a third-party integration through your account settings will stop future data syncing, but may not delete data already imported.'
      }
    ]
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual Property',
    blocks: [
      {
        text: 'All content, features, and functionality of RUNNIT — including but not limited to text, graphics, logos, icons, and software — are the exclusive property of RUNNIT and are protected by applicable intellectual property laws.'
      },
      {
        text: 'You may not copy, modify, distribute, sell, or lease any part of the Service, or reverse engineer or attempt to extract source code, without our prior written permission.'
      }
    ]
  },
  {
    id: 'disclaimers',
    title: '8. Disclaimers',
    blocks: [
      {
        heading: 'Fitness Advice',
        text: 'RUNNIT provides fitness tracking and AI-generated training plans for informational purposes only. This is not medical advice. Always consult a qualified healthcare provider before starting a new exercise program, especially if you have any health conditions.'
      },
      {
        heading: 'Service Availability',
        text: 'The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or free of harmful components.'
      }
    ]
  },
  {
    id: 'limitation-of-liability',
    title: '9. Limitation of Liability',
    blocks: [
      {
        text: 'To the fullest extent permitted by law, RUNNIT shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service, even if we have been advised of the possibility of such damages.'
      },
      {
        text: 'Our total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the amount you paid us in the twelve months preceding the claim, or $100 USD, whichever is greater.'
      }
    ]
  },
  {
    id: 'governing-law',
    title: '10. Governing Law',
    blocks: [
      {
        text: 'These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in Los Angeles County, California.'
      }
    ]
  }
]
</script>

<style scoped>
.terms-page {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  background: #FBF6EC;
  min-height: 100vh;
  padding-top: var(--nav-h, 66px);
}

/* ===== HERO ===== */
.hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 80px 0 60px;
}

.hero h1 {
  color: #FBF6EC;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.9;
}

.hero .lead {
  color: rgba(251,246,236,0.55);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

/* ===== CONTENT LAYOUT ===== */
.content {
  padding: 60px 0 80px;
}

.content-grid {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 48px;
  align-items: start;
}

/* ===== TOC SIDEBAR ===== */
.toc {
  position: sticky;
  top: 100px;
}

.toc-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #8A8A8A;
  margin-bottom: 12px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toc-link {
  display: block;
  padding: 7px 12px;
  border-radius: 0;
  font-size: 13px;
  color: #5A5348;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s, background 0.15s;
}

.toc-link:hover {
  background: #F1EADC;
  color: #16130F;
}

/* ===== TERMS BODY ===== */
.terms-body {
  background: #fff;
  border-radius: 0;
  border: 2px solid #16130F;
  box-shadow: 4px 4px 0 #E7DFCE;
  padding: 48px;
}

.terms-section {
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid #E7DFCE;
}

.terms-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #16130F;
  margin-bottom: 20px;
  text-transform: uppercase;
  line-height: 0.92;
}

.block-heading {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  color: #16130F;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-top: 20px;
  margin-bottom: 8px;
}

.block-text {
  font-size: 15px;
  color: #5A5348;
  line-height: 1.7;
  margin-bottom: 12px;
}

.block-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-list li {
  font-size: 15px;
  color: #5A5348;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.block-list li::before {
  content: "–";
  position: absolute;
  left: 0;
  color: #16130F;
  font-weight: 700;
}

/* ===== CONTACT BOX ===== */
.contact-box {
  margin-top: 48px;
  padding: 40px 32px;
  background: #16130F;
  border-radius: 0;
  text-align: center;
}

.contact-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 22px;
  font-weight: 900;
  color: #FBF6EC;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 0.92;
  margin-bottom: 14px;
}

.contact-text {
  font-size: 14px;
  color: rgba(251,246,236,0.62);
  margin-bottom: 28px;
  line-height: 1.6;
}

.btn-contact {
  display: inline-block;
  padding: 13px 32px;
  background: #2A55F5;
  color: #fff;
  text-decoration: none;
  border-radius: 999px;
  border: 2px solid #2A55F5;
  box-shadow: 2px 2px 0 rgba(251,246,236,0.25);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  transition: background 0.15s;
}

.btn-contact:hover {
  background: #1E42D6;
  border-color: #1E42D6;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .toc {
    position: static;
    display: none;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 0 40px;
  }

  .terms-body {
    padding: 28px 20px;
  }
}
</style>
