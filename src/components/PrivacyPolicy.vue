<template>
  <main class="privacy-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Privacy Policy</h1>
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

          <!-- Policy Body -->
          <article class="policy-body">
            <section
              v-for="section in sections"
              :key="section.id"
              :id="section.id"
              class="policy-section"
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
              <h3 class="contact-title">Questions about this policy?</h3>
              <p class="contact-text">
                If you have any questions or concerns about how we handle your data, reach out to us directly.
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
const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    blocks: [
      {
        text: 'RUNNIT ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website and mobile application.'
      },
      {
        text: 'By using RUNNIT, you agree to the collection and use of information in accordance with this policy. If you do not agree with any part of this policy, please do not use our services.'
      }
    ]
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    blocks: [
      {
        heading: 'Account Information',
        text: 'When you create an account, we collect your name, email address, and password. You may optionally provide a profile photo, bio, and fitness preferences.'
      },
      {
        heading: 'Activity Data',
        text: 'To provide training and tracking features, we collect data from your workouts and connected devices, including:'
      },
      {
        list: [
          'GPS routes and location data during activities',
          'Heart rate, pace, distance, and elevation',
          'Workout duration and timestamps',
          'Device identifiers from connected wearables (Garmin, Apple Watch, COROS, etc.)'
        ]
      },
      {
        heading: 'Usage Data',
        text: 'We automatically collect information about how you interact with our app — pages visited, features used, and session duration. This helps us improve the product.'
      },
      {
        heading: 'Content You Share',
        text: 'If you post stories, join clubs, or participate in challenges, we collect the content you submit, including photos, captions, and comments.'
      }
    ]
  },
  {
    id: 'how-we-use-data',
    title: '3. How We Use Your Data',
    blocks: [
      {
        text: 'We use the information we collect to:'
      },
      {
        list: [
          'Provide, maintain, and improve the RUNNIT platform',
          'Generate AI-powered training plans personalized to you',
          'Display your activity history, stats, and progress',
          'Enable social features like clubs, challenges, and stories',
          'Send transactional emails (account confirmations, password resets)',
          'Analyze aggregate usage to improve product features',
          'Comply with legal obligations'
        ]
      },
      {
        text: 'We do not sell your personal data to third parties. We do not use your data to serve you third-party advertisements.'
      }
    ]
  },
  {
    id: 'data-sharing',
    title: '4. Data Sharing',
    blocks: [
      {
        heading: 'With Other Users',
        text: 'Activities, stories, and club participation are visible to other RUNNIT users based on your privacy settings. You can set activities to private, friends-only, or public at any time.'
      },
      {
        heading: 'With Service Providers',
        text: 'We share data with trusted third-party vendors who help us operate the platform (e.g., cloud hosting, analytics). These providers are contractually bound to use your data only for the services they perform for us.'
      },
      {
        heading: 'Legal Requirements',
        text: 'We may disclose your information if required to do so by law or in response to valid requests from public authorities.'
      }
    ]
  },
  {
    id: 'data-retention',
    title: '5. Data Retention',
    blocks: [
      {
        text: 'We retain your personal data for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time through your account settings or by contacting support.'
      },
      {
        text: 'Some data may be retained in anonymized or aggregated form for analytics purposes even after account deletion.'
      }
    ]
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    blocks: [
      {
        text: 'Depending on your location, you may have the following rights regarding your personal data:'
      },
      {
        list: [
          'Access — request a copy of the data we hold about you',
          'Correction — update inaccurate or incomplete data',
          'Deletion — request that we delete your account and personal data',
          'Portability — receive your data in a structured, machine-readable format',
          'Restriction — limit how we process your data in certain circumstances',
          'Objection — object to processing based on legitimate interests'
        ]
      },
      {
        text: 'To exercise any of these rights, please contact us through our support page.'
      }
    ]
  },
  {
    id: 'security',
    title: '7. Security',
    blocks: [
      {
        text: 'We implement industry-standard security measures including encryption in transit (TLS), hashed password storage, and access controls. However, no method of transmission over the internet or electronic storage is 100% secure.'
      },
      {
        text: 'If you believe your account has been compromised, please contact us immediately.'
      }
    ]
  },
  {
    id: 'children',
    title: '8. Children\'s Privacy',
    blocks: [
      {
        text: 'RUNNIT is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete it.'
      }
    ]
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    blocks: [
      {
        text: 'We may update this Privacy Policy from time to time. When we do, we will revise the "Last updated" date at the top of this page. We encourage you to review this policy periodically.'
      },
      {
        text: 'For material changes, we will notify you via email or a prominent notice within the app prior to the change becoming effective.'
      }
    ]
  }
]
</script>

<style scoped>
/* ===== Design Tokens ===== */
.privacy-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--r-offwhite);
  min-height: 100vh;
  padding-top: 57px;
}

/* ===== HERO ===== */
.hero {
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  padding: 80px 0 60px;
}

.hero h1 {
  color: white;
  letter-spacing: -0.02em;
}

.hero .lead {
  color: rgba(255, 255, 255, 0.75);
  font-size: 16px;
  font-weight: 400;
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
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9CA3AF;
  margin-bottom: 12px;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-link {
  display: block;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #6B7280;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.toc-link:hover {
  background: rgba(90, 107, 78, 0.08);
  color: var(--r-olive-deep);
}

/* ===== POLICY BODY ===== */
.policy-body {
  background: white;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  padding: 48px;
}

.policy-section {
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid #F3F4F6;
}

.policy-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--r-olive-deep);
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.block-heading {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-top: 20px;
  margin-bottom: 8px;
}

.block-text {
  font-size: 15px;
  color: #4B5563;
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
  color: #4B5563;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.block-list li::before {
  content: "–";
  position: absolute;
  left: 0;
  color: var(--r-accent);
  font-weight: 700;
}

/* ===== CONTACT BOX ===== */
.contact-box {
  margin-top: 48px;
  padding: 32px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  border-radius: 16px;
  text-align: center;
}

.contact-title {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}

.contact-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 24px;
  line-height: 1.6;
}

.btn-contact {
  display: inline-block;
  padding: 12px 32px;
  background: var(--r-accent);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
}

.btn-contact:hover {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 106, 42, 0.3);
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

  .hero h1 {
    font-size: 32px;
  }

  .policy-body {
    padding: 28px 20px;
  }
}
</style>
