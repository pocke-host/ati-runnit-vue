<template>
  <main class="cookie-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Cookie Policy</h1>
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

          <!-- Cookie Body -->
          <article class="cookie-body">
            <section
              v-for="section in sections"
              :key="section.id"
              :id="section.id"
              class="cookie-section"
            >
              <h2 class="section-title">{{ section.title }}</h2>
              <div v-for="(block, i) in section.blocks" :key="i">
                <h3 v-if="block.heading" class="block-heading">{{ block.heading }}</h3>
                <p v-if="block.text" class="block-text">{{ block.text }}</p>
                <ul v-if="block.list" class="block-list">
                  <li v-for="(item, j) in block.list" :key="j">{{ item }}</li>
                </ul>
                <div v-if="block.table" class="cookie-table-wrap">
                  <table class="cookie-table">
                    <thead>
                      <tr>
                        <th v-for="col in block.table.headers" :key="col">{{ col }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, r) in block.table.rows" :key="r">
                        <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <!-- Contact box -->
            <div class="contact-box">
              <h3 class="contact-title">Questions about cookies?</h3>
              <p class="contact-text">
                If you have any questions about how we use cookies or want to manage your preferences, our support team can help.
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
    id: 'what-are-cookies',
    title: '1. What Are Cookies',
    blocks: [
      {
        text: 'Cookies are small text files placed on your device when you visit a website or use a web-based application. They are widely used to make sites work efficiently, remember your preferences, and provide information to site owners.'
      },
      {
        text: 'Similar technologies like local storage, session storage, and pixel tags serve comparable purposes and are also covered by this policy.'
      }
    ]
  },
  {
    id: 'how-we-use-cookies',
    title: '2. How We Use Cookies',
    blocks: [
      {
        text: 'RUNNIT uses cookies and similar technologies to:'
      },
      {
        list: [
          'Keep you signed in across sessions',
          'Remember your preferences and settings (e.g., units, language)',
          'Understand how you navigate and use the app to improve our product',
          'Measure the performance of our features and pages',
          'Protect against fraud and abuse'
        ]
      },
      {
        text: 'We do not use cookies to serve third-party advertisements or sell your data to advertisers.'
      }
    ]
  },
  {
    id: 'types-of-cookies',
    title: '3. Types of Cookies We Use',
    blocks: [
      {
        heading: 'Essential Cookies',
        text: 'These cookies are necessary for the Service to function. They enable core features like authentication and session management. You cannot opt out of these without affecting how the Service works.'
      },
      {
        heading: 'Preference Cookies',
        text: 'These cookies remember choices you make — such as your preferred units (miles vs. kilometers), display settings, and notification preferences — so you don\'t have to reset them each visit.'
      },
      {
        heading: 'Analytics Cookies',
        text: 'We use analytics cookies to understand how users interact with the Service, which pages are most visited, and where users encounter issues. This data is aggregated and used solely to improve RUNNIT.'
      },
      {
        heading: 'Security Cookies',
        text: 'These cookies help us detect and prevent fraudulent activity, protect user accounts, and maintain the integrity of the Service.'
      },
      {
        table: {
          headers: ['Cookie Name', 'Type', 'Purpose', 'Duration'],
          rows: [
            ['runnit_session', 'Essential', 'Maintains your login session', 'Session'],
            ['runnit_token', 'Essential', 'Stores your authentication token', '30 days'],
            ['runnit_prefs', 'Preference', 'Saves display and unit preferences', '1 year'],
            ['runnit_csrf', 'Security', 'Prevents cross-site request forgery', 'Session'],
            ['_analytics', 'Analytics', 'Tracks aggregate usage patterns', '90 days']
          ]
        }
      }
    ]
  },
  {
    id: 'third-party-cookies',
    title: '4. Third-Party Cookies',
    blocks: [
      {
        text: 'Some third-party services we integrate with may set their own cookies on your device. These are governed by the respective third party\'s cookie and privacy policies, not ours.'
      },
      {
        text: 'Third parties that may set cookies include:'
      },
      {
        list: [
          'Analytics providers used to measure app performance',
          'Error monitoring services used to detect and fix bugs',
          'Authentication providers if you sign in with Google or Apple'
        ]
      },
      {
        text: 'We limit third-party cookie use to services that are essential for operating and improving the platform.'
      }
    ]
  },
  {
    id: 'managing-cookies',
    title: '5. Managing Your Cookie Preferences',
    blocks: [
      {
        heading: 'Browser Settings',
        text: 'Most browsers allow you to control cookies through their settings. You can configure your browser to block cookies, delete existing cookies, or alert you when a cookie is being set. Note that disabling essential cookies may prevent parts of the Service from working correctly.'
      },
      {
        heading: 'In-App Preferences',
        text: 'You can manage analytics and preference cookies directly from your account settings under Privacy Controls. Essential and security cookies cannot be disabled from within the app.'
      },
      {
        heading: 'Do Not Track',
        text: 'Some browsers support a "Do Not Track" (DNT) signal. RUNNIT currently does not alter its behavior based on DNT signals, but we will revisit this as industry standards evolve.'
      }
    ]
  },
  {
    id: 'updates',
    title: '6. Updates to This Policy',
    blocks: [
      {
        text: 'We may update this Cookie Policy from time to time to reflect changes in technology, law, or our practices. When we do, we will revise the "Last updated" date at the top of this page.'
      },
      {
        text: 'We encourage you to review this policy periodically. For significant changes, we will notify you via in-app notice or email.'
      }
    ]
  }
]
</script>

<style scoped>
.cookie-page {
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

/* ===== COOKIE BODY ===== */
.cookie-body {
  background: #fff;
  border-radius: 0;
  border: 2px solid #16130F;
  box-shadow: 4px 4px 0 #E7DFCE;
  padding: 48px;
}

.cookie-section {
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid #E7DFCE;
}

.cookie-section:last-of-type {
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

/* ===== COOKIE TABLE ===== */
.cookie-table-wrap {
  overflow-x: auto;
  margin-top: 24px;
  border-radius: 0;
  border: 2px solid #E7DFCE;
}

.cookie-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.cookie-table thead {
  background: #F1EADC;
}

.cookie-table th {
  padding: 12px 16px;
  text-align: left;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  color: #16130F;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  border-bottom: 2px solid #E7DFCE;
  white-space: nowrap;
}

.cookie-table td {
  padding: 12px 16px;
  color: #5A5348;
  border-bottom: 1px solid #E7DFCE;
  vertical-align: top;
}

.cookie-table tbody tr:last-child td {
  border-bottom: none;
}

.cookie-table tbody tr:hover td {
  background: #FBF6EC;
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

  .cookie-body {
    padding: 28px 20px;
  }
}
</style>
