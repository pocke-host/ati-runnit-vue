<template>
  <main class="dash">
    <StoriesViewer />
    <!-- Loading State -->
    <AppSpinner v-if="!user" label="Loading dashboard…" />

    <!-- Dashboard Content -->
    <div v-else class="wrap">
      <!-- Pull-to-refresh indicator (mobile only) -->
      <div class="ptr-indicator" :style="{ height: pullY + 'px', opacity: pullY > 0 ? 1 : 0 }" aria-hidden="true">
        <div :class="['ptr-spinner', { spinning: refreshing }]">
          <i class="bi bi-arrow-clockwise"></i>
        </div>
      </div>

      <!-- Streak urgency banner -->
      <div v-if="totalStats.streak > 0 && !activityToday" class="streak-banner" role="alert">
        <span class="streak-banner-icon">🔥</span>
        <span class="streak-banner-text">
          Your <strong>{{ totalStats.streak }}-day streak</strong> is at risk — log an activity today to keep it alive.
        </span>
        <router-link to="/track" class="streak-banner-cta">Track Now</router-link>
      </div>

      <!-- ════ DESKTOP V2 BENTO ════ -->
      <div class="db2-desktop">

        <!-- HERO (ink) -->
        <div class="db2-hero">
          <div class="db2-hero-top">
            <div class="db2-hero-left">
              <div class="db2-dateline">{{ todayLine }}</div>
              <h1 class="db2-greeting">{{ greeting }},<br><span class="db2-name">{{ user?.displayName?.split(' ')[0]?.toUpperCase() || 'ATHLETE' }}.</span></h1>
            </div>
            <div class="db2-hero-right">
              <span class="db2-phase-badge">{{ trainingBlock.label }} PHASE</span>
              <button class="db2-btn-ghost" type="button" @click="openActivityModal">＋ Log</button>
              <button class="db2-btn-cobalt" type="button" @click="openMomentModal">◉ Moment</button>
            </div>
          </div>
          <div class="db2-stats-grid">
            <div class="db2-stat db2-stat--br">
              <div class="db2-stat-lbl">Total Distance</div>
              <div class="db2-stat-num">{{ formatDistance(totalStats.distance) }}</div>
            </div>
            <div class="db2-stat db2-stat--br">
              <div class="db2-stat-lbl">Total Time</div>
              <div class="db2-stat-num">{{ totalStats.duration }}<span class="db2-stat-unit">hrs</span></div>
            </div>
            <div class="db2-stat db2-stat--br">
              <div class="db2-stat-lbl">Day Streak</div>
              <div class="db2-stat-num db2-stat-num--streak">{{ totalStats.streak }}<span class="db2-stat-unit">{{ totalStats.streak !== 1 ? 'days' : 'day' }}</span></div>
            </div>
            <div class="db2-stat">
              <div class="db2-stat-lbl">Following</div>
              <div class="db2-stat-num">{{ friendsCount }}</div>
            </div>
          </div>
        </div>

        <!-- WEEK RAIL -->
        <div class="db2-week-rail">
          <div class="db2-week-label">This Week</div>
          <div class="db2-week-days">
            <div v-for="day in weekCalendar" :key="day.date" class="db2-week-day">
              <div :class="['db2-day-circle', {
                'db2-day-circle--today': day.isToday,
                'db2-day-circle--done': !day.isToday && day.activities.length > 0
              }]">{{ day.dayNum }}</div>
              <div class="db2-day-letter">{{ day.letter }}</div>
            </div>
          </div>
          <div class="db2-week-totals">
            <span class="db2-wt-num">{{ weekActivities }}</span><span class="db2-wt-meta"> workout{{ weekActivities !== 1 ? 's' : '' }}</span>
            <span class="db2-wt-sep">·</span>
            <span class="db2-wt-num">{{ formatDistance(weekDistance) }}</span>
          </div>
        </div>

        <!-- BENTO GRID -->
        <div class="db2-bento">

          <!-- FEATURED LAST ACTIVITY (col-span 2) -->
          <div class="db2-card db2-featured">
            <template v-if="activities && activities.length">
              <div class="db2-feat-head">
                <span class="db2-latest-badge">Latest</span>
                <div class="db2-feat-title">{{ getActivityName(activities[0]) }}</div>
                <div class="db2-feat-date">{{ formatDateShort(activities[0].createdAt) }}</div>
              </div>
              <div class="db2-feat-map">
                <svg viewBox="0 0 900 210" preserveAspectRatio="none" class="db2-route-svg">
                  <g stroke="rgba(251,246,236,0.07)" stroke-width="1" fill="none">
                    <path d="M0,52 H900"/><path d="M0,105 H900"/><path d="M0,158 H900"/>
                    <path d="M225,0 V210"/><path d="M450,0 V210"/><path d="M675,0 V210"/>
                  </g>
                  <path d="M40,170 C160,120 150,60 260,80 C420,108 380,44 520,72 C660,100 640,150 780,116 C830,102 850,132 870,116"
                    fill="none" stroke="#2A55F5" stroke-width="5" stroke-dasharray="1500" stroke-dashoffset="1500" class="db2-route-path"/>
                  <circle cx="40" cy="170" r="6" fill="#FBF6EC"/>
                  <circle cx="870" cy="116" r="7" fill="#2A55F5" stroke="#FBF6EC" stroke-width="2"/>
                </svg>
                <router-link v-if="activities[0].id" :to="`/activities/${activities[0].id}`" class="db2-feat-chip">
                  {{ activities[0].title || activities[0].sportType || 'View' }}
                </router-link>
              </div>
              <div class="db2-feat-stats">
                <div class="db2-fstat db2-fstat--br">
                  <div class="db2-fstat-lbl">Dist</div>
                  <div class="db2-fstat-num">{{ formatDistance(activities[0].distanceMeters) }}</div>
                </div>
                <div class="db2-fstat db2-fstat--br">
                  <div class="db2-fstat-lbl">Pace</div>
                  <div class="db2-fstat-num db2-fstat-num--yellow">{{ formatPace(activities[0]) }}</div>
                </div>
                <div class="db2-fstat db2-fstat--br">
                  <div class="db2-fstat-lbl">Time</div>
                  <div class="db2-fstat-num">{{ formatDuration(activities[0].durationSeconds) }}</div>
                </div>
                <div class="db2-fstat">
                  <div class="db2-fstat-lbl">Elev</div>
                  <div class="db2-fstat-num">{{ activities[0].elevationGain ? formatElevation(activities[0].elevationGain) : '—' }}</div>
                </div>
              </div>
            </template>
            <div v-else class="db2-feat-empty">
              <button class="db2-feat-log-btn" @click="openActivityModal">+ Log your first activity</button>
            </div>
          </div>

          <!-- NEXT UP -->
          <div class="db2-card db2-next-up">
            <div class="db2-card-head">
              <div class="db2-eyebrow">Next Up</div>
              <span class="db2-head-sub">Tomorrow</span>
            </div>
            <div class="db2-next-body">
              <template v-if="todayWorkout">
                <div class="db2-next-title">{{ todayWorkout.name || todayWorkout.type }}</div>
                <div class="db2-next-desc">{{ todayWorkout.description || '' }}</div>
                <div class="db2-next-boxes">
                  <div class="db2-next-box">
                    <div class="db2-next-box-lbl">Target</div>
                    <div class="db2-next-box-val">{{ todayWorkout.distance ? formatDistance(todayWorkout.distance * (isImperial ? 1609.34 : 1000)) : '—' }}</div>
                  </div>
                  <div class="db2-next-box">
                    <div class="db2-next-box-lbl">Duration</div>
                    <div class="db2-next-box-val">{{ todayWorkout.duration ? todayWorkout.duration + 'min' : '—' }}</div>
                  </div>
                </div>
                <router-link :to="`/plans/${fullActivePlan?.id || activePlan?.id}`" class="db2-next-cta">View Plan →</router-link>
              </template>
              <div v-else class="db2-next-empty">
                <div class="db2-next-empty-txt">No active plan</div>
                <router-link to="/plans" class="db2-next-cta">Browse Plans →</router-link>
              </div>
            </div>
          </div>

          <!-- WEEKLY BARS (col-span 2) -->
          <div class="db2-card db2-weekly-bars">
            <div class="db2-card-head">
              <div class="db2-card-title">Weekly Activity</div>
              <div class="db2-view-toggle">
                <button :class="['db2-toggle-btn', { 'db2-toggle-btn--on': chartView === 'distance' }]" @click="chartView = 'distance'">Distance</button>
                <button :class="['db2-toggle-btn', { 'db2-toggle-btn--on': chartView === 'duration' }]" @click="chartView = 'duration'">Duration</button>
              </div>
            </div>
            <div class="db2-bars-body">
              <div class="db2-bars-chart">
                <div v-for="(day, i) in weekCalendar" :key="day.date" class="db2-bar-col">
                  <div class="db2-bar" :style="{
                    height: weekDistance > 0
                      ? Math.max(day.activities.length > 0 ? 14 : 8, Math.round(day.activities.reduce((s, a) => s + (a.distanceMeters || 0), 0) / weekDistance * 120)) + 'px'
                      : (day.activities.length > 0 ? '14px' : '8px'),
                    background: day.isToday && day.activities.length > 0 ? '#FFC53D' : day.activities.length > 0 ? '#2A55F5' : '#EDE5D5'
                  }"></div>
                  <div class="db2-bar-lbl">{{ ['MON','TUE','WED','THU','FRI','SAT','SUN'][i] }}</div>
                </div>
              </div>
              <div class="db2-bars-totals">
                <div><span class="db2-bars-big">{{ formatDistance(weekDistance) }}</span><span class="db2-bars-meta"> this wk</span></div>
                <div><span class="db2-bars-big">{{ weekActivities }}</span><span class="db2-bars-meta"> workouts</span></div>
              </div>
            </div>
          </div>

          <!-- MONTHLY GOAL RING -->
          <div class="db2-card db2-goal-ring">
            <div class="db2-eyebrow">Monthly Goal</div>
            <div class="db2-ring-wrap">
              <svg viewBox="0 0 42 42" class="db2-ring-svg">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EDE5D5" stroke-width="5"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="#2A55F5" stroke-width="5"
                  :stroke-dasharray="`${monthlyGoalProgress} ${100 - monthlyGoalProgress}`"/>
              </svg>
              <div class="db2-ring-pct">{{ monthlyGoalProgress }}<span class="db2-ring-sym">%</span></div>
            </div>
            <div class="db2-ring-sub">{{ formatDistance(monthlyDistanceMeters) }} this month</div>
          </div>

          <!-- TRAINING INSIGHTS -->
          <div class="db2-card db2-insights">
            <div class="db2-card-head db2-card-head--ink">
              <div class="db2-eyebrow db2-eyebrow--cobalt">Training Insights</div>
            </div>
            <template v-if="dashInsights">
              <div class="db2-insights-grid">
                <div class="db2-insight-cell db2-insight-cell--br">
                  <div class="db2-insight-lbl">Fitness</div>
                  <div class="db2-insight-val">{{ dashInsights.fitnessScore }}</div>
                </div>
                <div class="db2-insight-cell db2-insight-cell--br">
                  <div class="db2-insight-lbl">Form</div>
                  <div class="db2-insight-val" :style="{ color: dashInsights.formScore > 0 ? '#FFC53D' : '#FBF6EC' }">
                    {{ dashInsights.formScore > 0 ? '+' : '' }}{{ dashInsights.formScore }}
                  </div>
                </div>
                <div class="db2-insight-cell">
                  <div class="db2-insight-lbl">ACWR</div>
                  <div class="db2-insight-val">{{ dashInsights.acwr ?? '—' }}</div>
                </div>
              </div>
            </template>
            <div v-else class="db2-insights-empty">Log 3+ activities to unlock</div>
            <div class="db2-insights-foot">
              <router-link to="/stats" class="db2-insights-link">Full analysis →</router-link>
            </div>
          </div>

          <!-- RECOVERY (WHOOP or other wearable-reported wellness) -->
          <div class="db2-card db2-recovery" v-if="todayWellness">
            <div class="db2-card-head">
              <div class="db2-card-title">Recovery</div>
              <div class="db2-recovery-date">Today</div>
            </div>

            <!-- Rings: Recovery + Strain -->
            <div class="db2-recovery-rings-row">
              <div class="db2-recovery-ring-cell" v-if="todayWellness.recoveryScore != null">
                <div class="db2-recovery-ring" :style="{ borderColor: recoveryColor }">
                  <span :style="{ color: recoveryColor }">{{ todayWellness.recoveryScore }}<span class="db2-recovery-pct">%</span></span>
                </div>
                <div class="db2-recovery-ring-lbl">Recovery</div>
              </div>
              <div class="db2-recovery-ring-cell" v-if="todayWellness.strain != null">
                <div class="db2-recovery-ring db2-recovery-ring--strain">
                  <span>{{ todayWellness.strain.toFixed(1) }}</span>
                </div>
                <div class="db2-recovery-ring-lbl">Strain · {{ strainBand }}</div>
              </div>
            </div>

            <!-- HRV / RHR / Sleep stats -->
            <div class="db2-recovery-stats">
              <div class="db2-recovery-stat" v-if="todayWellness.hrvMilli != null">
                <span class="db2-recovery-stat-lbl">HRV</span>
                <span class="db2-recovery-stat-val">{{ Math.round(todayWellness.hrvMilli) }}<span class="db2-recovery-unit">ms</span></span>
              </div>
              <div class="db2-recovery-stat" v-if="todayWellness.restingHeartRate != null">
                <span class="db2-recovery-stat-lbl">Resting HR</span>
                <span class="db2-recovery-stat-val">{{ todayWellness.restingHeartRate }}<span class="db2-recovery-unit">bpm</span></span>
              </div>
              <div class="db2-recovery-stat" v-if="todayWellness.sleepPerformancePct != null">
                <span class="db2-recovery-stat-lbl">Sleep</span>
                <span class="db2-recovery-stat-val">{{ todayWellness.sleepPerformancePct }}<span class="db2-recovery-unit">%</span></span>
              </div>
              <div class="db2-recovery-stat" v-if="todayWellness.totalSleepMinutes != null">
                <span class="db2-recovery-stat-lbl">Time Asleep</span>
                <span class="db2-recovery-stat-val">{{ Math.floor(todayWellness.totalSleepMinutes / 60) }}<span class="db2-recovery-unit">h</span> {{ todayWellness.totalSleepMinutes % 60 }}<span class="db2-recovery-unit">m</span></span>
              </div>
            </div>

            <!-- Sleep stage breakdown -->
            <div class="db2-sleep-stages" v-if="sleepStageBreakdown">
              <div class="db2-sleep-stages-bar">
                <div class="db2-sleep-stage-seg db2-sleep-stage-seg--light" :style="{ width: sleepStageBreakdown.lightPct + '%' }"></div>
                <div class="db2-sleep-stage-seg db2-sleep-stage-seg--deep" :style="{ width: sleepStageBreakdown.deepPct + '%' }"></div>
                <div class="db2-sleep-stage-seg db2-sleep-stage-seg--rem" :style="{ width: sleepStageBreakdown.remPct + '%' }"></div>
              </div>
              <div class="db2-sleep-stages-legend">
                <span class="db2-sleep-legend-item"><span class="db2-sleep-dot db2-sleep-dot--light"></span>Light {{ sleepStageBreakdown.lightPct }}%</span>
                <span class="db2-sleep-legend-item"><span class="db2-sleep-dot db2-sleep-dot--deep"></span>Deep {{ sleepStageBreakdown.deepPct }}%</span>
                <span class="db2-sleep-legend-item"><span class="db2-sleep-dot db2-sleep-dot--rem"></span>REM {{ sleepStageBreakdown.remPct }}%</span>
              </div>
            </div>
          </div>

          <!-- RECENT ACTIVITIES (grid-row span 2) -->
          <div class="db2-card db2-recent">
            <div class="db2-card-head">
              <div class="db2-card-title">Recent</div>
              <router-link to="/feed" class="db2-all-link">All →</router-link>
            </div>
            <div class="db2-recent-list">
              <router-link
                v-for="act in (activities || []).slice(0, 4)"
                :key="act.id"
                :to="`/activities/${act.id}`"
                class="db2-recent-row"
              >
                <div class="db2-recent-icon-wrap">{{ getSportIcon(act.sportType) }}</div>
                <div class="db2-recent-info">
                  <div class="db2-recent-name">{{ getActivityName(act) }}</div>
                  <div class="db2-recent-meta">{{ formatDuration(act.durationSeconds) }} · {{ formatDistance(act.distanceMeters) }}</div>
                </div>
                <div class="db2-recent-date">{{ formatDateShort(act.createdAt) }}</div>
              </router-link>
              <div v-if="!activities || !activities.length" class="db2-recent-empty">No activities yet — log your first!</div>
            </div>
            <div class="db2-recent-foot">
              <div class="db2-disc-lbl">Discipline Score</div>
              <div class="db2-disc-row">
                <span class="db2-disc-num">{{ disciplineData.score }}</span>
                <span class="db2-disc-level">{{ disciplineData.level }}</span>
              </div>
            </div>
          </div>

          <!-- COMPLETE PROFILE -->
          <div v-if="profileCompletion.pct < 100" class="db2-card db2-profile-card">
            <div class="db2-profile-top">
              <div class="db2-eyebrow">Complete Profile</div>
              <span class="db2-profile-pct-num">{{ profileCompletion.pct }}%</span>
            </div>
            <div class="db2-profile-bar-bg">
              <div class="db2-profile-bar-fill" :style="{ width: profileCompletion.pct + '%' }"></div>
            </div>
            <div class="db2-profile-list">
              <div class="db2-profile-item db2-profile-item--done">
                <span class="db2-profile-check db2-profile-check--done">✓</span>Verify email
              </div>
              <div v-for="item in profileCompletion.missing.slice(0, 2)" :key="item.key" class="db2-profile-item">
                <span class="db2-profile-check"></span>{{ item.label }}
              </div>
            </div>
          </div>
          <div v-else class="db2-card db2-profile-card">
            <div class="db2-eyebrow">Profile Complete</div>
            <div class="db2-profile-done-msg">You're all set!</div>
          </div>

          <!-- ACTIVITY BREAKDOWN DONUT -->
          <div class="db2-card db2-breakdown">
            <div class="db2-breakdown-inner">
              <div class="db2-breakdown-ring">
                <svg viewBox="0 0 42 42" class="db2-breakdown-svg">
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EDE5D5" stroke-width="7"/>
                  <circle v-if="sportBreakdown && sportBreakdown[0]" cx="21" cy="21" r="15.9" fill="none"
                    :stroke="sportBreakdown[0].color" stroke-width="7"
                    :stroke-dasharray="`${Math.round(sportBreakdown[0].count / Math.max(1, activities?.length || 1) * 100)} ${100 - Math.round(sportBreakdown[0].count / Math.max(1, activities?.length || 1) * 100)}`"/>
                  <circle v-if="sportBreakdown && sportBreakdown[1]" cx="21" cy="21" r="15.9" fill="none"
                    :stroke="sportBreakdown[1].color" stroke-width="7"
                    :stroke-dasharray="`${Math.round(sportBreakdown[1].count / Math.max(1, activities?.length || 1) * 100)} ${100 - Math.round(sportBreakdown[1].count / Math.max(1, activities?.length || 1) * 100)}`"
                    :stroke-dashoffset="`${-Math.round((sportBreakdown[0]?.count || 0) / Math.max(1, activities?.length || 1) * 100)}`"/>
                </svg>
                <div class="db2-breakdown-count">{{ activities?.length || 0 }}</div>
              </div>
              <div class="db2-breakdown-legend">
                <div v-for="s in (sportBreakdown || []).slice(0, 3)" :key="s.type" class="db2-bd-item">
                  <span class="db2-bd-dot" :style="{ background: s.color }"></span>
                  <span class="db2-bd-name">{{ s.type }}</span>
                  <span class="db2-bd-cnt">{{ s.count }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- UPGRADE (col-span 2) or MANAGE SUB -->
          <div v-if="subscriptionTier === 'free'" class="db2-card db2-upgrade">
            <div class="db2-upgrade-content">
              <div class="db2-upgrade-eyebrow">Upgrade to Pro</div>
              <div class="db2-upgrade-title">Route planning. Goal tracking. Pace insights.</div>
              <div class="db2-upgrade-sub">Everything you need to train like you mean it.</div>
            </div>
            <router-link to="/subscribe" class="db2-upgrade-cta">See Plans →</router-link>
          </div>
          <div v-else class="db2-card db2-manage-sub">
            <div class="db2-upgrade-content">
              <div class="db2-upgrade-eyebrow">Premium Active</div>
              <div class="db2-upgrade-title">You have full access.</div>
            </div>
            <router-link to="/billing" class="db2-upgrade-cta db2-upgrade-cta--manage">Manage Subscription →</router-link>
          </div>

        </div><!-- /.db2-bento -->
      </div><!-- /.db2-desktop -->

      <!-- v1 FALLBACK (mobile only until mobile-v2 PR merges) -->
      <div class="db2-v1-mobile">
      <!-- EDITORIAL GREETING (v1) -->
      <section class="dash-hero">
        <div class="dash-hero-inner">
          <header class="dash-greeting">
            <div class="greeting-left">
              <div class="greeting-dateline">{{ todayLine }}</div>
              <h1 class="greeting-headline">{{ greeting }}, <span class="greeting-name-cobalt">{{ user?.displayName?.split(' ')[0]?.toUpperCase() || 'ATHLETE' }}</span></h1>
            </div>
            <div class="greeting-right">
              <div class="training-block-badge">
                {{ trainingBlock.label }} PHASE
              </div>
              <div class="top-actions">
                <button class="btn btn-ghost" type="button" @click="openActivityModal">
                  <i class="bi bi-plus-lg me-2"></i>Log
                </button>
                <button class="btn btn-primary" type="button" @click="openMomentModal">
                  <i class="bi bi-camera-fill me-2"></i>Moment
                </button>
              </div>
            </div>
          </header>

          <!-- PERF STRIP -->
          <section class="perf-strip">
        <div class="perf-cell">
          <div class="perf-label">Total Distance</div>
          <div class="perf-num">{{ formatDistance(totalStats.distance) }}</div>
          <div class="perf-change" :class="{ 'perf-change--up': monthCompare && monthCompare.startsWith('+'), 'perf-change--down': monthCompare && !monthCompare.startsWith('+') }">
            {{ monthCompare || 'All time' }}
          </div>
        </div>
        <div class="perf-cell">
          <div class="perf-label">Total Time</div>
          <div class="perf-num">{{ totalStats.duration }}<span class="perf-unit">hrs</span></div>
          <div class="perf-change">All activities</div>
        </div>
        <div class="perf-cell" :class="{ 'streak-at-risk': totalStats.streak > 0 && !activityToday }">
          <div class="perf-label">🔥 Day Streak</div>
          <div class="perf-num">{{ totalStats.streak }}<span class="perf-unit">days</span></div>
          <div class="perf-change">{{ streakSubtitle }}</div>
        </div>
        <div class="perf-cell">
          <div class="perf-label">Following</div>
          <div class="perf-num">{{ friendsCount }}</div>
          <div class="perf-change">Athletes</div>
        </div>
          </section><!-- /.perf-strip -->
        </div><!-- /.dash-hero-inner -->
      </section><!-- /.dash-hero -->

      <!-- WEEK CALENDAR STRIP -->
      <section class="week-strip">
        <div class="week-strip-inner">
          <div class="week-strip-label">THIS WEEK</div>
          <div class="week-days">
            <div
              v-for="day in weekCalendar"
              :key="day.date"
              :class="['week-day', { 'is-today': day.isToday, 'has-activity': day.activities.length > 0, 'is-future': day.isFuture }]"
            >
              <div class="wday-label">{{ day.letter }}</div>
              <div class="wday-dot-wrap">
                <router-link
                  v-if="day.activities.length === 1"
                  :to="`/activities/${day.activities[0].id}`"
                  class="wday-dot wday-done"
                  :title="day.activities[0].sportType"
                >{{ getSportEmoji(day.activities[0].sportType) }}</router-link>
                <div v-else-if="day.activities.length > 1" class="wday-dot wday-multi">{{ day.activities.length }}</div>
                <div v-else-if="!day.isFuture" class="wday-dot wday-empty"></div>
                <div v-else class="wday-dot wday-future"></div>
              </div>
              <div class="wday-date">{{ day.dayNum }}</div>
            </div>
          </div>
          <div class="week-strip-totals">
            <span class="wst-item">{{ weekActivities }} workout{{ weekActivities !== 1 ? 's' : '' }}</span>
            <span class="wst-dot">·</span>
            <span class="wst-item">{{ formatDistance(weekDistance) }}</span>
          </div>
        </div>
      </section>

      <!-- TODAY'S WORKOUT -->
      <section v-if="todayWorkout" class="today-workout-strip">
        <div class="tw-eyebrow">TODAY'S WORKOUT</div>
        <div class="tw-body">
          <div class="tw-left">
            <div class="tw-name">{{ todayWorkout.name || todayWorkout.type }}</div>
            <div class="tw-meta">
              <span v-if="todayWorkout.type" class="tw-tag">{{ todayWorkout.type }}</span>
              <span v-if="todayWorkout.distance" class="tw-sep">·</span>
              <span v-if="todayWorkout.distance">{{ formatDistance(todayWorkout.distance * (isImperial ? 1609.34 : 1000)) }}</span>
              <span v-if="todayWorkout.duration" class="tw-sep">·</span>
              <span v-if="todayWorkout.duration">{{ todayWorkout.duration }}min</span>
            </div>
            <p v-if="todayWorkout.description" class="tw-desc">{{ todayWorkout.description }}</p>
          </div>
          <div class="tw-right">
            <span v-if="todayWorkout.isCompleted" class="tw-done-badge">✓ DONE</span>
            <router-link :to="`/plans/${fullActivePlan?.id || activePlan?.id}`" class="tw-view-btn">View Plan →</router-link>
          </div>
        </div>
      </section>

      <!-- MAIN GRID -->
      <section class="dashboard-grid">
        <!-- LEFT: Charts -->
        <div class="charts-section">
          <!-- Weekly Activity Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Weekly Activity</h3>
              <div class="chart-tabs">
                <button :class="['tab', {active: chartView === 'distance'}]" @click="chartView = 'distance'">Distance</button>
                <button :class="['tab', {active: chartView === 'duration'}]" @click="chartView = 'duration'">Duration</button>
              </div>
            </div>
            <div class="chart-body">
              <canvas ref="weeklyChart"></canvas>
            </div>
          </div>

          <!-- Activity Breakdown -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Activity Breakdown</h3>
              <select class="period-select" v-model="breakdownPeriod">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div class="chart-body chart-body-split">
              <div class="chart-doughnut">
                <canvas ref="activityPieChart"></canvas>
              </div>
              <div class="chart-legend">
                <div v-for="sport in sportBreakdown" :key="sport.type" class="legend-item">
                  <div class="legend-color" :style="{background: sport.color}"></div>
                  <div class="legend-text">
                    <div class="legend-label">{{ sport.type }}</div>
                    <div class="legend-value">{{ sport.count }} activities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Monthly Progress</h3>
              <div class="chart-metric">
                <span class="metric-value">{{ monthlyGoalProgress }}%</span>
                <span class="metric-label">of goal</span>
              </div>
            </div>
            <div class="chart-body">
              <canvas ref="progressChart"></canvas>
            </div>
          </div>
        </div>

        <!-- RIGHT: Activity Feed & Profile -->
        <div class="sidebar-section">
          <!-- Quick Profile -->
          <aside class="profile-card">
            <div class="profile-header">
              <UserAvatar :src="user.avatarUrl" :name="user.displayName || ''" :size="48" />
              <div class="profile-info">
                <div class="profile-name">{{ user.displayName || 'User' }}</div>
                <div class="profile-email">{{ user.email }}</div>
              </div>
            </div>

            <div class="profile-stats-mini">
              <div class="stat-mini">
                <div class="stat-mini-value">{{ friendsCount }}</div>
                <div class="stat-mini-label">Friends</div>
              </div>
              <div class="stat-mini">
                <div class="stat-mini-value">{{ followersCount }}</div>
                <div class="stat-mini-label">Followers</div>
              </div>
              <div class="stat-mini">
                <div class="stat-mini-value">{{ activities?.length || 0 }}</div>
                <div class="stat-mini-label">Activities</div>
              </div>
            </div>

            <div class="profile-badges">
              <template v-if="latestEarned.length">
                <div v-for="badge in latestEarned" :key="badge.id" class="badge-item">
                  <div class="badge-icon">{{ badge.icon }}</div>
                  <div class="badge-text">{{ badge.name }}</div>
                </div>
              </template>
              <div v-else class="badge-item">
                <div class="badge-icon">⭐</div>
                <div class="badge-text">Early Adopter</div>
              </div>
            </div>

            <!-- Discipline Score Widget -->
            <div class="disc-widget">
              <div class="disc-widget-header">
                <span class="disc-widget-label">DISCIPLINE SCORE</span>
                <span class="disc-widget-tip" title="Composite metric: consistency, frequency, early-morning commitment & volume trend">?</span>
              </div>
              <div class="disc-widget-hero">
                <span class="disc-score-num">{{ disciplineData.score }}</span>
                <span class="disc-level" :style="{ color: disciplineData.levelColor }">{{ disciplineData.level }}</span>
              </div>
              <div class="disc-bars">
                <div v-for="(item, key) in disciplineData.breakdown" :key="key" class="disc-bar-row">
                  <span class="disc-bar-label">{{ item.label }}</span>
                  <div class="disc-bar-track">
                    <div class="disc-bar-fill" :style="{ width: (item.score / item.max * 100) + '%' }"></div>
                  </div>
                  <span class="disc-bar-pts">{{ item.score }}/{{ item.max }}</span>
                </div>
              </div>
            </div>

            <!-- Archetype Widget -->
            <div class="archetype-widget">
              <div class="archetype-widget-label">ATHLETE ARCHETYPE</div>
              <div class="archetype-widget-body">
                <i :class="['bi', archetypeData.icon, 'archetype-widget-icon']" :style="{ color: archetypeData.color }"></i>
                <div>
                  <div class="archetype-widget-name" :style="{ color: archetypeData.color }">{{ archetypeData.label }}</div>
                  <div class="archetype-widget-tagline">{{ archetypeData.tagline }}</div>
                </div>
              </div>
              <div class="archetype-widget-traits">
                <span v-for="t in archetypeData.traits" :key="t" class="archetype-trait">{{ t }}</span>
              </div>
            </div>

            <!-- PR Widget -->
            <div class="profile-prs">
              <div class="prs-row-header">
                <span class="prs-label">⚡ Personal Records</span>
                <router-link to="/stats" class="prs-all-link">View all →</router-link>
              </div>
              <div v-if="!topPRs.length" class="prs-empty">Log activities to set PRs!</div>
              <div v-else class="prs-list">
                <div v-for="pr in topPRs" :key="pr.id" class="pr-mini">
                  <div class="pr-mini-label">{{ pr.label }}</div>
                  <div class="pr-mini-val">{{ formatPRValue(pr) }}</div>
                </div>
              </div>
            </div>

            <!-- Training Insights Widget -->
            <div v-if="dashInsights" class="dash-insights">
              <div class="dash-insights-label">TRAINING INSIGHTS</div>
              <div class="dash-insights-row">
                <div class="dash-insight-item">
                  <span class="dash-insight-key">Fitness</span>
                  <span class="dash-insight-val">{{ dashInsights.fitnessScore }}</span>
                </div>
                <div class="dash-insight-item">
                  <span class="dash-insight-key">Form</span>
                  <span class="dash-insight-val" :style="{ color: dashInsights.formScore > 5 ? '#2A55F5' : dashInsights.formScore > -5 ? '#767676' : '#ef4444' }">
                    {{ dashInsights.formScore > 0 ? '+' : '' }}{{ dashInsights.formScore }}
                  </span>
                </div>
                <div class="dash-insight-item" v-if="dashInsights.acwr !== null">
                  <span class="dash-insight-key">ACWR</span>
                  <span class="dash-insight-val" :style="{ color: dashInsights.acwr < 1.3 ? '#2A55F5' : dashInsights.acwr < 1.5 ? '#767676' : '#ef4444' }">
                    {{ dashInsights.acwr }}
                  </span>
                </div>
              </div>
              <router-link to="/stats" class="dash-insights-link">Full analysis →</router-link>
            </div>

            <div class="profile-actions">
              <button class="action-btn" @click="openActivityModal">
                <i class="bi bi-plus-circle me-2"></i>Log Activity
              </button>
              <button class="action-btn" @click="openFriendsModal">
                <i class="bi bi-people me-2"></i>Find Friends
              </button>
              <button class="action-btn" @click="openMomentModal">
                <i class="bi bi-camera me-2"></i>Share Moment
              </button>
              <button class="action-btn" @click="goToFeed">
                <i class="bi bi-collection me-2"></i>View Feed
              </button>
              <button class="action-btn action-btn-danger" @click="handleLogout">
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>

            <!-- Coach Widget -->
            <div v-if="myCoach" class="coach-widget">
              <div class="coach-widget-label">YOUR COACH</div>
              <div class="coach-widget-row">
                <div class="coach-avatar-sm">{{ (myCoach.displayName || '?')[0].toUpperCase() }}</div>
                <div class="coach-name">{{ myCoach.displayName }}</div>
              </div>
            </div>
            <!-- Profile Completion Nudge -->
            <div v-if="profileCompletion.pct < 100" class="profile-nudge">
              <div class="nudge-header">
                <span class="nudge-label">PROFILE</span>
                <span class="nudge-pct">{{ profileCompletion.pct }}%</span>
              </div>
              <div class="nudge-bar">
                <div class="nudge-fill" :style="{ width: profileCompletion.pct + '%' }"></div>
              </div>
              <ul class="nudge-list">
                <li v-for="item in profileCompletion.missing.slice(0, 2)" :key="item.key" class="nudge-item">
                  <i class="bi bi-circle me-2"></i>{{ item.label }}
                </li>
              </ul>
              <router-link to="/profile/edit" class="nudge-cta">Complete Profile →</router-link>
            </div>
            <!-- Subscription CTA -->
            <div v-if="subscriptionTier === 'free'" class="upgrade-banner">
              <div class="upgrade-label">UPGRADE TO PREMIUM</div>
              <p class="upgrade-desc">Route planning, goal tracking, and pace insights.</p>
              <router-link to="/subscribe" class="upgrade-btn">See Plans →</router-link>
            </div>
            <div v-else class="manage-sub-link">
              <router-link to="/billing">
                <i class="bi bi-credit-card me-2"></i>Manage Subscription →
              </router-link>
            </div>
          </aside>

          <!-- Recent Activities -->
          <div class="recent-activities">
            <div class="section-header">
              <h3 class="section-title">Recent Activities</h3>
              <div class="filters-compact">
                <button 
                  v-for="filter in filters" 
                  :key="filter"
                  :class="['filter-pill', { active: activeFilter === filter }]" 
                  @click="activeFilter = filter"
                >
                  {{ filter }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="sk-activity-list">
              <SkeletonCard v-for="n in 4" :key="n" variant="activity-row" />
            </div>

            <div v-else-if="filteredActivities.length" class="activities-list">
              <div
                v-for="activity in filteredActivities.slice(0, 5)"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">{{ getSportIcon(activity.sportType) }}</div>
                <div class="activity-details">
                  <div class="activity-name">{{ getActivityName(activity) }}</div>
                  <div class="activity-meta">
                    {{ formatDuration(activity.durationSeconds) }} • {{ formatDistance(activity.distanceMeters) }}
                  </div>
                </div>
                <div class="activity-date">{{ formatDateShort(activity.createdAt) }}</div>
              </div>
            </div>

            <div v-else class="activities-empty">
              <div class="empty-icon"><i class="bi bi-activity" style="font-size:2.5rem;color:var(--r-stone)"></i></div>
              <div class="empty-text">No activities yet</div>
              <button class="btn btn-sm btn-primary mt-2" @click="openActivityModal">Log First Activity</button>
            </div>
          </div>

          <!-- Goals Widget -->
          <div class="goals-widget">
            <div class="goals-header">
              <h3 class="goals-title">This Month's Goals</h3>
              <button class="goals-edit"><i class="bi bi-pencil"></i></button>
            </div>
            <div class="goal-item">
              <div class="goal-label">
                <span>Distance</span>
                <span class="goal-progress-text">{{ formatDistance(monthlyDistanceMeters) }}/{{ isImperial ? '100 mi' : '100 km' }}</span>
              </div>
              <div class="goal-bar">
                <div class="goal-fill" :style="{width: `${Math.min(Math.round(metersToDisplay(monthlyDistanceMeters)), 100)}%`}"></div>
              </div>
            </div>
            <div class="goal-item">
              <div class="goal-label">
                <span>Activities</span>
                <span class="goal-progress-text">{{ monthlyActivityCount }}/20 this month</span>
              </div>
              <div class="goal-bar">
                <div class="goal-fill" :style="{width: `${Math.min(monthlyActivityCount * 5, 100)}%`}"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      </div><!-- /.db2-v1-mobile -->

      <!-- ── MOBILE V2 DASHBOARD ── -->
      <div class="dash-mobile">

        <!-- HERO -->
        <div class="dm-hero">
          <div class="dm-hero-dateline">{{ todayLine }}</div>
          <h1 class="dm-hero-h1">{{ greeting }},<br><span class="dm-hero-name">{{ user?.displayName?.split(' ')[0]?.toUpperCase() || 'ATHLETE' }}.</span></h1>
          <div class="dm-hero-actions">
            <span class="dm-phase-badge" :style="{ borderColor: trainingBlock.color, color: trainingBlock.color }">{{ trainingBlock.label }} PHASE</span>
            <button class="dm-btn-ghost" type="button" @click="openActivityModal">＋ Log</button>
            <button class="dm-btn-cobalt" type="button" @click="openMomentModal">◉ Moment</button>
          </div>
          <div class="dm-stats-grid">
            <div class="dm-stat-cell dm-stat-cell--br dm-stat-cell--bb">
              <div class="dm-stat-lbl">Total Distance</div>
              <div class="dm-stat-num">{{ formatDistance(totalStats.distance) }}</div>
            </div>
            <div class="dm-stat-cell dm-stat-cell--bb">
              <div class="dm-stat-lbl">Total Time</div>
              <div class="dm-stat-num">{{ totalStats.duration }}<span class="dm-stat-unit">hrs</span></div>
            </div>
            <div class="dm-stat-cell dm-stat-cell--br">
              <div class="dm-stat-lbl">Day Streak</div>
              <div class="dm-stat-num dm-stat-num--yellow">{{ totalStats.streak }}</div>
            </div>
            <div class="dm-stat-cell">
              <div class="dm-stat-lbl">Following</div>
              <div class="dm-stat-num">{{ friendsCount }}</div>
            </div>
          </div>
        </div>

        <!-- WEEK RAIL -->
        <div class="dm-week-rail">
          <div class="dm-week-label">THIS WEEK · {{ weekActivities }} workout{{ weekActivities !== 1 ? 's' : '' }} · {{ formatDistance(weekDistance) }}</div>
          <div class="dm-week-days">
            <div v-for="day in weekCalendar" :key="day.date" class="dm-week-day">
              <div :class="['dm-day-circle', { 'dm-day-circle--today': day.isToday, 'dm-day-circle--done': !day.isToday && day.activities.length > 0 }]">
                {{ day.dayNum }}
              </div>
              <div class="dm-day-letter">{{ day.letter }}</div>
            </div>
          </div>
        </div>

        <!-- BODY STACK -->
        <div class="dm-body">

          <!-- FEATURED ACTIVITY -->
          <div v-if="activities && activities.length" class="dm-featured">
            <div class="dm-featured-head">
              <span class="dm-latest-badge">Latest</span>
              <div class="dm-featured-title">{{ getActivityName(activities[0]) }}</div>
              <div class="dm-featured-date">{{ formatDateShort(activities[0].createdAt) }}</div>
            </div>
            <div class="dm-featured-map">
              <svg viewBox="0 0 360 150" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
                <g stroke="rgba(251,246,236,0.07)" stroke-width="1" fill="none">
                  <path d="M0,50 H360"/><path d="M0,100 H360"/>
                  <path d="M120,0 V150"/><path d="M240,0 V150"/>
                </g>
                <path d="M24,120 C90,80 84,44 150,60 C230,80 210,40 290,58 C324,66 340,96 348,84" fill="none" stroke="#2A55F5" stroke-width="4" stroke-dasharray="700" stroke-dashoffset="700" style="animation:rkDashDraw 2.6s ease-out .2s forwards"/>
                <circle cx="24" cy="120" r="5" fill="#FBF6EC"/>
                <circle cx="348" cy="84" r="6" fill="#2A55F5" stroke="#FBF6EC" stroke-width="2"/>
              </svg>
              <router-link v-if="activities[0].id" :to="`/activities/${activities[0].id}`" class="dm-map-chip">{{ activities[0].title || activities[0].sportType || 'View Activity' }}</router-link>
            </div>
            <div class="dm-featured-stats">
              <div class="dm-fstat dm-fstat--br">
                <div class="dm-fstat-lbl">Dist</div>
                <div class="dm-fstat-num">{{ formatDistance(activities[0].distanceMeters) }}</div>
              </div>
              <div class="dm-fstat dm-fstat--br">
                <div class="dm-fstat-lbl">Time</div>
                <div class="dm-fstat-num">{{ formatDuration(activities[0].durationSeconds) }}</div>
              </div>
              <div class="dm-fstat">
                <div class="dm-fstat-lbl">Type</div>
                <div class="dm-fstat-num">{{ getSportIcon(activities[0].sportType) }}</div>
              </div>
            </div>
          </div>

          <!-- NEXT UP -->
          <div v-if="todayWorkout" class="dm-next-up">
            <div class="dm-next-head">
              <div class="dm-next-eyebrow">Next Up</div>
              <span class="dm-next-when">Tomorrow</span>
            </div>
            <div class="dm-next-body">
              <div class="dm-next-title">{{ todayWorkout.name || todayWorkout.type }}</div>
              <div class="dm-next-meta-boxes">
                <div v-if="todayWorkout.distance" class="dm-meta-box">
                  <div class="dm-meta-box-lbl">{{ isImperial ? 'MI' : 'KM' }}</div>
                  <div class="dm-meta-box-val">{{ todayWorkout.distance }}</div>
                </div>
                <div v-if="todayWorkout.duration" class="dm-meta-box">
                  <div class="dm-meta-box-lbl">Min</div>
                  <div class="dm-meta-box-val">{{ todayWorkout.duration }}</div>
                </div>
              </div>
              <p v-if="todayWorkout.description" class="dm-next-desc">{{ todayWorkout.description }}</p>
              <router-link :to="`/plans/${fullActivePlan?.id || activePlan?.id}`" class="dm-next-cta">View Plan →</router-link>
            </div>
          </div>

          <!-- GOAL RING + INSIGHTS -->
          <div class="dm-two-col">
            <!-- Goal Ring -->
            <div class="dm-goal-ring-card">
              <div class="dm-card-eyebrow">Monthly Goal</div>
              <div class="dm-ring-wrap">
                <svg viewBox="0 0 42 42" style="width:100%;height:100%;transform:rotate(-90deg)">
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#EDE5D5" stroke-width="5"/>
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#2A55F5" stroke-width="5"
                    :stroke-dasharray="`${monthlyGoalProgress} ${100 - monthlyGoalProgress}`"/>
                </svg>
                <div class="dm-ring-pct">{{ monthlyGoalProgress }}<span class="dm-ring-pct-sym">%</span></div>
              </div>
              <div class="dm-ring-sub">{{ formatDistance(monthlyDistanceMeters) }} this month</div>
            </div>
            <!-- Insights -->
            <div v-if="dashInsights" class="dm-insights-card">
              <div class="dm-insights-eyebrow">Insights</div>
              <div class="dm-insights-rows">
                <div class="dm-insight-row">
                  <span class="dm-insight-key">Fitness</span>
                  <span class="dm-insight-val">{{ dashInsights.fitnessScore }}</span>
                </div>
                <div class="dm-insight-row">
                  <span class="dm-insight-key">Form</span>
                  <span class="dm-insight-val" :style="{ color: dashInsights.formScore > 0 ? '#FFC53D' : '#FBF6EC' }">
                    {{ dashInsights.formScore > 0 ? '+' : '' }}{{ dashInsights.formScore }}
                  </span>
                </div>
                <div v-if="dashInsights.acwr !== null" class="dm-insight-row">
                  <span class="dm-insight-key">ACWR</span>
                  <span class="dm-insight-val">{{ dashInsights.acwr }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- WEEKLY BARS -->
          <div class="dm-bars-card">
            <div class="dm-bars-head">
              <div class="dm-bars-title">Weekly Activity</div>
            </div>
            <div class="dm-bars-chart">
              <div v-for="(day, i) in weekCalendar" :key="day.date" class="dm-bar-col">
                <div class="dm-bar"
                  :style="{
                    height: weeklyChartData[i] > 0 ? Math.max(Math.round(weeklyChartData[i] / Math.max.apply(null, weeklyChartData) * 88), 14) + 'px' : '8px',
                    background: day.isToday && weeklyChartData[i] > 0 ? '#FFC53D' : weeklyChartData[i] > 0 ? '#2A55F5' : '#EDE5D5'
                  }"
                ></div>
                <div class="dm-bar-lbl">{{ day.letter }}</div>
              </div>
            </div>
          </div>

          <!-- RECENT ACTIVITIES -->
          <div class="dm-recent-card">
            <div class="dm-recent-head">
              <div class="dm-recent-title">Recent</div>
              <router-link to="/feed" class="dm-recent-all">All →</router-link>
            </div>
            <div v-if="activities && activities.length">
              <router-link
                v-for="act in activities.slice(0, 3)"
                :key="act.id"
                :to="`/activities/${act.id}`"
                class="dm-activity-row"
              >
                <div class="dm-act-icon">{{ getSportIcon(act.sportType) }}</div>
                <div class="dm-act-info">
                  <div class="dm-act-name">{{ getActivityName(act) }}</div>
                  <div class="dm-act-meta">{{ formatDuration(act.durationSeconds) }} · {{ formatDistance(act.distanceMeters) }}</div>
                </div>
                <div class="dm-act-date">{{ formatDateShort(act.createdAt) }}</div>
              </router-link>
            </div>
            <div v-else class="dm-recent-empty">No activities yet — log your first one!</div>
          </div>

          <!-- COMPLETE PROFILE -->
          <div v-if="profileCompletion.pct < 100" class="dm-profile-card">
            <div class="dm-profile-head">
              <div class="dm-card-eyebrow">Complete Profile</div>
              <span class="dm-profile-pct">{{ profileCompletion.pct }}%</span>
            </div>
            <div class="dm-profile-bar">
              <div class="dm-profile-fill" :style="{ width: profileCompletion.pct + '%' }"></div>
            </div>
            <div class="dm-profile-items">
              <div v-for="item in profileCompletion.missing.slice(0, 3)" :key="item.key" class="dm-profile-item">
                <span class="dm-profile-check dm-profile-check--empty"></span>
                {{ item.label }}
              </div>
            </div>
          </div>

          <!-- UPGRADE TO PRO -->
          <div v-if="subscriptionTier === 'free'" class="dm-upgrade-card">
            <div class="dm-upgrade-eyebrow">Upgrade to Pro</div>
            <div class="dm-upgrade-headline">Route planning. Goal tracking. Pace insights.</div>
            <router-link to="/subscribe" class="dm-upgrade-cta">See Plans →</router-link>
          </div>

        </div><!-- /.dm-body -->
      </div><!-- /.dash-mobile -->
    </div>

    <!-- FIND FRIENDS MODAL -->
    <div v-if="showFriendsModal" class="modal-overlay" @click="closeFriendsModal">
      <div class="modal-card modal-large" @click.stop>
        <div class="modal-header">
          <h3>Find Friends</h3>
          <button class="modal-close" @click="closeFriendsModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Search Bar -->
          <div class="friends-search">
            <div class="search-input-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="form-control search-input"
                placeholder="Search by name or email..."
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- Tabs -->
          <div class="friends-tabs">
            <button 
              :class="['friends-tab', {active: friendsTab === 'search'}]" 
              @click="friendsTab = 'search'"
            >
              <i class="bi bi-search me-2"></i>Search
            </button>
            <button 
              :class="['friends-tab', {active: friendsTab === 'following'}]" 
              @click="friendsTab = 'following'"
            >
              <i class="bi bi-person-check me-2"></i>Following ({{ friendsCount }})
            </button>
            <button 
              :class="['friends-tab', {active: friendsTab === 'followers'}]" 
              @click="friendsTab = 'followers'"
            >
              <i class="bi bi-people me-2"></i>Followers ({{ followersCount }})
            </button>
          </div>

          <!-- Search Results -->
          <div v-if="friendsTab === 'search'" class="friends-list">
            <div v-if="searchLoading" class="friends-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Searching...</span>
            </div>

            <div v-else-if="searchResults.length" class="user-cards">
              <div v-for="searchUser in searchResults" :key="searchUser.id" class="user-card">
                <div class="user-avatar">{{ searchUser.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ searchUser.displayName || 'User' }}</div>
                  <div class="user-email">{{ searchUser.email }}</div>
                </div>
                <button 
                  v-if="!isFollowing(searchUser.id)"
                  class="btn btn-sm btn-primary" 
                  @click="followUser(searchUser.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-plus me-1"></i>Follow
                </button>
                <button 
                  v-else
                  class="btn btn-sm btn-outline" 
                  @click="unfollowUser(searchUser.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-check me-1"></i>Following
                </button>
              </div>
            </div>

            <div v-else-if="searchQuery" class="friends-empty">
              <i class="bi bi-search" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>No users found</p>
            </div>

            <div v-else class="friends-empty">
              <i class="bi bi-people" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>Search for friends by name or email</p>
            </div>
          </div>

          <!-- Following List -->
          <div v-if="friendsTab === 'following'" class="friends-list">
            <div v-if="friendsLoading" class="friends-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Loading...</span>
            </div>

            <div v-else-if="followingList.length" class="user-cards">
              <div v-for="friend in followingList" :key="friend.id" class="user-card">
                <div class="user-avatar">{{ friend.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ friend.displayName || 'User' }}</div>
                  <div class="user-stats">{{ friend.followerCount || 0 }} followers</div>
                </div>
                <button 
                  class="btn btn-sm btn-outline" 
                  @click="unfollowUser(friend.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-dash me-1"></i>Unfollow
                </button>
              </div>
            </div>

            <div v-else class="friends-empty">
              <i class="bi bi-people" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>You're not following anyone yet</p>
              <button class="btn btn-sm btn-primary mt-2" @click="friendsTab = 'search'">Find Friends</button>
            </div>
          </div>

          <!-- Followers List -->
          <div v-if="friendsTab === 'followers'" class="friends-list">
            <div v-if="friendsLoading" class="friends-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Loading...</span>
            </div>

            <div v-else-if="followersList.length" class="user-cards">
              <div v-for="follower in followersList" :key="follower.id" class="user-card">
                <div class="user-avatar">{{ follower.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ follower.displayName || 'User' }}</div>
                  <div class="user-stats">{{ follower.followingCount || 0 }} following</div>
                </div>
                <button 
                  v-if="!isFollowing(follower.id)"
                  class="btn btn-sm btn-primary" 
                  @click="followUser(follower.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-plus me-1"></i>Follow Back
                </button>
                <button 
                  v-else
                  class="btn btn-sm btn-outline" 
                  @click="unfollowUser(follower.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-check me-1"></i>Following
                </button>
              </div>
            </div>

            <div v-else class="friends-empty">
              <i class="bi bi-people" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>No followers yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LOG ACTIVITY MODAL -->
    <div v-if="showActivityModal" class="la-overlay" @click="closeActivityModal">
      <div class="la-sheet" @click.stop>

        <div class="la-head">
          <span class="la-title">Log Activity</span>
          <button class="la-close" @click="closeActivityModal" aria-label="Close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleActivitySubmit" class="la-form">

          <!-- Sport pill grid -->
          <div class="la-group">
            <div class="la-lbl">SPORT</div>
            <div class="la-sport-grid">
              <label :class="['la-sport', { 'la-sport--on': activityForm.sportType === 'RUN' }]">
                <input type="radio" v-model="activityForm.sportType" value="RUN" hidden required />Run
              </label>
              <label :class="['la-sport', { 'la-sport--on': activityForm.sportType === 'BIKE' }]">
                <input type="radio" v-model="activityForm.sportType" value="BIKE" hidden />Bike
              </label>
              <label :class="['la-sport', { 'la-sport--on': activityForm.sportType === 'SWIM' }]">
                <input type="radio" v-model="activityForm.sportType" value="SWIM" hidden />Swim
              </label>
              <label :class="['la-sport', { 'la-sport--on': activityForm.sportType === 'HIKE' }]">
                <input type="radio" v-model="activityForm.sportType" value="HIKE" hidden />Hike
              </label>
              <label :class="['la-sport', { 'la-sport--on': activityForm.sportType === 'WALK' }]">
                <input type="radio" v-model="activityForm.sportType" value="WALK" hidden />Walk
              </label>
              <label :class="['la-sport', { 'la-sport--on': activityForm.sportType === 'OTHER' }]">
                <input type="radio" v-model="activityForm.sportType" value="OTHER" hidden />Other
              </label>
            </div>
          </div>

          <!-- Duration -->
          <div class="la-group">
            <div class="la-lbl">DURATION</div>
            <div class="la-dur-row">
              <div class="la-dur-field">
                <input v-model.number="activityForm.durationMinutes" type="number" class="la-input la-input--dur" placeholder="00" min="0" required />
                <span class="la-unit">MIN</span>
              </div>
              <span class="la-dur-sep">:</span>
              <div class="la-dur-field">
                <input v-model.number="activityForm.durationSeconds" type="number" class="la-input la-input--dur" placeholder="00" min="0" max="59" />
                <span class="la-unit">SEC</span>
              </div>
            </div>
          </div>

          <!-- Distance -->
          <div class="la-group">
            <div class="la-lbl">DISTANCE <span class="la-optional">— OPTIONAL</span></div>
            <div class="la-dist-row">
              <input v-model.number="activityForm.distance" type="number" class="la-input" :placeholder="isImperial ? '0.0' : '0.0'" step="0.01" min="0" />
              <span class="la-unit">{{ distanceLabel }}</span>
            </div>
          </div>

          <!-- Title -->
          <div class="la-group">
            <div class="la-lbl">TITLE <span class="la-optional">— OPTIONAL</span></div>
            <input v-model="activityForm.title" type="text" class="la-input" placeholder="Morning run, track session…" />
          </div>

          <!-- Notes -->
          <div class="la-group">
            <div class="la-lbl">HOW'D IT GO? <span class="la-optional">— OPTIONAL</span></div>
            <div class="la-notes-wrap">
              <textarea v-model="activityForm.notes" class="la-input la-input--area" rows="3" placeholder="Legs felt good, pushed the last mile…"></textarea>
              <button
                v-if="micSupported"
                type="button"
                :class="['la-mic', { 'la-mic--on': micListening }]"
                @click="toggleListening(t => activityForm.notes = (activityForm.notes ? activityForm.notes + ' ' : '') + t)"
                :title="micListening ? 'Stop' : 'Dictate'"
              >
                <i :class="micListening ? 'bi bi-stop-fill' : 'bi bi-mic-fill'"></i>
              </button>
            </div>
          </div>

          <div v-if="activityError" class="la-error">{{ activityError }}</div>

          <div class="la-actions">
            <button type="button" class="la-btn-cancel" @click="closeActivityModal">Cancel</button>
            <button type="submit" class="la-btn-save" :disabled="activityLoading">
              <span v-if="activityLoading" class="spinner-border spinner-border-sm"></span>
              {{ activityLoading ? 'Saving…' : 'Save Activity' }}
            </button>
          </div>

        </form>
      </div>
    </div>

    <!-- CREATE MOMENT MODAL (keeping existing) -->
    <div v-if="showMomentModal" class="modal-overlay" @click="closeMomentModal">
      <div class="modal-card modal-large" @click.stop>
        <div class="modal-header">
          <h3>Create Moment</h3>
          <button class="modal-close" @click="closeMomentModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleMomentSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">Photo *</label>
            <div v-if="!photoPreview" class="upload-area" @click="triggerFileInput">
              <i class="bi bi-camera" style="font-size: 48px;"></i>
              <p>Tap to take photo or upload</p>
            </div>
            <div v-else class="photo-preview">
              <img :src="photoPreview" alt="Preview" />
              <button type="button" class="btn btn-sm btn-danger remove-btn" @click="removePhoto">
                <i class="bi bi-x"></i> Remove
              </button>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handlePhotoSelect"
              style="display: none"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Song Title *</label>
            <input 
              v-model="momentForm.songTitle" 
              type="text" 
              class="form-control"
              placeholder="What's your workout song?"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Artist *</label>
            <input 
              v-model="momentForm.songArtist" 
              type="text" 
              class="form-control"
              placeholder="Artist name"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Song Link <span class="optional">(optional)</span></label>
            <input 
              v-model="momentForm.songLink" 
              type="url" 
              class="form-control"
              placeholder="https://spotify.com/..."
            />
          </div>

          <div v-if="momentError" class="alert alert-danger">
            {{ momentError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeMomentModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="momentLoading || !photoPreview">
              <span v-if="momentLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ momentLoading ? `Uploading ${uploadProgress}%` : 'Post Moment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useActivityStore } from '@/stores/activity'
import { useMomentStore } from '@/stores/moment'
import { useUploadStore } from '@/stores/upload'
import { useFollowStore } from '@/stores/follow'
import { storeToRefs } from 'pinia'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import { useDisciplineScore } from '@/composables/useDisciplineScore'
import { useTrainingBlock } from '@/composables/useTrainingBlock'
import { useArchetype } from '@/composables/useArchetype'
import { useVoiceNote } from '@/composables/useVoiceNote'
import { usePlanStore } from '@/stores/plan'
import { useAchievementStore } from '@/stores/achievement'
import { usePRStore } from '@/stores/pr'
import { useAthleteStore } from '@/stores/athlete'
import AppSpinner from '@/components/AppSpinner.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import StoriesViewer from '@/components/StoriesViewer.vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import UserAvatar from '@/components/UserAvatar.vue'

Chart.register(...registerables)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const activityStore = useActivityStore()
const momentStore = useMomentStore()
const uploadStore = useUploadStore()
const followStore = useFollowStore()

const { user, subscriptionTier } = storeToRefs(authStore)

const profileCompletion = computed(() => {
  const u = user.value
  if (!u) return { pct: 0, missing: [] }
  const checks = [
    { key: 'avatar', label: 'Add a profile photo', done: !!u.avatarUrl },
    { key: 'bio', label: 'Write a bio', done: !!u.bio?.trim() },
    { key: 'location', label: 'Add your location', done: !!u.location?.trim() },
    { key: 'sport', label: 'Set your primary sport', done: !!u.primarySport },
  ]
  const done = checks.filter(c => c.done).length
  return {
    pct: Math.round((done / checks.length) * 100),
    missing: checks.filter(c => !c.done),
    total: checks.length,
    done,
  }
})

const { activities, loading } = storeToRefs(activityStore)
const { uploading: momentLoading, progress: uploadProgress } = storeToRefs(uploadStore)

const planStore = usePlanStore()
const achievementStore = useAchievementStore()
const prStore = usePRStore()
const athleteStore = useAthleteStore()
const { activePlan } = storeToRefs(planStore)
const { latestEarned } = storeToRefs(achievementStore)
const { topPRs } = storeToRefs(prStore)
const { myCoach } = storeToRefs(athleteStore)
const myCoachLoaded = ref(false)
const fullActivePlan = ref(null)
const { formatDistance, formatDuration, formatDurationClock, formatPace, formatElevation, isImperial, distanceLabel, elevationLabel, metersToDisplay } = useUnits()
const { isListening: micListening, isSupported: micSupported, toggleListening } = useVoiceNote()

const showActivityModal = ref(false)
const showMomentModal = ref(false)
const showFriendsModal = ref(false)

const activityForm = ref({
  sportType: '',
  title: '',
  workoutType: '',
  durationMinutes: null,
  durationSeconds: null,
  distance: null,
  gear: '',
  avgHeartRate: null,
  maxHeartRate: null,
  cadence: null,
  elevationGain: null,
  calories: null,
  notes: ''
})
const activityLoading = ref(false)
const activityError = ref('')

const momentForm = ref({
  photoUrl: '',
  songTitle: '',
  songArtist: '',
  songLink: ''
})
const photoFile = ref(null)
const photoPreview = ref(null)
const momentError = ref('')
const fileInput = ref(null)

// Friends/Follow state
const friendsTab = ref('search')
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const followingList = ref([])
const followersList = ref([])
const friendsLoading = ref(false)
const followLoading = ref(false)
const followingIds = ref(new Set())

const filters = ['All', 'Run', 'Bike', 'Swim', 'Hike', 'Walk']
const activeFilter = ref('All')

const chartView = ref('distance')
const breakdownPeriod = ref('month')

// Chart refs
const weeklyChart = ref(null)
const activityPieChart = ref(null)
const progressChart = ref(null)

let weeklyChartInstance = null
let pieChartInstance = null
let progressChartInstance = null

const userInitial = computed(() => {
  return user.value?.displayName?.charAt(0).toUpperCase() || 'U'
})

const currentStreak = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return 0

  const uniqueDays = [...new Set(
    acts.map(a => {
      const d = new Date(a.createdAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )].sort((a, b) => b - a)

  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (const ts of uniqueDays) {
    const diff = Math.round((cursor.getTime() - ts) / (1000 * 60 * 60 * 24))
    if (diff <= 1) {
      streak++
      cursor = new Date(ts)
    } else {
      break
    }
  }
  return streak
})

const activityToday = computed(() => {
  const today = new Date(); today.setHours(0,0,0,0)
  return (activities.value || []).some(a => {
    const d = new Date(a.createdAt); d.setHours(0,0,0,0)
    return d.getTime() === today.getTime()
  })
})

const getSportEmoji = (sport) => {
  const map = { RUN: '🏃', RUNNING: '🏃', BIKE: '🚴', CYCLING: '🚴', SWIM: '🏊', SWIMMING: '🏊', HIKE: '🥾', HIKING: '🥾', WALK: '🚶', WALKING: '🚶' }
  return map[sport?.toUpperCase()] || '⚡'
}

const weekCalendar = computed(() => {
  const acts = activities.value || []
  const today = new Date(); today.setHours(0, 0, 0, 0)
  // Get Monday of current week
  const monday = new Date(today)
  const dow = today.getDay()
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1))
  monday.setHours(0, 0, 0, 0)

  return ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((letter, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toDateString()
    const dayActs = acts.filter(a => {
      const d = new Date(a.createdAt); d.setHours(0, 0, 0, 0)
      return d.toDateString() === dateStr
    })
    return {
      letter,
      date: date.toISOString(),
      dayNum: date.getDate(),
      isToday: date.getTime() === today.getTime(),
      isFuture: date.getTime() > today.getTime(),
      activities: dayActs
    }
  })
})

const weekActivities = computed(() =>
  weekCalendar.value.reduce((sum, d) => sum + d.activities.length, 0)
)

const weekDistance = computed(() =>
  weekCalendar.value.reduce((sum, d) =>
    sum + d.activities.reduce((s, a) => s + (a.distanceMeters || 0), 0), 0)
)

const streakSubtitle = computed(() => {
  if (currentStreak.value === 0) return 'Start your streak!'
  if (!activityToday.value) return '⚠️ Log today to keep it!'
  if (currentStreak.value >= 30) return '🏆 Elite consistency!'
  if (currentStreak.value >= 14) return 'On fire! Keep going'
  if (currentStreak.value >= 7) return '1 week strong!'
  return 'Keep going!'
})

// Training insights (compact CTL/ATL/ACWR for sidebar widget)
const dashInsights = computed(() => {
  const acts = activities.value || []
  if (acts.length < 3) return null

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayMs = 86400000
  const DAYS = 90

  const dailyLoad = new Array(DAYS).fill(0)
  for (const a of acts) {
    const daysAgo = Math.floor((today - new Date(a.createdAt)) / dayMs)
    if (daysAgo >= 0 && daysAgo < DAYS) {
      dailyLoad[DAYS - 1 - daysAgo] += (a.distanceMeters || 0) / 1000
    }
  }

  let ctl = 0, atl = 0
  const ctlK = 1 / 42, atlK = 1 / 7
  for (let i = 0; i < DAYS; i++) {
    ctl = ctl * (1 - ctlK) + dailyLoad[i] * ctlK
    atl = atl * (1 - atlK) + dailyLoad[i] * atlK
  }

  const fitnessScore = Math.min(100, Math.round(ctl * 10))
  const fatigueScore = Math.min(100, Math.round(atl * 10))
  const formScore = Math.round(fitnessScore - fatigueScore)
  const acwr = ctl > 0 ? Math.round((atl / ctl) * 100) / 100 : null

  return { fitnessScore, fatigueScore, formScore, acwr }
})

const todayWorkout = computed(() => {
  const plan = fullActivePlan.value || activePlan.value
  if (!plan?.weeks?.length || !plan.startDate) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(plan.startDate)
  start.setHours(0, 0, 0, 0)

  const daysDiff = Math.floor((today - start) / 86400000)
  if (daysDiff < 0) return null

  const weekNum = Math.floor(daysDiff / 7) + 1
  const DOW_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = DOW_MAP[today.getDay()]

  const week = plan.weeks.find(w => (w.weekNumber ?? (plan.weeks.indexOf(w) + 1)) === weekNum)
  if (!week) return null
  return (week.workouts || []).find(w => w.day === todayName) || null
})

const disciplineData = computed(() => useDisciplineScore(activities.value))
const trainingBlock  = computed(() => useTrainingBlock(activities.value))
const archetypeData  = computed(() => useArchetype(activities.value))

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'GOOD MORNING'
  if (h < 17) return 'GOOD AFTERNOON'
  return 'GOOD EVENING'
})

const todayLine = computed(() => {
  const d = new Date()
  const day = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toUpperCase()
  const weekNum = Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000)
  return `${day} · ${date} · WEEK ${weekNum}`
})

const monthCompare = computed(() => {
  const acts = activities.value || []
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisKm = acts
    .filter(a => new Date(a.createdAt) >= thisMonthStart)
    .reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000

  const lastKm = acts
    .filter(a => {
      const d = new Date(a.createdAt)
      return d >= lastMonthStart && d < thisMonthStart
    })
    .reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000

  if (lastKm === 0) return null
  const pct = Math.round(((thisKm - lastKm) / lastKm) * 100)
  return pct >= 0 ? `+${pct}% vs last month` : `${pct}% vs last month`
})

const weeklyChartData = computed(() => {
  const acts = activities.value || []
  const days = [0, 0, 0, 0, 0, 0, 0] // Mon–Sun

  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  acts.forEach(a => {
    const d = new Date(a.createdAt)
    if (d >= monday) {
      const idx = (d.getDay() + 6) % 7
      if (chartView.value === 'distance') {
        days[idx] += metersToDisplay(a.distanceMeters || 0)
      } else {
        days[idx] += (a.durationSeconds || 0) / 60
      }
    }
  })

  return days.map(v => parseFloat(v.toFixed(1)))
})

const totalStats = computed(() => {
  const acts = activities.value || []
  const totalMeters = acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0)
  const totalDuration = acts.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 3600

  return {
    distance: totalMeters,
    duration: totalDuration.toFixed(1),
    streak: currentStreak.value,
    activities: acts.length
  }
})

const monthlyDistanceMeters = computed(() => {
  const now = new Date()
  const acts = (activities.value || []).filter(a => {
    const d = new Date(a.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  return acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0)
})

const monthlyActivityCount = computed(() => {
  const now = new Date()
  return (activities.value || []).filter(a => {
    const d = new Date(a.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length
})

const monthlyDistance = computed(() => {
  return (monthlyDistanceMeters.value / 1000).toFixed(1)
})

// 100 km (metric) or 100 mi (imperial) expressed in meters so the division is unit-consistent
const monthlyGoalProgress = computed(() => {
  const goalMeters = isImperial.value ? 160934 : 100000
  return Math.min(Math.round((monthlyDistanceMeters.value / goalMeters) * 100), 100)
})

const sportBreakdown = computed(() => {
  const now = new Date()
  let cutoff = null
  if (breakdownPeriod.value === 'week') {
    cutoff = new Date(now); cutoff.setDate(now.getDate() - 7)
  } else if (breakdownPeriod.value === 'month') {
    cutoff = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (breakdownPeriod.value === 'year') {
    cutoff = new Date(now.getFullYear(), 0, 1)
  }

  const acts = (activities.value || []).filter(a => !cutoff || new Date(a.createdAt) >= cutoff)
  const breakdown = {}
  const colors = {
    RUN:   '#0052FF',
    BIKE:  '#000000',
    SWIM:  '#0052FF',
    HIKE:  '#767676',
    WALK:  '#767676',
    OTHER: '#E5E5E5',
  }

  acts.forEach(a => {
    breakdown[a.sportType] = (breakdown[a.sportType] || 0) + 1
  })

  return Object.entries(breakdown).map(([type, count]) => ({
    type,
    count,
    color: colors[type] || colors.OTHER
  }))
})

const filteredActivities = computed(() => {
  if (!activities.value) return []
  if (activeFilter.value === 'All') return activities.value
  return activities.value.filter(a => a.sportType === activeFilter.value.toUpperCase())
})

const friendsCount = computed(() => followingList.value.length)
const followersCount = computed(() => followersList.value.length)

const getSportIcon = (sportType) => {
  const icons = {
    RUN: '🏃',
    BIKE: '🚴',
    SWIM: '🏊',
    HIKE: '🥾',
    WALK: '🚶',
    OTHER: '🏋️'
  }
  return icons[sportType] || '🏋️'
}

// Returns a contextual name like "Morning Run", "Evening Ride", etc.
const getActivityName = (activity) => {
  if (activity.title) return activity.title
  const hour = new Date(activity.createdAt).getHours()
  const time = hour < 5 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 20 ? 'Evening' : 'Night'
  const sport = { RUN: 'Run', BIKE: 'Ride', SWIM: 'Swim', HIKE: 'Hike', WALK: 'Walk' }[activity.sportType] || activity.sportType
  return `${time} ${sport}`
}

const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatPRValue = (pr) => {
  if (!pr.data) return '—'
  const { id, data: d } = pr
  if (['best_5k', 'best_10k', 'best_half', 'best_marathon'].includes(id)) {
    return formatDurationClock(d.estTime)
  }
  if (id === 'fastest_pace') return formatPace(d.pace / 60)
  if (id === 'most_elevation') return formatElevation(d.elevationMeters)
  return formatDistance(d.distanceMeters)
}

const openActivityModal = () => {
  showActivityModal.value = true
}

const closeActivityModal = () => {
  showActivityModal.value = false
  activityForm.value = {
    sportType: '', title: '', workoutType: '', durationMinutes: null, durationSeconds: null,
    distance: null, gear: '', avgHeartRate: null, maxHeartRate: null,
    cadence: null, elevationGain: null, calories: null, notes: ''
  }
  activityError.value = ''
}

const workoutTypeOptions = computed(() => {
  const s = activityForm.value.sportType
  if (s === 'RUN')  return ['Easy', 'Long Run', 'Tempo', 'Interval', 'Fartlek', 'Race', 'Recovery', 'Trail']
  if (s === 'BIKE') return ['Endurance', 'Hill', 'Interval', 'Race', 'Recovery', 'Commute']
  if (s === 'SWIM') return ['Easy', 'Drill', 'Interval', 'Open Water', 'Race']
  if (s === 'HIKE') return ['Trail', 'Mountain', 'Backpacking', 'Urban']
  if (s === 'WALK') return ['Easy', 'Brisk', 'Trail', 'Race Walk']
  return ['General', 'Strength', 'Cross Training', 'HIIT', 'Flexibility']
})

const gearPlaceholder = computed(() => {
  const s = activityForm.value.sportType
  if (s === 'RUN')  return 'e.g., Nike Vaporfly 3'
  if (s === 'BIKE') return 'e.g., Trek Domane SL 6'
  if (s === 'SWIM') return 'e.g., Speedo Fastskin'
  if (s === 'HIKE') return 'e.g., Salomon X Ultra 4'
  return 'e.g., Equipment name'
})

const openMomentModal = () => {
  showMomentModal.value = true
}

const closeMomentModal = () => {
  showMomentModal.value = false
  momentForm.value = { photoUrl: '', songTitle: '', songArtist: '', songLink: '' }
  photoFile.value = null
  photoPreview.value = null
  momentError.value = ''
}

const openFriendsModal = async () => {
  showFriendsModal.value = true
  await loadFollowData()
}

const closeFriendsModal = () => {
  showFriendsModal.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const handleActivitySubmit = async () => {
  activityLoading.value = true
  activityError.value = ''

  try {
    const f = activityForm.value
    const totalSeconds = (f.durationMinutes || 0) * 60 + (f.durationSeconds || 0)
    const distanceMeters = f.distance
      ? Math.round(f.distance * (isImperial.value ? 1609.34 : 1000))
      : null
    const elevationMeters = f.elevationGain
      ? isImperial.value ? f.elevationGain / 3.28084 : f.elevationGain
      : null

    await activityStore.createActivity({
      sportType: f.sportType,
      title: f.title || null,
      workoutType: f.workoutType || null,
      durationSeconds: totalSeconds,
      distanceMeters,
      gear: f.gear || null,
      avgHeartRate: f.avgHeartRate || null,
      maxHeartRate: f.maxHeartRate || null,
      cadence: f.cadence || null,
      elevationGain: elevationMeters ? Math.round(elevationMeters) : null,
      calories: f.calories || null,
      notes: f.notes || null,
    })

    closeActivityModal()
    await activityStore.fetchActivities()
    updateCharts()
  } catch (err) {
    activityError.value = err.response?.data?.error || 'Failed to create activity'
  } finally {
    activityLoading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  photoFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleMomentSubmit = async () => {
  momentError.value = ''

  try {
    momentForm.value.photoUrl = await uploadStore.uploadImage(photoFile.value)
    await momentStore.createMoment(momentForm.value)
    closeMomentModal()
    router.push('/feed')
  } catch (err) {
    momentError.value = err.response?.data?.error || 'Failed to create moment'
  }
}

// Friends/Follow functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/users/search?query=${searchQuery.value}`, {
      headers: getAuthHeaders()
    })
    searchResults.value = data.filter(u => u.id !== user.value.id)
  } catch {
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const loadFollowData = async () => {
  friendsLoading.value = true
  try {
    const [followingRes, followersRes] = await Promise.all([
      axios.get(`${API_URL}/follow/following`, { headers: getAuthHeaders() }),
      axios.get(`${API_URL}/follow/followers`, { headers: getAuthHeaders() })
    ])
    
    followingList.value = followingRes.data
    followersList.value = followersRes.data
    followingIds.value = new Set(followingList.value.map(f => f.id))
  } catch {
    // follow data is non-critical, silent fail
  } finally {
    friendsLoading.value = false
  }
}

const isFollowing = (userId) => {
  return followingIds.value.has(userId)
}

const followUser = async (userId) => {
  followLoading.value = true
  try {
    await axios.post(`${API_URL}/follow/${userId}`, {}, {
      headers: getAuthHeaders()
    })
    followingIds.value.add(userId)
    await loadFollowData()
  } catch {
    showToast('Failed to follow user. Please try again.', 'error')
  } finally {
    followLoading.value = false
  }
}

const unfollowUser = async (userId) => {
  followLoading.value = true
  try {
    await axios.delete(`${API_URL}/follow/${userId}`, {
      headers: getAuthHeaders()
    })
    followingIds.value.delete(userId)
    await loadFollowData()
  } catch {
    showToast('Failed to unfollow user. Please try again.', 'error')
  } finally {
    followLoading.value = false
  }
}

const goToFeed = () => {
  router.push('/feed')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// Chart initialization (keeping existing chart code)
const initWeeklyChart = () => {
  if (!weeklyChart.value) return
  
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy()
  }
  
  const ctx = weeklyChart.value.getContext('2d')
  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: chartView.value === 'distance' ? `Distance (${distanceLabel.value})` : 'Duration (min)',
        data: weeklyChartData.value,
        backgroundColor: '#0052FF',
        borderColor: '#0052FF',
        borderWidth: 1,
        borderRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true,
          grid: { color: 'rgba(15,18,16,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
}

const initPieChart = () => {
  if (!activityPieChart.value) return
  
  if (pieChartInstance) {
    pieChartInstance.destroy()
  }
  
  const ctx = activityPieChart.value.getContext('2d')
  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sportBreakdown.value.map(s => s.type),
      datasets: [{
        data: sportBreakdown.value.map(s => s.count),
        backgroundColor: sportBreakdown.value.map(s => s.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      cutout: '70%'
    }
  })
}

const initProgressChart = () => {
  if (!progressChart.value) return
  
  if (progressChartInstance) {
    progressChartInstance.destroy()
  }
  
  const ctx = progressChart.value.getContext('2d')
  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Distance',
        data: [15, 28, 42, parseFloat(monthlyDistance.value)],
        borderColor: '#0052FF',
        backgroundColor: 'rgba(0,82,255,0.07)',
        tension: 0.3,
        fill: true,
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#0052FF'
      }, {
        label: 'Goal',
        data: [25, 50, 75, 100],
        borderColor: 'rgba(107, 107, 107, 0.40)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true,
          grid: { color: 'rgba(15,18,16,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
}

const updateCharts = () => {
  nextTick(() => {
    initWeeklyChart()
    initPieChart()
    initProgressChart()
  })
}

watch(chartView, () => {
  initWeeklyChart()
})

watch(breakdownPeriod, () => {
  nextTick(initPieChart)
})

watch(activities, () => {
  updateCharts()
}, { deep: true })

const loadData = async () => {
  await Promise.all([
    activityStore.fetchActivities(),
    loadFollowData(),
    planStore.fetchPlans(),
    athleteStore.fetchMyCoach().finally(() => { myCoachLoaded.value = true })
  ])
  if (activePlan.value?.id) {
    planStore.fetchPlan(activePlan.value.id).then(data => { fullActivePlan.value = data }).catch(() => {})
  }
  await Promise.all([
    achievementStore.fetchAchievements(activities.value),
    prStore.fetchPRs(activities.value)
  ])
}

const { refreshing, pullY } = usePullToRefresh(loadData)

// Recovery/sleep/strain — only populated for users with a wearable that reports it (WHOOP today)
const todayWellness = ref(null)

async function loadTodayWellness() {
  try {
    const { data } = await axios.get(`${API_URL}/wellness/today`, { headers: getAuthHeaders() })
    todayWellness.value = data?.available === false ? null : data
  } catch {
    todayWellness.value = null
  }
}

const recoveryColor = computed(() => {
  const score = todayWellness.value?.recoveryScore
  if (score == null) return '#767676'
  if (score >= 67) return '#2A55F5'
  if (score >= 34) return '#FFC53D'
  return '#ef4444'
})

// WHOOP's own strain bands — 0-21 scale (Borg-based, not a percentage)
const strainBand = computed(() => {
  const s = todayWellness.value?.strain
  if (s == null) return ''
  if (s < 10) return 'Light'
  if (s < 14) return 'Moderate'
  if (s < 18) return 'Strenuous'
  return 'All Out'
})

const sleepStageBreakdown = computed(() => {
  const w = todayWellness.value
  if (!w || w.lightSleepMinutes == null || w.deepSleepMinutes == null || w.remSleepMinutes == null) return null
  const total = w.lightSleepMinutes + w.deepSleepMinutes + w.remSleepMinutes
  if (total <= 0) return null
  return {
    lightPct: Math.round((w.lightSleepMinutes / total) * 100),
    deepPct: Math.round((w.deepSleepMinutes / total) * 100),
    remPct: Math.round((w.remSleepMinutes / total) * 100),
  }
})

onMounted(async () => {
  // Render empty charts immediately so the canvas elements appear at once
  await nextTick()
  updateCharts()
  await loadData()
  loadTodayWellness()
})

onUnmounted(() => {
  if (weeklyChartInstance)   { weeklyChartInstance.destroy();   weeklyChartInstance   = null }
  if (pieChartInstance)      { pieChartInstance.destroy();      pieChartInstance      = null }
  if (progressChartInstance) { progressChartInstance.destroy(); progressChartInstance = null }
})
</script>

<style scoped>

/* ── Ink Hero ── */
.dash-hero {
  background: #16130F;
  color: #FBF6EC;
}
.dash-hero-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px 0;
}

/* ── Pull-to-refresh indicator ── */
.ptr-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: height 0.2s ease, opacity 0.2s ease;
  pointer-events: none;
}
.ptr-spinner {
  font-size: 1.4rem;
  color: #2A55F5;
  transition: transform 0.2s ease;
}
.ptr-spinner.spinning i {
  animation: ptr-spin 0.7s linear infinite;
}
@keyframes ptr-spin { to { transform: rotate(360deg); } }

/* ── Streak urgency banner ── */
.streak-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #fff8e1;
  border-bottom: 2px solid #ffc107;
  font-size: 0.85rem;
  color: #5a4000;
  flex-wrap: wrap;
}
.streak-banner-icon { font-size: 1.2rem; flex-shrink: 0; }
.streak-banner-text { flex: 1; min-width: 180px; line-height: 1.4; }
.streak-banner-cta {
  padding: 6px 14px;
  background: #2A55F5;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}
.streak-banner-cta:hover { background: #1E42D6; color: #fff; }

/* ── Activity skeleton list ── */
.sk-activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

/* Add new Friends Modal styles */
.friends-search {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #8a8a8a;
  font-size: 1.1rem;
}

.search-input {
  padding-left: 48px !important;
}

.friends-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #E7DFCE;
  padding-bottom: 16px;
}

.friends-tab {
  flex: 1;
  padding: 12px 16px;
  border-radius: 0;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  background: transparent;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.68rem;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.15s;
  color: #8a8a8a;
}

.friends-tab:hover {
  background: transparent;
  color: #16130F;
}

.friends-tab.active {
  background: transparent;
  color: #16130F;
  border-bottom-color: #2A55F5;
}

.friends-list {
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.friends-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 60px 20px;
  color: #8a8a8a;
}

.friends-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #8a8a8a;
  text-align: center;
}

.friends-empty p {
  margin-top: 12px;
  font-weight: 600;
}

.user-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #FBF6EC;
  border: 2px solid #E7DFCE;
  border-radius: 0;
  transition: background 0.15s;
}

.user-card:hover {
  background: #F1EADC;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 0;
  background: #2A55F5;
  border: 2px solid #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: #8a8a8a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-stats {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: #8a8a8a;
}

.profile-stats-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E7DFCE;
}

.stat-mini {
  text-align: center;
  padding: 10px;
  background: #FBF6EC;
  border-radius: 0;
  border: 2px solid #E7DFCE;
}

.stat-mini-value {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.5rem;
  line-height: 0.9;
  color: #16130F;
}

.stat-mini-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  color: #8a8a8a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 4px;
}

/* Keep all other existing styles */
.dash{min-height:100vh;padding-top:var(--page-top);background:#FBF6EC;font-family:'Hanken Grotesk',system-ui,sans-serif;color:#16130F}
.loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;color:#5a5348}
.dash-loader{width:32px;height:32px;border:2px solid rgba(22,19,15,0.10);border-top-color:#2A55F5;border-radius:50%;animation:spin 0.7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.wrap{max-width:1400px;margin:0 auto;padding:0 20px 56px}
.dash-greeting{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:28px;padding-bottom:24px;border-bottom:2px solid rgba(251,246,236,0.15)}
.greeting-left{flex:1;min-width:0}
.greeting-dateline{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;font-weight:700;letter-spacing:0.20em;color:rgba(251,246,236,0.45);text-transform:uppercase;margin-bottom:8px}
.greeting-headline{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:clamp(2rem,3.5vw,3.5rem);font-weight:900;text-transform:uppercase;line-height:0.88;color:#FBF6EC;margin:0}
.greeting-name-cobalt{color:#2A55F5}
.greeting-right{display:flex;flex-direction:column;align-items:flex-end;gap:12px;flex-shrink:0}
.training-block-badge{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.64rem;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;border:2px solid #FFC53D;color:#FFC53D;background:rgba(255,197,61,0.12);padding:5px 12px;white-space:nowrap;transform:rotate(2deg);display:inline-block}
.top-actions{display:flex;gap:10px;flex-wrap:wrap}
.perf-strip{display:grid;grid-template-columns:repeat(4,1fr);border-top:2px solid rgba(251,246,236,0.15);border-bottom:2px solid rgba(251,246,236,0.15);margin-bottom:0;background:rgba(251,246,236,0.06);gap:0}
.perf-cell{background:transparent;padding:24px 24px 28px;display:flex;flex-direction:column;border-right:2px solid rgba(251,246,236,0.12)}
.perf-cell:last-child{border-right:none}
.perf-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.60rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(251,246,236,0.45);margin-bottom:8px}
.perf-num{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:clamp(1.8rem,3vw,2.8rem);font-weight:900;line-height:0.9;color:#FBF6EC;display:flex;align-items:baseline;gap:4px;font-variant-numeric:tabular-nums}
.perf-unit{font-size:0.9rem;font-weight:600;color:rgba(251,246,236,0.40);margin-left:4px}
.perf-change{font-size:0.73rem;font-weight:600;color:rgba(251,246,236,0.35);margin-top:6px}
.perf-change--up{color:#FBF6EC;background:#2A55F5;padding:1px 6px;display:inline-block}
.perf-change--down{color:rgba(251,246,236,0.40)}
.perf-cell.streak-at-risk .perf-num{color:#FFC53D}
.perf-cell:has(.perf-label:first-child){}
.dashboard-grid{display:grid;grid-template-columns:1fr 380px;gap:24px;padding-top:24px}
.charts-section{display:flex;flex-direction:column;gap:24px}
.sidebar-section{display:flex;flex-direction:column;gap:24px}
.chart-card{background:#fff;border:2px solid #16130F;border-radius:0;padding:24px;box-shadow:none}
.chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.chart-title{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:1.3rem;font-weight:800;text-transform:uppercase;line-height:0.9;margin:0;color:#16130F}
.chart-tabs{display:flex;gap:8px}
.tab{padding:8px 16px;border-radius:0;border:2px solid #E7DFCE;background:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s}
.tab:hover{background:#F1EADC}
.tab.active{background:#2A55F5;color:white;border-color:#2A55F5}
.period-select{padding:8px 12px;border-radius:0;border:2px solid #E7DFCE;background:#fff;font-weight:600;font-size:0.85rem;font-family:'Hanken Grotesk',system-ui,sans-serif}
.chart-body{height:280px;position:relative}
.chart-body-split{display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:center}
.chart-doughnut{position:relative;height:200px}
.chart-legend{display:flex;flex-direction:column;gap:12px}
.legend-item{display:flex;align-items:center;gap:12px}
.legend-color{width:16px;height:16px;border-radius:0}
.legend-text{flex:1}
.legend-label{font-weight:700;font-size:0.9rem}
.legend-value{font-size:0.8rem;color:#5a5348}
.chart-metric{text-align:right}
.metric-value{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:2rem;font-weight:900;color:#2A55F5;line-height:0.9}
.metric-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#8a8a8a;display:block;margin-top:4px}
.profile-card{background:#fff;border:2px solid #16130F;border-radius:0;padding:24px;box-shadow:6px 6px 0 #16130F}
.profile-header{display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:2px solid #E7DFCE}
.avatar-large{width:64px;height:64px;background:#2A55F5;border:2px solid #16130F;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.7rem;color:#fff}
.profile-info{flex:1}
.profile-name{font-weight:900;font-size:1.15rem;margin-bottom:4px}
.profile-email{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.75rem;color:#8a8a8a}
.profile-badges{display:flex;gap:10px;margin-bottom:20px;padding-bottom:20px;border-bottom:2px solid #E7DFCE}
.badge-item{flex:1;padding:12px;background:#FBF6EC;border-radius:0;text-align:center;border:2px solid #E7DFCE}
.badge-icon{font-size:1.5rem;margin-bottom:4px}
.badge-text{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.66rem;font-weight:700;color:#5a5348;text-transform:uppercase;letter-spacing:0.08em}
.disc-widget{margin-bottom:20px;padding-bottom:20px;border-bottom:2px solid #E7DFCE}
.archetype-widget{padding-bottom:20px;border-bottom:2px solid #E7DFCE;margin-bottom:20px}
.archetype-widget-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.65rem;font-weight:700;letter-spacing:0.14em;color:#5a5348;text-transform:uppercase;margin-bottom:10px}
.archetype-widget-body{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.archetype-widget-icon{font-size:1.4rem}
.archetype-widget-name{font-size:0.78rem;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;line-height:1.2}
.archetype-widget-tagline{font-size:0.74rem;color:#8a8a8a;margin-top:2px}
.archetype-widget-traits{display:flex;flex-wrap:wrap;gap:4px}
.archetype-trait{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.62rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:2px 7px;border:2px solid #E7DFCE;color:#5a5348}
.disc-widget-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.disc-widget-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.65rem;font-weight:700;letter-spacing:0.14em;color:#5a5348;text-transform:uppercase}
.disc-widget-tip{width:16px;height:16px;border-radius:0;border:2px solid #E7DFCE;font-size:0.65rem;color:#8a8a8a;display:flex;align-items:center;justify-content:center;cursor:help}
.disc-widget-hero{display:flex;align-items:baseline;gap:10px;margin-bottom:12px}
.disc-score-num{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:2.2rem;font-weight:900;color:#16130F;line-height:0.9}
.disc-level{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#2A55F5}
.disc-bars{display:flex;flex-direction:column;gap:6px}
.disc-bar-row{display:grid;grid-template-columns:90px 1fr 36px;align-items:center;gap:8px}
.disc-bar-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;color:#5a5348;font-weight:600}
.disc-bar-track{height:4px;background:#E7DFCE;border-radius:0;overflow:hidden}
.disc-bar-fill{height:100%;background:#2A55F5;transition:width 0.4s ease}
.disc-bar-pts{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;font-weight:700;color:#8a8a8a;text-align:right}
.profile-prs{margin-bottom:20px;padding-bottom:20px;border-bottom:2px solid #E7DFCE}
.prs-row-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.prs-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.66rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5a5348}
.prs-all-link{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.66rem;color:#2A55F5;font-weight:700;text-decoration:none;letter-spacing:0.06em}
.prs-all-link:hover{color:#1E42D6}
.prs-empty{font-size:0.85rem;color:#8a8a8a;text-align:center;padding:8px}
.prs-list{display:flex;flex-direction:column;gap:8px}
.pr-mini{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#FFF3D6;border:2px solid #E7DFCE}
.pr-mini-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;color:#5a5348;font-weight:700;text-transform:uppercase;letter-spacing:0.06em}
.pr-mini-val{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:1.1rem;color:#16130F;font-weight:900;font-variant-numeric:tabular-nums}
.profile-actions{display:flex;flex-direction:column;gap:8px}
.action-btn{padding:12px 16px;border-radius:0;border:2px solid #E7DFCE;background:#FBF6EC;font-family:'Hanken Grotesk',system-ui,sans-serif;font-weight:700;font-size:0.88rem;text-align:left;cursor:pointer;transition:background 0.15s;display:flex;align-items:center;color:#16130F}
.action-btn:hover{background:#F1EADC;border-color:#E7DFCE}
.action-btn-danger{color:#dc2626;border-color:rgba(220,38,38,0.2)}
.action-btn-danger:hover{background:rgba(220,38,38,0.04)}
.coach-widget{margin-top:16px;padding:16px;border:2px solid #E7DFCE}
.coach-widget-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.65rem;font-weight:700;letter-spacing:0.14em;color:#8a8a8a;text-transform:uppercase;margin-bottom:10px}
.coach-widget-row{display:flex;align-items:center;gap:10px}
.coach-avatar-sm{width:34px;height:34px;background:#2A55F5;border:2px solid #16130F;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;flex-shrink:0}
.coach-name{font-weight:700;font-size:0.88rem}
.find-coach-cta{margin-top:12px;padding:4px 0}
.find-coach-cta a{font-size:0.82rem;font-weight:600;color:#2A55F5;text-decoration:none}
.find-coach-cta a:hover{text-decoration:underline}
.upgrade-banner{margin-top:16px;padding:20px;background:#16130F;border-radius:0;border:2px solid #16130F}
.upgrade-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.65rem;font-weight:700;letter-spacing:0.14em;color:rgba(251,246,236,0.45);text-transform:uppercase;margin-bottom:8px}
.upgrade-desc{font-size:0.82rem;color:rgba(251,246,236,0.65);margin:0 0 16px;line-height:1.5}
.upgrade-btn{display:inline-block;background:#2A55F5;color:#fff;font-family:'Spline Sans Mono',ui-monospace,monospace;font-weight:700;font-size:0.72rem;letter-spacing:0.10em;text-transform:uppercase;text-decoration:none;padding:10px 20px;border:2px solid #FBF6EC;border-radius:999px;transition:background 0.15s}
.upgrade-btn:hover{background:#1E42D6}
.manage-sub-link{margin-top:16px;padding:12px 0}
.manage-sub-link a{font-size:0.82rem;color:#5a5348;text-decoration:none;display:flex;align-items:center;transition:color 0.15s}
.manage-sub-link a:hover{color:#16130F}
.dash-insights{margin-top:16px;padding:16px;border:2px solid #16130F;background:#fff}
.dash-insights-label{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.65rem;font-weight:700;letter-spacing:0.12em;color:#2A55F5;text-transform:uppercase;margin-bottom:10px}
.dash-insights-row{display:flex;gap:16px;margin-bottom:8px}
.dash-insight-item{display:flex;flex-direction:column;gap:2px;flex:1}
.dash-insight-key{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#8a8a8a}
.dash-insight-val{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:1.4rem;font-weight:900;color:#16130F;line-height:0.9}
.dash-insights-link{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;font-weight:700;color:#2A55F5;text-decoration:none;letter-spacing:0.06em}
.dash-insights-link:hover{color:#1E42D6}
.recent-activities{background:#fff;border:2px solid #16130F;border-radius:0;padding:24px;box-shadow:none}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.section-title{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:1.3rem;font-weight:800;text-transform:uppercase;line-height:0.9;margin:0}
.filters-compact{display:flex;gap:6px;flex-wrap:wrap}
.filter-pill{padding:6px 12px;border-radius:0;border:2px solid #E7DFCE;background:#FBF6EC;font-family:'Spline Sans Mono',ui-monospace,monospace;font-weight:700;font-size:0.68rem;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all 0.15s}
.filter-pill:hover{background:#F1EADC}
.filter-pill.active{background:#2A55F5;color:white;border-color:#2A55F5}
.activities-loading{display:flex;align-items:center;gap:12px;justify-content:center;padding:40px;color:#8a8a8a}
.activities-list{display:flex;flex-direction:column;gap:10px}
.activity-item{display:flex;align-items:center;gap:14px;padding:12px 14px;background:#FBF6EC;border:2px solid #E7DFCE;border-radius:0;transition:background 0.15s}
.activity-item:hover{background:#F1EADC}
.activity-icon{font-size:1.8rem}
.activity-details{flex:1}
.activity-name{font-weight:700;font-size:0.9rem;margin-bottom:3px}
.activity-meta{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.72rem;color:#8a8a8a}
.activity-date{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;font-weight:700;color:#8a8a8a}
.activities-empty{text-align:center;padding:40px 20px}
.empty-icon{font-size:3rem;margin-bottom:12px}
.empty-text{font-weight:700;color:#8a8a8a;margin-bottom:12px}
.goals-widget{background:#fff;border:2px solid #16130F;border-radius:0;padding:24px;box-shadow:none}
.goals-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.goals-title{font-family:'Big Shoulders Display',system-ui,sans-serif;font-size:1.3rem;font-weight:800;text-transform:uppercase;line-height:0.9;margin:0}
.goals-edit{width:32px;height:32px;border-radius:0;border:2px solid #E7DFCE;background:#FBF6EC;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s;padding:6px;box-sizing:content-box}
.goals-edit:hover{background:#F1EADC}
.goal-item{margin-bottom:20px}
.goal-item:last-child{margin-bottom:0}
.goal-label{display:flex;justify-content:space-between;margin-bottom:8px;font-weight:700;font-size:0.9rem}
.goal-progress-text{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.72rem;color:#8a8a8a;font-weight:600}
.goal-bar{height:8px;background:#E7DFCE;border-radius:0;overflow:hidden}
.goal-fill{height:100%;background:#2A55F5;border-radius:0;transition:width 0.3s}
.btn{border:2px solid rgba(251,246,236,0.3);background:rgba(251,246,236,0.1);color:#FBF6EC;border-radius:0;height:44px;padding:0 16px;font-family:'Hanken Grotesk',system-ui,sans-serif;font-weight:700;letter-spacing:0.02em;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all 0.15s}
.btn:hover{background:rgba(251,246,236,0.18)}
.btn-primary{background:#2A55F5;border:2px solid #FBF6EC;color:#fff;border-radius:999px;box-shadow:3px 3px 0 rgba(0,0,0,0.3)}
.btn-primary:hover{background:#1E42D6}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed;box-shadow:none}
.btn-outline{background:transparent;border:2px solid rgba(251,246,236,0.4);color:#FBF6EC}
.btn-ghost{background:rgba(251,246,236,0.08);border:2px solid rgba(251,246,236,0.2);color:#FBF6EC}
.btn-sm{height:36px;padding:0 12px;font-size:0.82rem}
.btn-danger{background:#dc2626;border-color:#dc2626;color:white;border-radius:0}
.mt-2{margin-top:8px}
.me-1{margin-right:4px}
.me-2{margin-right:8px}
.modal-overlay{position:fixed;inset:0;background:rgba(22,19,15,0.72);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;animation:fadeIn 0.2s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal-card{background:#fff;border-radius:0;border:2px solid #16130F;box-shadow:6px 6px 0 #16130F;max-width:500px;width:100%;max-height:90vh;overflow:auto;animation:slideUp 0.3s ease}
.modal-large{max-width:600px}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:2px solid #E7DFCE}
.modal-header h3{font-family:'Big Shoulders Display',system-ui,sans-serif;font-weight:900;font-size:1.6rem;text-transform:uppercase;line-height:0.9;margin:0}
.modal-close{width:36px;height:36px;border-radius:0;border:2px solid #16130F;background:#FBF6EC;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s;color:#16130F}
.modal-close:hover{background:#F1EADC}
.modal-body{padding:24px}
.form-group{margin-bottom:20px}
.form-label{display:block;font-family:'Spline Sans Mono',ui-monospace,monospace;font-weight:700;font-size:0.64rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;color:#5a5348}
.optional{font-weight:500;font-size:0.85rem;color:#8a8a8a}
.form-control{width:100%;padding:12px 14px;border:2px solid #16130F;border-radius:0;background:#fff;font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:0.95rem;color:#16130F;transition:border-color 0.15s;outline:none}
.form-control:focus{border-color:#2A55F5}
.form-control::placeholder{color:#8a8a8a}
.upload-area{border:2px dashed #E7DFCE;border-radius:0;padding:60px 20px;text-align:center;cursor:pointer;transition:all 0.15s;background:#FBF6EC}
.upload-area:hover{border-color:#16130F;background:#F1EADC}
.upload-area i{color:#8a8a8a;margin-bottom:12px}
.upload-area p{color:#8a8a8a;margin:0}
.photo-preview{position:relative;border-radius:0;overflow:hidden;border:2px solid #E7DFCE}
.photo-preview img{width:100%;height:auto;display:block}
.remove-btn{position:absolute;top:12px;right:12px}
.alert{padding:12px 14px;border-radius:0;margin-bottom:16px}
.alert-danger{background:#FEF2F2;border:2px solid #FCA5A5;color:#DC2626;font-weight:600}
.modal-actions{display:flex;gap:12px;margin-top:24px}
.modal-actions .btn{flex:1}
.form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.duration-inputs{display:flex;gap:12px}
.duration-field{display:flex;align-items:center;gap:8px;flex:1}
.duration-field .form-control{flex:1}
.duration-unit{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.75rem;font-weight:700;color:#8a8a8a;white-space:nowrap}
textarea.form-control{resize:vertical;min-height:72px}
.notes-input-wrap{position:relative}
.notes-input-wrap textarea{padding-bottom:36px}
.mic-btn{position:absolute;bottom:8px;right:8px;width:28px;height:28px;border:none;border-radius:999px;background:#16130F;color:#FBF6EC;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.75rem;transition:background 0.2s}
.mic-btn:hover{background:#2A55F5}
.mic-btn--active{background:#ef4444;animation:mic-pulse 1s ease-in-out infinite}
@keyframes mic-pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0)}}
@media(max-width:480px){.form-row-2,.form-row-3{grid-template-columns:1fr}.perf-strip{grid-template-columns:repeat(2,1fr)}}
@media (max-width:1200px){.dashboard-grid{grid-template-columns:1fr}.sidebar-section{grid-template-columns:repeat(auto-fit,minmax(300px,1fr));display:grid}}
@media (max-width:768px){.perf-strip{grid-template-columns:repeat(2,1fr)}.dash-greeting{flex-direction:column;align-items:flex-start;gap:16px}.greeting-right{flex-direction:row;align-items:center;width:100%;justify-content:space-between}.greeting-headline{font-size:1.8rem}.top-actions{width:auto}.top-actions .btn{flex:1}.chart-body-split{grid-template-columns:1fr;gap:20px}.chart-doughnut{height:180px;margin:0 auto}.wrap{padding:20px 16px 48px}.today-workout-strip{padding:16px}.week-strip-inner{padding:14px 16px 12px}.profile-card{display:none}.dashboard-grid{grid-template-columns:1fr}.sidebar-section{order:-1}.charts-section{order:1}}
@media(max-width:375px){.perf-strip{grid-template-columns:repeat(2,1fr)}.profile-stats-mini{grid-template-columns:repeat(2,1fr)}.top-actions .btn{font-size:0.72rem;padding:10px 12px}}

/* ── Week Calendar Strip ─────────────────────────────────────────── */
.week-strip {
  background: #F1EADC;
  border-bottom: 2px solid #16130F;
}
.week-strip-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 18px 24px 16px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.week-strip-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #8a8a8a;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}
.week-days {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: center;
}
.week-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  flex: 1;
  max-width: 52px;
}
.wday-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8a8a8a;
  text-transform: uppercase;
}
.week-day.is-today .wday-label { color: #2A55F5; }
.wday-dot-wrap {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wday-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  text-decoration: none;
  transition: transform 0.15s;
  flex-shrink: 0;
}
.wday-done {
  background: rgba(42, 85, 245, 0.12);
  border: 2px solid #2A55F5;
}
.wday-done:hover { transform: scale(1.12); }
.week-day.is-today .wday-done {
  background: #2A55F5;
  border-color: #2A55F5;
}
.wday-empty {
  background: rgba(22,19,15,0.05);
  border: 2px solid #E7DFCE;
}
.wday-future {
  background: transparent;
  border: 2px dashed #E7DFCE;
}
.wday-multi {
  background: #2A55F5;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: default;
  border: 2px solid #2A55F5;
}
.wday-date {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  color: #8a8a8a;
  font-weight: 600;
}
.week-day.is-today .wday-date { color: #2A55F5; font-weight: 700; }
.week-strip-totals {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}
.wst-item {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5a5348;
}
.wst-dot { color: #E7DFCE; font-size: 0.9rem; }
@media (max-width: 600px) {
  .week-strip-inner { padding: 14px 16px 12px; gap: 12px; }
  .week-strip-label { display: none; }
  .week-strip-totals { display: none; }
  .wday-dot { width: 32px; height: 32px; font-size: 0.9rem; }
  .wday-dot-wrap { width: 34px; height: 34px; }
}

/* TODAY'S WORKOUT STRIP */
.today-workout-strip {
  background: #16130F;
  color: #FBF6EC;
  padding: 20px 24px;
}
.tw-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  margin-bottom: 10px;
}
.tw-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.tw-left { flex: 1; min-width: 0; }
.tw-name {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 6px;
}
.tw-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.60);
  flex-wrap: wrap;
}
.tw-tag {
  background: rgba(255,255,255,0.10);
  padding: 2px 8px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tw-sep { color: rgba(255,255,255,0.25); }
.tw-desc {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.50);
  margin: 6px 0 0;
  line-height: 1.4;
}
.tw-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.tw-done-badge {
  background: #EEF1FF;
  color: #2A55F5;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  padding: 4px 10px;
}
.tw-view-btn {
  color: #fff;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.35);
  padding-bottom: 1px;
}
.tw-view-btn:hover { border-bottom-color: #fff; color: #fff; }

/* Profile completion nudge */
.profile-nudge { padding: 16px; border: 2px solid #E7DFCE; margin-bottom: 16px; }
.nudge-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.nudge-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.18em; color: #767676; }
.nudge-pct { font-size: 0.78rem; font-weight: 900; color: #2A55F5; }
.nudge-bar { height: 3px; background: #E7DFCE; margin-bottom: 12px; }
.nudge-fill { height: 100%; background: #2A55F5; transition: width 0.4s; }
.nudge-list { list-style: none; padding: 0; margin: 0 0 12px; }
.nudge-item { font-size: 0.78rem; color: #5a5348; padding: 2px 0; display: flex; align-items: center; }
.nudge-cta { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: #2A55F5; text-decoration: none; }
.nudge-cta:hover { text-decoration: underline; }

/* ── LOG ACTIVITY MODAL ── */
.la-overlay{position:fixed;inset:0;background:rgba(22,19,15,0.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;animation:fadeIn 0.2s ease}
.la-sheet{background:#FBF6EC;border:2px solid #16130F;box-shadow:6px 6px 0 #16130F;max-width:460px;width:100%;max-height:90vh;overflow-y:auto;animation:slideUp 0.25s ease}
.la-head{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:2px solid #16130F;background:#16130F}
.la-title{font-family:'Big Shoulders Display',system-ui,sans-serif;font-weight:900;font-size:1.5rem;text-transform:uppercase;letter-spacing:0.02em;color:#FBF6EC}
.la-close{width:34px;height:34px;border:2px solid rgba(251,246,236,0.4);background:transparent;color:#FBF6EC;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.85rem;transition:border-color 0.15s}
.la-close:hover{border-color:#FBF6EC}
.la-form{padding:22px;display:flex;flex-direction:column;gap:20px}
.la-group{display:flex;flex-direction:column;gap:7px}
.la-lbl{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#5A5348}
.la-optional{color:#8A8A8A;font-weight:500;letter-spacing:0.1em}
/* sport pills */
.la-sport-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.la-sport{display:flex;align-items:center;justify-content:center;height:42px;border:2px solid #E7DFCE;background:#fff;font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5A5348;cursor:pointer;transition:all 0.15s;user-select:none}
.la-sport:hover{border-color:#16130F;color:#16130F}
.la-sport--on{background:#16130F;border-color:#16130F;color:#FBF6EC;box-shadow:3px 3px 0 #2A55F5}
/* inputs */
.la-input{background:#fff;border:2px solid #E7DFCE;border-radius:0;padding:11px 13px;font-family:'Hanken Grotesk',system-ui,sans-serif;font-size:1rem;font-weight:600;color:#16130F;transition:border-color 0.15s;width:100%;box-sizing:border-box}
.la-input:focus{outline:none;border-color:#16130F}
.la-input::placeholder{color:#8A8A8A;font-weight:400}
.la-input--dur{text-align:center;font-size:1.5rem;font-weight:800;font-family:'Spline Sans Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums;padding:10px 6px}
.la-input--area{resize:none;padding-right:46px}
/* duration */
.la-dur-row{display:flex;align-items:center;gap:10px}
.la-dur-field{display:flex;align-items:center;gap:7px;flex:1}
.la-dur-sep{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:1.5rem;font-weight:700;color:#C7BEB0}
.la-unit{font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.6rem;font-weight:700;letter-spacing:0.14em;color:#8A8A8A;text-transform:uppercase;white-space:nowrap}
/* distance */
.la-dist-row{display:flex;align-items:center;gap:10px}
.la-dist-row .la-input{flex:1}
/* notes */
.la-notes-wrap{position:relative}
.la-mic{position:absolute;right:10px;top:10px;width:30px;height:30px;border:2px solid #E7DFCE;background:#FBF6EC;color:#5A5348;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.8rem;transition:all 0.15s}
.la-mic:hover{border-color:#16130F;color:#16130F}
.la-mic--on{background:#16130F;border-color:#16130F;color:#FBF6EC}
/* error */
.la-error{background:rgba(220,38,38,0.08);border:2px solid rgba(220,38,38,0.3);color:#991b1b;padding:11px 13px;font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.72rem;font-weight:600}
/* actions */
.la-actions{display:flex;gap:10px}
.la-btn-cancel{flex:1;height:48px;background:transparent;border:2px solid #E7DFCE;font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.68rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5A5348;cursor:pointer;transition:border-color 0.15s,color 0.15s}
.la-btn-cancel:hover{border-color:#16130F;color:#16130F}
.la-btn-save{flex:2;height:48px;background:#2A55F5;border:2px solid #16130F;border-radius:999px;box-shadow:3px 3px 0 #16130F;font-family:'Spline Sans Mono',ui-monospace,monospace;font-size:0.72rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#fff;cursor:pointer;transition:background 0.15s,box-shadow 0.15s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
.la-btn-save:hover:not(:disabled){background:#1E42D6;box-shadow:5px 5px 0 #16130F}
.la-btn-save:disabled{opacity:0.6;cursor:not-allowed;box-shadow:none}
@media(max-width:480px){.la-form{padding:18px 14px}.la-sport-grid{grid-template-columns:repeat(3,1fr)}}

/* ─────────────────────────────────────────────
   MOBILE V2 DASHBOARD  (.dm-*)
   Shown ONLY on ≤768px; desktop sections hidden on ≤768px
───────────────────────────────────────────── */

/* dash-mobile wrapper — hidden on desktop */
.dash-mobile { display: none; }

@keyframes rkDashDraw {
  to { stroke-dashoffset: 0; }
}

@media (max-width: 768px) {

  /* hide desktop bento + all legacy desktop sections on mobile */
  .db2-desktop,
  .dash-hero,
  .week-strip,
  .today-workout-strip,
  .dashboard-grid { display: none !important; }

  /* show mobile layout */
  .dash-mobile {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #FBF6EC;
    padding-bottom: 80px;
  }

  /* ── HERO ── */
  .dm-hero {
    background: #16130F;
    color: #FBF6EC;
    padding: 28px 20px 24px;
    border-bottom: 2px solid #16130F;
  }
  .dm-hero-dateline {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(251,246,236,0.5);
    margin-bottom: 10px;
  }
  .dm-hero-h1 {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 900;
    font-size: clamp(44px, 11vw, 64px);
    line-height: 0.85;
    text-transform: uppercase;
    margin: 0 0 4px;
    color: rgba(251,246,236,0.55);
  }
  .dm-hero-name { color: #FBF6EC; }

  .dm-hero-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 20px 0;
    flex-wrap: wrap;
  }
  .dm-phase-badge {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border: 1.5px solid;
    padding: 4px 9px;
    transform: rotate(-2deg);
    white-space: nowrap;
  }
  .dm-btn-ghost {
    flex: 1;
    height: 42px;
    background: transparent;
    border: 2px solid rgba(251,246,236,0.35);
    border-radius: 999px;
    color: #FBF6EC;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: border-color 0.15s;
    white-space: nowrap;
  }
  .dm-btn-ghost:hover { border-color: #FBF6EC; }
  .dm-btn-cobalt {
    flex: 1.5;
    height: 42px;
    background: #2A55F5;
    border: 2px solid #2A55F5;
    border-radius: 999px;
    color: #fff;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    box-shadow: 3px 3px 0 rgba(251,246,236,0.25);
    transition: background 0.15s;
    white-space: nowrap;
  }
  .dm-btn-cobalt:hover { background: #1E42D6; }

  /* stats 2×2 */
  .dm-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 2px solid rgba(251,246,236,0.15);
    margin-top: 4px;
  }
  .dm-stat-cell {
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .dm-stat-cell--br { border-right: 2px solid rgba(251,246,236,0.15); }
  .dm-stat-cell--bb { border-bottom: 2px solid rgba(251,246,236,0.15); }
  .dm-stat-lbl {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(251,246,236,0.45);
  }
  .dm-stat-num {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 900;
    font-size: 2rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .dm-stat-num--yellow { color: #FFC53D; }
  .dm-stat-unit {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(251,246,236,0.45);
    margin-left: 3px;
  }

  /* ── WEEK RAIL ── */
  .dm-week-rail {
    background: #F1EADC;
    padding: 16px 20px;
    border-bottom: 2px solid #16130F;
  }
  .dm-week-label {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #5A5348;
    margin-bottom: 14px;
  }
  .dm-week-days {
    display: flex;
    justify-content: space-between;
    gap: 4px;
  }
  .dm-week-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
  }
  .dm-day-circle {
    width: 36px;
    height: 36px;
    border: 2px dashed #C7BEB0;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: #8A8A8A;
  }
  .dm-day-circle--today {
    background: #2A55F5;
    border: 2px solid #16130F;
    color: #fff;
  }
  .dm-day-circle--done {
    background: rgba(42,85,245,0.12);
    border: 2px solid #2A55F5;
    color: #2A55F5;
  }
  .dm-day-letter {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8A8A;
  }

  /* ── BODY STACK ── */
  .dm-body {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── FEATURED ACTIVITY ── */
  .dm-featured {
    background: #16130F;
    color: #FBF6EC;
    border-bottom: 4px solid #2A55F5;
    margin-bottom: 4px;
  }
  .dm-featured-head { padding: 18px 20px 14px; }
  .dm-latest-badge {
    display: inline-block;
    background: #2A55F5;
    color: #fff;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 4px 9px;
    border: 2px solid rgba(251,246,236,0.2);
    transform: rotate(-2deg);
    margin-bottom: 10px;
  }
  .dm-featured-title {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.6rem;
    text-transform: uppercase;
    line-height: 0.9;
    margin-top: 8px;
  }
  .dm-featured-date {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 600;
    color: rgba(251,246,236,0.45);
    margin-top: 6px;
  }
  .dm-featured-map {
    position: relative;
    height: 150px;
    background: #0F0D0A;
    border-top: 1px solid rgba(255,255,255,0.08);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    overflow: hidden;
  }
  .dm-map-chip {
    position: absolute;
    bottom: 12px;
    right: 12px;
    background: #2A55F5;
    color: #fff;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 10px;
    text-decoration: none;
    border: 2px solid rgba(251,246,236,0.2);
  }
  .dm-map-chip:hover { text-decoration: none; color: #fff; opacity: 0.85; }
  .dm-featured-stats {
    display: flex;
    border-top: 1px solid rgba(251,246,236,0.12);
  }
  .dm-fstat {
    flex: 1;
    padding: 14px 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .dm-fstat--br { border-right: 1px solid rgba(251,246,236,0.12); }
  .dm-fstat-lbl {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(251,246,236,0.4);
  }
  .dm-fstat-num {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.4rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  /* ── NEXT UP ── */
  .dm-next-up {
    background: #fff;
    border-bottom: 2px solid #16130F;
    padding: 18px 20px;
    margin-bottom: 4px;
  }
  .dm-next-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .dm-next-eyebrow {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #2A55F5;
  }
  .dm-next-when {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.58rem;
    font-weight: 600;
    color: #8A8A8A;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .dm-next-title {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    text-transform: uppercase;
    line-height: 0.9;
    margin-bottom: 12px;
  }
  .dm-next-meta-boxes {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .dm-meta-box {
    border: 2px solid #16130F;
    padding: 7px 12px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 60px;
  }
  .dm-meta-box-lbl {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5A5348;
  }
  .dm-meta-box-val {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .dm-next-desc {
    font-size: 0.85rem;
    color: #5A5348;
    line-height: 1.5;
    margin: 0 0 14px;
  }
  .dm-next-cta {
    display: inline-block;
    background: #16130F;
    color: #FBF6EC;
    border: 2px solid #16130F;
    border-radius: 999px;
    padding: 10px 20px;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    box-shadow: 3px 3px 0 #2A55F5;
    transition: opacity 0.15s;
  }
  .dm-next-cta:hover { opacity: 0.85; text-decoration: none; color: #FBF6EC; }

  /* ── GOAL RING + INSIGHTS 2-col ── */
  .dm-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    border-bottom: 2px solid #16130F;
    margin-bottom: 4px;
  }
  .dm-goal-ring-card {
    background: #fff;
    border-right: 2px solid #16130F;
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .dm-card-eyebrow {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #2A55F5;
    align-self: flex-start;
  }
  .dm-ring-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dm-ring-pct {
    position: absolute;
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 900;
    font-size: 1.4rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .dm-ring-pct-sym { font-size: 0.8rem; font-weight: 700; }
  .dm-ring-sub {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.58rem;
    font-weight: 600;
    color: #8A8A8A;
    text-align: center;
    line-height: 1.4;
  }
  .dm-insights-card {
    background: #16130F;
    color: #FBF6EC;
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .dm-insights-eyebrow {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(251,246,236,0.45);
  }
  .dm-insights-rows { display: flex; flex-direction: column; gap: 10px; }
  .dm-insight-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(251,246,236,0.1);
    padding-bottom: 8px;
  }
  .dm-insight-row:last-child { border-bottom: none; padding-bottom: 0; }
  .dm-insight-key {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(251,246,236,0.5);
  }
  .dm-insight-val {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.3rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  /* ── WEEKLY BARS ── */
  .dm-bars-card {
    background: #fff;
    border-bottom: 2px solid #16130F;
    padding: 18px 20px;
    margin-bottom: 4px;
  }
  .dm-bars-head { margin-bottom: 16px; }
  .dm-bars-title {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #2A55F5;
  }
  .dm-bars-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 6px;
    height: 104px;
  }
  .dm-bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    height: 100%;
  }
  .dm-bar {
    width: 100%;
    min-height: 8px;
    transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dm-bar-lbl {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8A8A8A;
  }

  /* ── RECENT ACTIVITIES ── */
  .dm-recent-card {
    background: #fff;
    border-bottom: 2px solid #16130F;
    padding: 18px 20px;
    margin-bottom: 4px;
  }
  .dm-recent-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .dm-recent-title {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #2A55F5;
  }
  .dm-recent-all {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #16130F;
    text-decoration: none;
  }
  .dm-recent-all:hover { color: #2A55F5; text-decoration: none; }
  .dm-activity-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #E7DFCE;
    text-decoration: none;
    color: #16130F;
  }
  .dm-activity-row:last-child { border-bottom: none; }
  .dm-activity-row:hover { text-decoration: none; color: #2A55F5; }
  .dm-act-icon {
    width: 38px;
    height: 38px;
    background: #F1EADC;
    border: 2px solid #16130F;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .dm-act-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .dm-act-name {
    font-weight: 700;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .dm-act-meta {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.62rem;
    font-weight: 600;
    color: #8A8A8A;
    font-variant-numeric: tabular-nums;
  }
  .dm-act-date {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.58rem;
    font-weight: 600;
    color: #8A8A8A;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .dm-recent-empty {
    font-size: 0.88rem;
    color: #8A8A8A;
    text-align: center;
    padding: 20px 0;
    font-style: italic;
  }

  /* ── COMPLETE PROFILE ── */
  .dm-profile-card {
    background: #fff;
    border-bottom: 2px solid #16130F;
    padding: 18px 20px;
    margin-bottom: 4px;
  }
  .dm-profile-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .dm-profile-pct {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 900;
    font-size: 1.4rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    color: #2A55F5;
  }
  .dm-profile-bar {
    height: 6px;
    background: #EDE5D5;
    margin-bottom: 14px;
    overflow: hidden;
  }
  .dm-profile-fill {
    height: 100%;
    background: #2A55F5;
    transition: width 0.6s ease;
  }
  .dm-profile-items { display: flex; flex-direction: column; gap: 8px; }
  .dm-profile-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.88rem;
    color: #16130F;
  }
  .dm-profile-check {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    flex-shrink: 0;
  }
  .dm-profile-check--empty { border: 2px solid #E7DFCE; background: transparent; }

  /* ── UPGRADE TO PRO ── */
  .dm-upgrade-card {
    background: #2A55F5;
    color: #fff;
    border-bottom: 2px solid #16130F;
    box-shadow: 0 4px 0 #16130F;
    padding: 24px 20px;
    margin-bottom: 4px;
  }
  .dm-upgrade-eyebrow {
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.65);
    margin-bottom: 8px;
  }
  .dm-upgrade-headline {
    font-family: 'Big Shoulders Display', system-ui, sans-serif;
    font-weight: 800;
    font-size: 1.5rem;
    text-transform: uppercase;
    line-height: 0.88;
    margin-bottom: 18px;
  }
  .dm-upgrade-cta {
    display: inline-block;
    background: #FBF6EC;
    color: #16130F;
    border: 2px solid #16130F;
    border-radius: 999px;
    padding: 11px 22px;
    font-family: 'Spline Sans Mono', ui-monospace, monospace;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    box-shadow: 3px 3px 0 #16130F;
    transition: opacity 0.15s;
  }
  .dm-upgrade-cta:hover { opacity: 0.85; text-decoration: none; color: #16130F; }

} /* end @media (max-width: 768px) */
/* ════════════════════════════════════
   DESKTOP V2 BENTO DASHBOARD
   ════════════════════════════════════ */
.db2-desktop { display: block; }
.db2-v1-mobile { display: none !important; }

/* ── HERO ── */
.db2-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 30px 30px 26px;
}
.db2-hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}
.db2-dateline {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
}
.db2-greeting {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(36px, 4vw, 56px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 10px 0 0;
}
.db2-name { color: #2A55F5; }
.db2-hero-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  padding-top: 4px;
}
.db2-phase-badge {
  display: inline-block;
  background: #FFC53D;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 8px 13px;
  border: 2px solid #16130F;
  transform: rotate(-2deg);
}
.db2-btn-ghost {
  background: transparent;
  color: #FBF6EC;
  border: 2px solid rgba(251,246,236,0.4);
  border-radius: 999px;
  padding: 10px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}
.db2-btn-ghost:hover { border-color: rgba(251,246,236,0.7); }
.db2-btn-cobalt {
  background: #2A55F5;
  color: #fff;
  border: 2px solid #2A55F5;
  border-radius: 999px;
  padding: 10px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}
.db2-btn-cobalt:hover { background: #1E42D6; }
.db2-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 2px solid rgba(251,246,236,0.28);
  margin-top: 24px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.db2-stat { padding: 18px 20px; }
.db2-stat--br { border-right: 2px solid rgba(251,246,236,0.28); }
.db2-stat-lbl {
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
}
.db2-stat-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 0.85;
  margin-top: 6px;
}
.db2-stat-num--streak { color: #FFC53D; }
.db2-stat-unit {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 1rem;
  font-weight: 400;
  color: rgba(251,246,236,0.55);
  margin-left: 5px;
}

/* ── WEEK RAIL ── */
.db2-week-rail {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 30px;
  border-bottom: 2px solid #16130F;
  background: #F1EADC;
}
.db2-week-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5A5348;
  white-space: nowrap;
}
.db2-week-days { display: flex; gap: 10px; flex: 1; }
.db2-week-day { text-align: center; }
.db2-day-circle {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 2px dashed #C9BFA9;
  color: #A89E88;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
}
.db2-day-circle--today {
  border: 2px solid #2A55F5;
  background: #2A55F5;
  color: #fff;
}
.db2-day-circle--done {
  border: 2px solid #16130F;
  background: #16130F;
  color: #FBF6EC;
}
.db2-day-letter {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.54rem;
  font-weight: 600;
  color: #A89E88;
  margin-top: 5px;
}
.db2-week-totals {
  text-align: right;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.db2-wt-num { font-weight: 700; font-size: 0.9rem; }
.db2-wt-meta { font-size: 0.64rem; color: #8A8A8A; }
.db2-wt-sep { color: #C9BFA9; margin: 0 8px; }

/* ── BENTO GRID ── */
.db2-bento {
  padding: 24px 30px 34px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.db2-card {
  border: 2px solid #16130F;
  background: #fff;
  overflow: hidden;
}

/* ── FEATURED ACTIVITY ── */
.db2-featured {
  grid-column: span 2;
  background: #16130F;
  color: #FBF6EC;
  box-shadow: 5px 5px 0 #2A55F5;
  display: flex;
  flex-direction: column;
}
.db2-feat-head {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 16px 20px;
  border-bottom: 2px solid rgba(251,246,236,0.15);
}
.db2-latest-badge {
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 5px 10px;
}
.db2-feat-title {
  flex: 1;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 24px;
  text-transform: uppercase;
}
.db2-feat-date {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
}
.db2-feat-map {
  position: relative;
  height: 200px;
  background: #0F0D0B;
  overflow: hidden;
  border-bottom: 2px solid rgba(251,246,236,0.15);
}
.db2-route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
@keyframes rkDraw { to { stroke-dashoffset: 0; } }
.db2-route-path { animation: rkDraw 3s ease-out 0.2s forwards; }
.db2-feat-chip {
  position: absolute;
  left: 14px;
  top: 14px;
  background: #16130F;
  border: 2px solid rgba(251,246,236,0.3);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 5px 10px;
  color: #FBF6EC;
  text-decoration: none;
}
.db2-feat-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.db2-fstat { padding: 16px 18px; }
.db2-fstat--br { border-right: 2px solid rgba(251,246,236,0.15); }
.db2-fstat-lbl {
  font-size: 0.52rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.5);
}
.db2-fstat-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 800;
  line-height: 0.85;
  margin-top: 4px;
}
.db2-fstat-num--yellow { color: #FFC53D; }
.db2-feat-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  flex: 1;
}
.db2-feat-log-btn {
  background: transparent;
  border: 2px solid rgba(251,246,236,0.3);
  color: #FBF6EC;
  border-radius: 999px;
  padding: 12px 24px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

/* ── NEXT UP ── */
.db2-next-up { display: flex; flex-direction: column; }
.db2-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 2px solid #16130F;
}
.db2-card-head--ink { background: #16130F; }
.db2-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #2A55F5;
}
.db2-eyebrow--cobalt { color: #2A55F5; }
.db2-head-sub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 600;
  color: #8A8A8A;
}
.db2-card-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 22px;
  text-transform: uppercase;
}
.db2-all-link {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8A8A8A;
  text-decoration: none;
}
.db2-all-link:hover { color: #2A55F5; }
.db2-next-body {
  padding: 18px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.db2-next-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 30px;
  line-height: 0.85;
  text-transform: uppercase;
}
.db2-next-desc { font-size: 0.8rem; color: #5A5348; margin: 10px 0 16px; line-height: 1.4; }
.db2-next-boxes { display: flex; gap: 8px; }
.db2-next-box { flex: 1; border: 2px solid #16130F; padding: 10px; }
.db2-next-box-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8A8A;
}
.db2-next-box-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 0.85;
  margin-top: 4px;
}
.db2-next-cta {
  display: block;
  text-align: center;
  background: #16130F;
  color: #FBF6EC;
  border: 2px solid #16130F;
  padding: 12px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-top: 16px;
  text-decoration: none;
}
.db2-next-cta:hover { background: #2A55F5; border-color: #2A55F5; color: #fff; }
.db2-next-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.db2-next-empty-txt { font-size: 0.86rem; color: #5A5348; margin-bottom: 12px; }

/* ── WEEKLY BARS ── */
.db2-weekly-bars { grid-column: span 2; }
.db2-view-toggle {
  display: flex;
  border: 2px solid #16130F;
  overflow: hidden;
}
.db2-toggle-btn {
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #5A5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}
.db2-toggle-btn + .db2-toggle-btn { border-left: 2px solid #16130F; }
.db2-toggle-btn--on { background: #2A55F5; color: #fff; }
.db2-bars-body { padding: 20px; }
.db2-bars-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 140px;
}
.db2-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px; }
@keyframes rkGrow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
.db2-bar {
  width: 100%;
  border: 2px solid #16130F;
  transform-origin: bottom;
  animation: rkGrow 0.5s ease-out both;
}
.db2-bar-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.54rem;
  font-weight: 600;
  color: #8A8A8A;
}
.db2-bars-totals {
  display: flex;
  gap: 20px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 2px solid #E7DFCE;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.db2-bars-big {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
}
.db2-bars-meta {
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin-left: 6px;
}

/* ── GOAL RING ── */
.db2-goal-ring { padding: 18px; display: flex; flex-direction: column; align-items: center; }
.db2-ring-wrap { position: relative; width: 120px; height: 120px; margin: 10px 0 6px; }
.db2-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.db2-ring-pct {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 0.75;
}
.db2-ring-sym { font-size: 1rem; }
.db2-ring-sub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-size: 0.7rem;
  color: #5A5348;
}

/* ── TRAINING INSIGHTS ── */
.db2-insights { background: #16130F; color: #FBF6EC; display: flex; flex-direction: column; }
.db2-insights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.db2-insight-cell { padding: 16px 8px; }
.db2-insight-cell--br { border-right: 2px solid rgba(251,246,236,0.15); }
.db2-insight-lbl {
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.5);
}
.db2-insight-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 0.85;
  margin-top: 5px;
}
.db2-insights-empty {
  padding: 24px 18px;
  font-size: 0.78rem;
  color: rgba(251,246,236,0.5);
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.db2-insights-foot {
  padding: 12px 18px;
  border-top: 2px solid rgba(251,246,236,0.15);
  margin-top: auto;
}
.db2-insights-link {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2A55F5;
  text-decoration: none;
}
.db2-insights-link:hover { color: #FBF6EC; }
.db2-card-head--ink .db2-eyebrow { color: #2A55F5; }

/* ── RECOVERY ── */
.db2-recovery-date {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #8A8A8A;
}
.db2-recovery-rings-row {
  display: flex;
  gap: 24px;
  padding: 18px 18px 14px;
}
.db2-recovery-ring-cell { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.db2-recovery-ring {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 4px solid;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
}
.db2-recovery-ring--strain { border-color: #2A55F5; color: #2A55F5; }
.db2-recovery-pct { font-size: 0.7rem; }
.db2-recovery-ring-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8A8A8A;
  text-align: center;
}
.db2-recovery-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
  padding: 0 18px 16px;
}
.db2-recovery-stat { display: flex; flex-direction: column; }
.db2-recovery-stat-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8A8A8A;
}
.db2-recovery-stat-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: #16130F;
}
.db2-recovery-unit {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  color: #8A8A8A;
  margin-left: 2px;
}

/* Sleep stage breakdown bar */
.db2-sleep-stages { border-top: 2px solid #E7DFCE; margin: 0 18px 18px; padding-top: 14px; }
.db2-sleep-stages-bar {
  display: flex;
  height: 10px;
  border: 2px solid #16130F;
  overflow: hidden;
  margin-bottom: 10px;
}
.db2-sleep-stage-seg { height: 100%; }
.db2-sleep-stage-seg--light { background: #C9C2B4; }
.db2-sleep-stage-seg--deep  { background: #16130F; }
.db2-sleep-stage-seg--rem   { background: #2A55F5; }
.db2-sleep-stages-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.db2-sleep-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  color: #5A5348;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.db2-sleep-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.db2-sleep-dot--light { background: #C9C2B4; }
.db2-sleep-dot--deep  { background: #16130F; }
.db2-sleep-dot--rem   { background: #2A55F5; }

/* ── RECENT ACTIVITIES ── */
.db2-recent { grid-row: span 2; display: flex; flex-direction: column; }
.db2-recent-list { display: flex; flex-direction: column; flex: 1; }
.db2-recent-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 14px 18px;
  border-bottom: 2px solid #E7DFCE;
  text-decoration: none;
  color: #16130F;
}
.db2-recent-row:hover { background: #FBF6EC; }
.db2-recent-row:last-child { border-bottom: none; }
.db2-recent-icon-wrap {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 999px;
  background: #16130F;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
.db2-recent-info { flex: 1; min-width: 0; }
.db2-recent-name { font-weight: 800; font-size: 0.86rem; }
.db2-recent-meta { font-family: 'Spline Sans Mono', ui-monospace, monospace; font-size: 0.6rem; color: #8A8A8A; }
.db2-recent-date { font-family: 'Spline Sans Mono', ui-monospace, monospace; font-size: 0.58rem; color: #8A8A8A; flex-shrink: 0; }
.db2-recent-empty { padding: 24px 18px; font-size: 0.86rem; color: #8A8A8A; }
.db2-recent-foot {
  margin-top: auto;
  border-top: 2px solid #16130F;
  padding: 14px 18px;
  background: #F1EADC;
}
.db2-disc-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
  margin-bottom: 4px;
}
.db2-disc-row { display: flex; align-items: baseline; gap: 8px; }
.db2-disc-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 900;
  line-height: 0.8;
}
.db2-disc-level {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #2A55F5;
}

/* ── COMPLETE PROFILE ── */
.db2-profile-card { padding: 18px; }
.db2-profile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.db2-profile-pct-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  color: #2A55F5;
  line-height: 0.7;
}
.db2-profile-bar-bg {
  height: 9px;
  background: #EDE5D5;
  border: 2px solid #16130F;
  margin-bottom: 14px;
  overflow: hidden;
}
.db2-profile-bar-fill {
  height: 100%;
  background: #2A55F5;
  transition: width 0.4s ease;
}
.db2-profile-list { display: flex; flex-direction: column; gap: 9px; font-size: 0.82rem; font-weight: 600; }
.db2-profile-item { display: flex; align-items: center; gap: 9px; color: #5A5348; }
.db2-profile-item--done { color: #16130F; }
.db2-profile-check {
  width: 18px;
  height: 18px;
  border: 2px solid #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.62rem;
  flex-shrink: 0;
}
.db2-profile-check--done { background: #2A55F5; color: #fff; border-color: #2A55F5; }
.db2-profile-done-msg {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  text-transform: uppercase;
  margin-top: 8px;
  color: #2A55F5;
}

/* ── ACTIVITY BREAKDOWN ── */
.db2-breakdown { padding: 18px; }
.db2-breakdown-inner { display: flex; align-items: center; gap: 18px; }
.db2-breakdown-ring { position: relative; width: 96px; height: 96px; flex: none; }
.db2-breakdown-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.db2-breakdown-count {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
}
.db2-breakdown-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.db2-bd-item { display: flex; align-items: center; gap: 9px; }
.db2-bd-dot { width: 11px; height: 11px; border: 1.5px solid #16130F; flex-shrink: 0; }
.db2-bd-name { flex: 1; font-weight: 800; font-size: 0.8rem; }
.db2-bd-cnt { font-family: 'Spline Sans Mono', ui-monospace, monospace; font-size: 0.74rem; color: #5A5348; }

/* ── UPGRADE / MANAGE SUB ── */
.db2-upgrade {
  grid-column: span 2;
  background: #2A55F5;
  color: #fff;
  box-shadow: 5px 5px 0 #16130F;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
}
.db2-manage-sub {
  grid-column: span 2;
  background: #16130F;
  color: #FBF6EC;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
}
.db2-upgrade-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.8);
}
.db2-manage-sub .db2-upgrade-eyebrow { color: rgba(251,246,236,0.6); }
.db2-upgrade-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 34px;
  line-height: 0.85;
  text-transform: uppercase;
  margin: 8px 0 4px;
}
.db2-upgrade-sub { font-size: 0.86rem; opacity: 0.9; }
.db2-upgrade-cta {
  flex: none;
  background: #FBF6EC;
  color: #16130F;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 14px 26px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 #16130F;
  text-decoration: none;
  white-space: nowrap;
}
.db2-upgrade-cta:hover { background: #fff; }
.db2-upgrade-cta--manage {
  background: transparent;
  border-color: rgba(251,246,236,0.4);
  color: #FBF6EC;
  box-shadow: 4px 4px 0 rgba(251,246,236,0.15);
}
.db2-upgrade-cta--manage:hover { background: rgba(251,246,236,0.08); color: #FBF6EC; }
</style>