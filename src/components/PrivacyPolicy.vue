<template>
  <main class="privacy-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Privacy Policy</h1>
        <p class="lead mb-0">Last updated: March 11, 2026</p>
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
                For privacy-related questions, data requests, or to exercise your rights, contact us directly at
                <a href="mailto:privacy@runnit.live" class="contact-email">privacy@runnit.live</a>
              </p>
              <p class="contact-company">
                Runnit Inc. &nbsp;·&nbsp; Canada &nbsp;·&nbsp;
                <a href="mailto:privacy@runnit.live" class="contact-email">privacy@runnit.live</a>
              </p>
              <a href="mailto:privacy@runnit.live" class="btn-contact">privacy@runnit.live</a>
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
        text: 'RUNNIT ("we", "our", or "us") is a fitness training platform operated by Runnit Inc., a company registered in Canada. Our platform is available at runnit.live and through our mobile application.'
      },
      {
        text: 'This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. By using RUNNIT, you agree to the collection and use of information in accordance with this policy. If you do not agree with any part of this policy, please do not use our services.'
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
    id: 'third-party-integrations',
    title: '5. Third-Party Integrations',
    blocks: [
      {
        heading: 'Garmin Connect',
        text: 'RUNNIT integrates with the Garmin Connect API to allow users to sync their activity data from Garmin devices. When you connect your Garmin account, we request access to your activity data including GPS tracks, heart rate, pace, distance, elevation, and workout timestamps.'
      },
      {
        text: 'We use this data solely to display your activities, calculate training metrics, and generate personalized training plans within the RUNNIT platform. We do not sell, license, or share Garmin data with any third party.'
      },
      {
        heading: 'How Garmin Data is Stored',
        text: 'Garmin activity data is stored securely on our servers and associated with your RUNNIT account. We retain Garmin-sourced data only for as long as your account remains active or until you disconnect your Garmin integration.'
      },
      {
        heading: 'Disconnecting Garmin',
        text: 'You may disconnect your Garmin account at any time from your device settings within the RUNNIT app. Upon disconnection, we revoke our OAuth access token. You may also request deletion of all Garmin-sourced data by contacting privacy@runnit.live.'
      },
      {
        heading: 'Strava',
        text: 'RUNNIT integrates with the Strava API to import activities from your Strava account. The same data principles apply: Strava data is used only to display and analyze your training within RUNNIT and is never sold or shared with third parties.'
      },
      {
        text: 'RUNNIT\'s use of data from third-party integrations is limited to providing and improving the core features of the platform as requested by the user.'
      }
    ]
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
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
    title: '7. Your Rights',
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
    title: '8. Security',
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
    title: '9. Children\'s Privacy',
    blocks: [
      {
        text: 'RUNNIT is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete it.'
      }
    ]
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
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
.privacy-page {
  font-family: "Futura PT", "Futura", "Century Gothic", "Trebuchet MS", sans-serif;
  background: #fff;
  min-height: 100vh;
  padding-top: var(--nav-h, 64px);
}

/* ===== HERO ===== */
.hero {
  background: #000;
  color: #fff;
  padding: 80px 0 60px;
}

.hero h1 {
  color: #fff;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.hero .lead {
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.06em;
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
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #767676;
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
  color: #767676;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s, background 0.15s;
}

.toc-link:hover {
  background: #f5f5f5;
  color: #000;
}

/* ===== POLICY BODY ===== */
.policy-body {
  background: #fff;
  border-radius: 0;
  border: 1px solid #E5E5E5;
  padding: 48px;
}

.policy-section {
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid #E5E5E5;
}

.policy-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 20px;
  font-weight: 900;
  color: #000;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}

.block-heading {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 20px;
  margin-bottom: 8px;
}

.block-text {
  font-size: 15px;
  color: #555;
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
  color: #555;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.block-list li::before {
  content: "–";
  position: absolute;
  left: 0;
  color: #000;
  font-weight: 700;
}

/* ===== CONTACT BOX ===== */
.contact-box {
  margin-top: 48px;
  padding: 40px 32px;
  background: #000;
  border-radius: 0;
  text-align: center;
}

.contact-title {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.contact-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.60);
  margin-bottom: 28px;
  line-height: 1.6;
}

.btn-contact {
  display: inline-block;
  padding: 14px 36px;
  background: #fff;
  color: #000;
  text-decoration: none;
  border-radius: 0;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  transition: background 0.15s, color 0.15s;
}

.btn-contact:hover {
  background: #e5e5e5;
  color: #000;
}

.contact-email {
  color: #0052FF;
  text-decoration: underline;
}

.contact-company {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 28px;
  letter-spacing: 0.04em;
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
