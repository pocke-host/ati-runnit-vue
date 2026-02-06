<template>
  <main class="dash">
    <div class="wrap">
      <!-- TOP BAR -->
      <header class="topbar">
        <div class="brandline">
          <div class="status-dot" aria-hidden="true"></div>
          <div class="kicker">RUNNIT // TRAINING HUB</div>
        </div>

        <div class="top-actions">
          <button class="btn btn-ghost" type="button">
            <i class="bi bi-plus-lg me-2"></i>New Activity
          </button>
          <button class="btn btn-primary" type="button">
            <i class="bi bi-link-45deg me-2"></i>Connect Devices
          </button>
        </div>
      </header>

      <!-- GRID -->
      <section class="grid">
        <!-- LEFT: profile / stats -->
        <aside class="panel profile">
          <div class="panel-head">
            <div class="avatar" aria-hidden="true"></div>
            <div class="who">
              <div class="name">{{ user.name }}</div>
              <div class="sub">Movement with purpose</div>
            </div>
          </div>

          <div class="hud">
            <div class="hud-item">
              <div class="hud-label">This week</div>
              <div class="hud-value">—</div>
            </div>
            <div class="hud-item">
              <div class="hud-label">Streak</div>
              <div class="hud-value">—</div>
            </div>
            <div class="hud-item">
              <div class="hud-label">Training load</div>
              <div class="hud-value">—</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="quick">
            <button class="btn btn-outline" type="button">
              <i class="bi bi-graph-up-arrow me-2"></i>Insights
            </button>
            <button class="btn btn-outline" type="button">
              <i class="bi bi-trophy me-2"></i>Challenges
            </button>
            <button class="btn btn-outline" type="button">
              <i class="bi bi-map me-2"></i>Routes
            </button>
          </div>

          <div class="divider"></div>

          <div class="mini">
            <div class="mini-title">Today’s directive</div>
            <div class="mini-body">
              Log one session. Keep the chain alive.
              <span class="chip chip-accent ms-2"><i class="bi bi-lightning-fill me-1"></i>Consistency</span>
            </div>
          </div>
        </aside>

        <!-- CENTER: activity feed -->
        <section class="feed">
          <div class="feed-head">
            <h2 class="h2">Activity Feed</h2>
            <div class="filters">
              <button class="pill active" type="button">All</button>
              <button class="pill" type="button">Run</button>
              <button class="pill" type="button">Ride</button>
              <button class="pill" type="button">Swim</button>
            </div>
          </div>

          <div v-if="activities.length" class="feed-list">
            <ActivityCard
              v-for="(activity, index) in activities"
              :key="index"
              :title="activity.title"
              :distance="activity.distance"
              :elevation="activity.elevation"
              :time="activity.time"
              :achievements="activity.achievements"
              :mapImage="activity.mapImage"
              :rideImage="activity.rideImage"
            />
          </div>

          <div v-else class="empty">
            <div class="empty-card">
              <div class="empty-title">No activities yet</div>
              <div class="empty-sub">
                Connect Zwift/Strava (or log manually) to start building your timeline.
              </div>
              <div class="empty-actions">
                <button class="btn btn-primary" type="button">
                  <i class="bi bi-link-45deg me-2"></i>Connect
                </button>
                <button class="btn btn-outline" type="button">
                  <i class="bi bi-plus-lg me-2"></i>Manual entry
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- RIGHT: upcoming / widgets -->
        <aside class="panel side">
          <div class="side-head">
            <div class="h2">Upcoming</div>
            <span class="chip"><i class="bi bi-calendar-event me-1"></i>Next 14d</span>
          </div>

          <div v-if="events.length" class="events">
            <div
              v-for="(event, index) in events"
              :key="index"
              class="event"
            >
              <div class="event-dot" aria-hidden="true"></div>
              <div class="event-body">
                <div class="event-name">{{ event.name }}</div>
                <div class="event-meta">{{ event.date }} — {{ event.time }}</div>
              </div>
              <button class="btn btn-ghost btn-sm" type="button">View</button>
            </div>
          </div>

          <div v-else class="events-empty">
            <div class="small-muted">No events found.</div>
            <button class="btn btn-outline mt-2" type="button">
              <i class="bi bi-search me-2"></i>Browse races
            </button>
          </div>

          <div class="divider"></div>

          <div class="mini">
            <div class="mini-title">System status</div>
            <div class="mini-body">
              Sync: <span class="ok">OK</span> · Privacy: <span class="ok">ON</span> · Battery saver: <span class="warn">—</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref, defineComponent } from 'vue'

const user = ref({ name: 'Loading user...' })
const activities = ref([])
const events = ref([])

async function fetchUserData() {
  try {
    const res = await fetch('/api/user')
    const data = await res.json()
    user.value = data.user
    activities.value = data.activities
    events.value = data.events
  } catch (error) {
    console.error('Failed to fetch user data:', error)
  }
}
fetchUserData()

const ActivityCard = defineComponent({
  props: {
    title: String,
    distance: Number,
    elevation: Number,
    time: String,
    achievements: Number,
    mapImage: String,
    rideImage: String
  },
  methods: {
    fmtMi(v) {
      const n = Number(v || 0)
      return n.toFixed(n < 10 ? 2 : 1)
    }
  },
  template: `
    <article class="card">
      <div class="card-top">
        <div class="card-title">{{ title }}</div>
        <div class="card-tags">
          <span class="chip"><i class="bi bi-globe me-1"></i>Virtual</span>
          <span class="chip chip-accent" v-if="(achievements || 0) > 0">
            <i class="bi bi-award-fill me-1"></i>{{ achievements }}x
          </span>
        </div>
      </div>

      <div class="banner">
        <div class="map" :style="{ backgroundImage: mapImage ? \`url(\${mapImage})\` : '' }"></div>
        <div class="photo" :style="{ backgroundImage: rideImage ? \`url(\${rideImage})\` : '' }"></div>
        <div class="scan" aria-hidden="true"></div>
      </div>

      <div class="stats">
        <div class="stat">
          <div class="stat-v">{{ fmtMi(distance) }}</div>
          <div class="stat-k">mi</div>
        </div>
        <div class="stat">
          <div class="stat-v">{{ elevation || 0 }}</div>
          <div class="stat-k">ft gain</div>
        </div>
        <div class="stat">
          <div class="stat-v">{{ time }}</div>
          <div class="stat-k">time</div>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-outline btn-sm" type="button"><i class="bi bi-chat-dots me-1"></i>Comment</button>
        <button class="btn btn-outline btn-sm" type="button"><i class="bi bi-heart-fill me-1"></i>Kudos</button>
        <button class="btn btn-ghost btn-sm" type="button"><i class="bi bi-share me-1"></i>Share</button>
      </div>
    </article>
  `
})
</script>

<style scoped>
/* ===== RUNNIT TOKENS (dashboard-local) ===== */
.dash{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  min-height: 100vh;
  background:
    radial-gradient(900px 420px at 18% 12%, rgba(90,107,78,0.18), rgba(90,107,78,0) 60%),
    radial-gradient(900px 420px at 85% 20%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  color: rgba(15,18,16,0.92);
}

.wrap{
  max-width: 1120px;
  margin: 0 auto;
  padding: 26px 16px 56px;
}

/* ===== TOP BAR ===== */
.topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.brandline{
  display:flex;
  align-items:center;
  gap: 10px;
}
.status-dot{
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.22);
}
.kicker{
  letter-spacing: .18em;
  font-weight: 900;
  font-size: .78rem;
  color: rgba(15,18,16,0.70);
}
.top-actions{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* ===== GRID ===== */
.grid{
  display:grid;
  grid-template-columns: 280px minmax(0, 1fr) 280px;
  gap: 14px;
}

/* ===== PANELS ===== */
.panel{
  background:
    radial-gradient(700px 220px at 30% 0%, rgba(90,107,78,0.10), rgba(90,107,78,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.56));
  border: 1px solid rgba(15,18,16,0.12);
  border-radius: 18px;
  box-shadow: 0 14px 40px rgba(15,18,16,0.10);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 14px;
  position: relative;
  overflow: hidden;
}

/* subtle “simulation” texture (NOT pixel art) */
.panel::after,
.feed::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    repeating-linear-gradient(
      180deg,
      rgba(15,18,16,0.018),
      rgba(15,18,16,0.018) 1px,
      rgba(255,255,255,0) 3px,
      rgba(255,255,255,0) 6px
    );
  opacity: .35;
  mix-blend-mode: multiply;
}

/* ===== PROFILE ===== */
.panel-head{
  display:flex;
  gap: 12px;
  align-items:center;
}
.avatar{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background:
    radial-gradient(22px 22px at 30% 30%, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  box-shadow: 0 10px 28px rgba(15,18,16,0.18);
}
.name{ font-weight: 900; }
.sub{ color: rgba(15,18,16,0.60); font-size: .9rem; }

.hud{
  display:grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 12px;
}
.hud-item{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 14px;
  padding: 10px 10px;
  background: rgba(255,255,255,0.45);
}
.hud-label{
  font-size: .75rem;
  letter-spacing: .10em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.55);
  font-weight: 900;
}
.hud-value{
  font-size: 1.15rem;
  font-weight: 900;
  margin-top: 2px;
}

.quick{
  display:grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.divider{
  height: 1px;
  background: rgba(15,18,16,0.10);
  margin: 12px 0;
}
.mini-title{
  font-weight: 900;
  letter-spacing: .10em;
  text-transform: uppercase;
  font-size: .75rem;
  color: rgba(15,18,16,0.60);
  margin-bottom: 6px;
}
.mini-body{
  color: rgba(15,18,16,0.70);
  line-height: 1.4;
}

/* ===== FEED ===== */
.feed{
  position: relative;
  border-radius: 18px;
  padding: 0;
  overflow: hidden;
}
.feed-head{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 10px;
  padding: 14px 14px 10px;
  background:
    linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.52));
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 18px;
  margin-bottom: 12px;
  box-shadow: 0 10px 26px rgba(15,18,16,0.08);
}
.h2{
  font-weight: 900;
  margin: 0;
  font-size: 1.05rem;
  letter-spacing: .02em;
}
.filters{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
}
.pill{
  border: 1px solid rgba(15,18,16,0.16);
  background: rgba(255,255,255,0.55);
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 900;
  font-size: .82rem;
  color: rgba(15,18,16,0.72);
}
.pill.active{
  background: rgba(90,107,78,0.18);
  border-color: rgba(90,107,78,0.32);
  color: rgba(15,18,16,0.88);
}

.feed-list{
  display:flex;
  flex-direction:column;
  gap: 12px;
}

.empty{
  padding: 12px 0 0;
}
.empty-card{
  border-radius: 18px;
  border: 1px dashed rgba(15,18,16,0.20);
  background: rgba(255,255,255,0.55);
  padding: 18px;
}
.empty-title{ font-weight: 900; font-size: 1.05rem; }
.empty-sub{ color: rgba(15,18,16,0.62); margin-top: 4px; }
.empty-actions{ display:flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }

/* ===== ACTIVITY CARD ===== */
.card{
  border-radius: 18px;
  border: 1px solid rgba(15,18,16,0.12);
  background:
    radial-gradient(700px 220px at 30% 0%, rgba(196,106,42,0.08), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.58));
  box-shadow: 0 14px 40px rgba(15,18,16,0.10);
  overflow: hidden;
  position: relative;
}
.card-top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
  padding: 14px 14px 10px;
}
.card-title{
  font-weight: 900;
  letter-spacing: .01em;
}
.card-tags{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content:flex-end;
}

/* banner w/ map + photo */
.banner{
  display:grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 8px;
  padding: 0 14px 12px;
  position: relative;
}
.map, .photo{
  height: 160px;
  border-radius: 16px;
  background: rgba(15,18,16,0.06);
  border: 1px solid rgba(15,18,16,0.10);
  background-size: cover;
  background-position: center;
}
.scan{
  position:absolute;
  inset: 0 14px 12px;
  border-radius: 18px;
  pointer-events:none;
  background:
    linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0)),
    repeating-linear-gradient(
      180deg,
      rgba(15,18,16,0.018),
      rgba(15,18,16,0.018) 1px,
      rgba(255,255,255,0) 3px,
      rgba(255,255,255,0) 6px
    );
  opacity: .45;
  mix-blend-mode: multiply;
}

.stats{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 14px 12px;
}
.stat{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  background: rgba(255,255,255,0.50);
  padding: 10px 10px;
  text-align:center;
}
.stat-v{
  font-weight: 900;
  font-size: 1.15rem;
}
.stat-k{
  font-size: .75rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(15,18,16,0.55);
  font-weight: 900;
  margin-top: 2px;
}

.actions{
  display:flex;
  gap: 8px;
  padding: 0 14px 14px;
  flex-wrap: wrap;
}

/* ===== RIGHT SIDE ===== */
.side-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.events{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.event{
  display:flex;
  gap: 10px;
  align-items:flex-start;
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(15,18,16,0.10);
  background: rgba(255,255,255,0.45);
}
.event-dot{
  width: 10px; height: 10px;
  border-radius: 999px;
  margin-top: 6px;
  background: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.18);
}
.event-name{ font-weight: 900; }
.event-meta{ color: rgba(15,18,16,0.60); font-size: .85rem; }
.events-empty{ color: rgba(15,18,16,0.60); }

/* ===== CHIPS ===== */
.chip{
  display:inline-flex;
  align-items:center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 10px;
  font-weight: 900;
  font-size: .78rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  border: 1px solid rgba(15,18,16,0.14);
  background: rgba(255,255,255,0.55);
  color: rgba(15,18,16,0.70);
}
.chip-accent{
  border-color: rgba(196,106,42,0.28);
  background: rgba(196,106,42,0.14);
  color: rgba(15,18,16,0.78);
}
.ok{ color: rgba(22,163,74,0.92); font-weight: 900; }
.warn{ color: rgba(196,106,42,0.92); font-weight: 900; }
.small-muted{ color: rgba(15,18,16,0.60); }

/* ===== BUTTONS (custom, not bootstrap) ===== */
.btn{
  border: 1px solid rgba(15,18,16,0.14);
  background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78);
  border-radius: 14px;
  height: 44px;
  padding: 0 14px;
  font-weight: 900;
  letter-spacing: .02em;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap: 8px;
  cursor: pointer;
  transition: transform .08s ease, background .12s ease, border-color .12s ease;
}
.btn:hover{
  transform: translateY(-1px);
  border-color: rgba(15,18,16,0.18);
  background: rgba(255,255,255,0.72);
}
.btn:active{ transform: translateY(0px); }

.btn-primary{
  background:
    radial-gradient(700px 220px at 30% 0%, rgba(255,255,255,0.18), rgba(255,255,255,0) 60%),
    linear-gradient(135deg, var(--r-accent), #a85722);
  border-color: rgba(15,18,16,0.12);
  color: rgba(255,255,255,0.96);
}
.btn-primary:hover{ background: linear-gradient(135deg, #a85722, #914a1e); }

.btn-outline{
  background: rgba(255,255,255,0.50);
  border-color: rgba(15,18,16,0.16);
}

.btn-ghost{
  background: rgba(255,255,255,0.40);
  border-color: rgba(15,18,16,0.10);
}
.btn-sm{
  height: 36px;
  border-radius: 12px;
  padding: 0 10px;
  font-size: .85rem;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1100px){
  .grid{ grid-template-columns: 260px minmax(0, 1fr) 260px; }
}
@media (max-width: 992px){
  .grid{ grid-template-columns: 1fr; }
  .topbar{ flex-direction: column; align-items: flex-start; }
  .top-actions{ width: 100%; }
  .top-actions .btn{ flex: 1; }
}
</style>
