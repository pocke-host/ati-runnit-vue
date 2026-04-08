<!-- src/views/CoachAthleteDetail.vue — Full TrainingPeaks-style athlete view for coaches -->
<template>
  <main class="athlete-detail">

    <!-- HEADER ──────────────────────────────────────────────── -->
    <section class="page-header">
      <div class="header-inner">
        <router-link to="/coach/athletes" class="back-link">
          <i class="bi bi-arrow-left"></i> Roster
        </router-link>
        <div class="header-kicker">ATHLETE PROFILE</div>

        <div class="header-row" v-if="athlete">
          <div class="ath-avatar">{{ (athlete.displayName || '?')[0].toUpperCase() }}</div>
          <div class="ath-meta">
            <h1 class="ath-name">{{ athlete.displayName }}</h1>
            <span class="ath-sport-badge">{{ athlete.sport || 'Athlete' }}</span>
          </div>
        </div>
        <div v-else-if="loadingAthlete" class="header-row">
          <div class="spinner-border"></div>
        </div>

        <!-- Stats row -->
        <div class="stats-row" v-if="athlete">
          <div class="stat-item">
            <div class="stat-val">{{ activities.length }}</div>
            <div class="stat-lbl">Activities</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ totalDistanceDisplay }}</div>
            <div class="stat-lbl">Total Distance</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ plans.length }}</div>
            <div class="stat-lbl">Plans</div>
          </div>
          <div class="stat-item">
            <div class="stat-val" :class="compliancePct >= 75 ? 'val-green' : compliancePct >= 50 ? 'val-yellow' : 'val-red'">
              {{ compliancePct }}%
            </div>
            <div class="stat-lbl">Compliance</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ unreadCount > 0 ? unreadCount : '—' }}</div>
            <div class="stat-lbl">Unread Msgs</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar">
          <button :class="['tab', { active: tab === 'overview' }]"    @click="switchTab('overview')">Overview</button>
          <button :class="['tab', { active: tab === 'calendar' }]"    @click="switchTab('calendar')">Calendar</button>
          <button :class="['tab', { active: tab === 'plans' }]"       @click="switchTab('plans')">Plans</button>
          <button :class="['tab', { active: tab === 'compliance' }]"  @click="switchTab('compliance')">Compliance</button>
          <button :class="['tab', { active: tab === 'pmc' }]"         @click="switchTab('pmc')">PMC</button>
          <button :class="['tab', { active: tab === 'zones' }]"       @click="switchTab('zones')">Zones</button>
          <button :class="['tab', { active: tab === 'messages' }]"    @click="switchTab('messages')">
            Messages
            <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </div>
    </section>

    <div class="content-wrap">

      <!-- ── OVERVIEW TAB ──────────────────────────────────── -->
      <template v-if="tab === 'overview'">
        <div class="overview-grid">

          <!-- Active Plan card -->
          <div class="overview-card">
            <div class="card-label">ACTIVE PLAN</div>
            <div v-if="activePlan" class="plan-card">
              <div class="plan-name">{{ activePlan.name }}</div>
              <div class="plan-meta">{{ activePlan.sport }} · {{ activePlan.durationWeeks || activePlan.totalWeeks }}w</div>
              <div class="plan-progress-wrap">
                <div class="plan-progress-bar">
                  <div class="plan-progress-fill" :style="{ width: (activePlan.progress || 0) + '%' }"></div>
                </div>
                <span class="plan-pct">{{ activePlan.progress || 0 }}%</span>
              </div>
              <router-link :to="`/coach/plans/${activePlan.id}/edit`" class="btn-edit-plan">
                Edit Plan →
              </router-link>
            </div>
            <div v-else class="no-data">
              No active plan.
              <button class="link-btn" @click="switchTab('plans')">Assign one →</button>
            </div>

            <!-- This week compliance mini-card -->
            <div class="compliance-mini" v-if="thisWeekCompliance">
              <div class="card-label" style="margin-top:16px">THIS WEEK</div>
              <div class="compliance-row">
                <span class="compliance-fraction">{{ thisWeekCompliance.completed }}/{{ thisWeekCompliance.planned }} workouts</span>
                <span class="compliance-chip" :class="thisWeekCompliance.pct >= 75 ? 'chip-green' : thisWeekCompliance.pct >= 50 ? 'chip-yellow' : 'chip-red'">
                  {{ thisWeekCompliance.pct }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Race Targets -->
          <div class="overview-card">
            <div class="card-label-row">
              <div class="card-label">TARGET RACES</div>
              <button class="link-btn" @click="showAddRace = true">+ Add</button>
            </div>
            <div v-if="races.length === 0" class="no-data">No target races set.</div>
            <div v-else class="race-list">
              <div v-for="race in races" :key="race.id" class="race-row">
                <span class="race-priority" :class="`priority-${race.priority?.toLowerCase()}`">{{ race.priority || 'A' }}</span>
                <div class="race-info">
                  <div class="race-name">{{ race.name }}</div>
                  <div class="race-meta">{{ formatDateShort(race.raceDate) }} · {{ race.distance || race.type }}</div>
                </div>
                <div class="race-days">
                  <span class="race-days-val">{{ daysUntil(race.raceDate) }}</span>
                  <span class="race-days-lbl">days</span>
                </div>
                <button class="race-del-btn" @click="removeRace(race.id)" title="Remove"><i class="bi bi-x"></i></button>
              </div>
            </div>
          </div>

          <!-- Recent Activities with annotations -->
          <div class="overview-card overview-card--wide">
            <div class="card-label">RECENT ACTIVITIES</div>
            <div v-if="loadingActivities" class="no-data">
              <div class="spinner-border spinner-border-sm me-2"></div> Loading…
            </div>
            <div v-else-if="activities.length === 0" class="no-data">No activities yet.</div>
            <div v-else class="activity-list">
              <div
                v-for="act in activities.slice(0, 8)"
                :key="act.id"
                class="act-row-wrap"
              >
                <router-link :to="`/activities/${act.id}`" class="act-row">
                  <span class="act-icon">{{ sportIcon(act.sportType) }}</span>
                  <div class="act-info">
                    <div class="act-name">{{ act.name || act.sportType }}</div>
                    <div class="act-meta">
                      {{ formatDistShort(act.distanceMeters) }}
                      <span v-if="act.durationSeconds"> · {{ formatDurShort(act.durationSeconds) }}</span>
                      <span class="act-date"> · {{ formatDateShort(act.createdAt) }}</span>
                    </div>
                  </div>
                  <i class="bi bi-chevron-right act-arrow"></i>
                </router-link>
                <!-- Coach annotation -->
                <div class="annotation-wrap">
                  <div v-if="annotations[act.id]" class="annotation-saved">
                    <i class="bi bi-chat-quote annotation-icon"></i>
                    <span class="annotation-text">{{ annotations[act.id] }}</span>
                    <button class="annotation-edit-btn" @click="startAnnotation(act.id)"><i class="bi bi-pencil"></i></button>
                  </div>
                  <div v-else-if="annotatingId === act.id" class="annotation-input-row">
                    <textarea
                      v-model="annotationDraft"
                      class="annotation-input"
                      placeholder="Leave feedback for this workout…"
                      rows="2"
                      @keydown.enter.ctrl.prevent="saveAnnotation(act.id)"
                    ></textarea>
                    <div class="annotation-input-actions">
                      <button class="btn-annot-cancel" @click="annotatingId = null">Cancel</button>
                      <button class="btn-annot-save" @click="saveAnnotation(act.id)" :disabled="!annotationDraft.trim()">Save Note</button>
                    </div>
                  </div>
                  <button v-else class="btn-annotate" @click="startAnnotation(act.id)">
                    <i class="bi bi-chat-left-text me-1"></i> Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </template>

      <!-- ── ADD RACE MODAL ─────────────────────────────────── -->
      <div v-if="showAddRace" class="modal-overlay" @click.self="showAddRace = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Add Target Race</h3>
            <button class="modal-close" @click="showAddRace = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label class="field-label">Race Name</label>
              <input v-model="raceForm.name" class="field-input" placeholder="e.g. Boston Marathon 2026" />
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <label class="field-label">Race Date</label>
                <input type="date" v-model="raceForm.raceDate" class="field-input" :min="todayStr" />
              </div>
              <div class="form-field">
                <label class="field-label">Priority</label>
                <div class="priority-pills">
                  <button
                    v-for="p in ['A', 'B', 'C']" :key="p"
                    :class="['priority-pill', { active: raceForm.priority === p }]"
                    @click="raceForm.priority = p"
                  >{{ p }}</button>
                </div>
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">Distance / Type</label>
              <input v-model="raceForm.distance" class="field-input" placeholder="e.g. Marathon, 10K, Half" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost-sm" @click="showAddRace = false">Cancel</button>
            <button class="btn-primary-sm" @click="addRace"
              :disabled="addingRace || !raceForm.name.trim() || !raceForm.raceDate">
              <span v-if="addingRace" class="spinner-border spinner-border-sm me-1"></span>
              Add Race
            </button>
          </div>
        </div>
      </div>

      <!-- ── CALENDAR TAB ──────────────────────────────────── -->
      <template v-else-if="tab === 'calendar'">
        <div class="cal-toolbar">
          <div class="cal-toolbar-title">Next 4 Weeks</div>
          <button class="btn-primary-sm" @click="openAddWorkout(null)">
            <i class="bi bi-plus me-1"></i> Add Workout
          </button>
        </div>

        <div v-if="loadingCalendar" class="loading-state">
          <div class="spinner-border"></div>
        </div>

        <div v-else-if="calendarWeeks.length === 0" class="empty-card">
          <i class="bi bi-calendar3" style="font-size:2rem;color:#ccc"></i>
          <p>No planned workouts for the next 4 weeks.</p>
          <button class="btn-primary-sm" @click="openAddWorkout(null)">Add a Workout</button>
        </div>

        <div v-else class="cal-weeks">
          <div v-for="week in calendarWeeks" :key="week.label" class="cal-week-block">
            <div class="cal-week-header">
              <span class="cal-week-label">{{ week.label }}</span>
              <button class="btn-ghost-xs" @click="openAddWorkout(week.startDate)">
                <i class="bi bi-plus"></i> Add
              </button>
            </div>
            <div class="cal-week-days">
              <div
                v-for="day in week.days"
                :key="day.date"
                class="cal-day"
                :class="{
                  'cal-day--today': day.isToday,
                  'cal-day--past': day.isPast,
                  'cal-day--drag-over': dragOverDate === day.date
                }"
                @dragover.prevent="dragOverDate = day.date"
                @dragleave="dragOverDate = null"
                @drop.prevent="onDrop(day.date)"
              >
                <!-- Race indicator on calendar -->
                <div v-if="raceOnDate(day.date)" class="cal-race-flag" :class="`priority-${raceOnDate(day.date).priority?.toLowerCase()}`">
                  {{ raceOnDate(day.date).priority || 'A' }} RACE
                </div>

                <div class="cal-day-header">
                  <span class="cal-day-dow">{{ day.dow }}</span>
                  <span class="cal-day-num" :class="{ 'today-num': day.isToday }">{{ day.dayNum }}</span>
                </div>
                <div class="cal-day-events">
                  <!-- Planned workouts (draggable) -->
                  <div
                    v-for="ev in day.events"
                    :key="ev.id"
                    class="cal-event cal-event--planned"
                    :class="{ 'cal-event--dragging': dragEventId === ev.id }"
                    :style="{ borderLeftColor: typeColor(ev.workoutType) }"
                    draggable="true"
                    @dragstart="onDragStart(ev, day.date)"
                    @dragend="dragEventId = null; dragOverDate = null"
                  >
                    <div class="cal-event-drag-handle"><i class="bi bi-grip-vertical"></i></div>
                    <div class="cal-event-body">
                      <div class="cal-event-type">{{ ev.workoutType?.replace('_', ' ') || 'WORKOUT' }}</div>
                      <div class="cal-event-detail" v-if="ev.distanceMeters || ev.durationMinutes">
                        <span v-if="ev.distanceMeters">{{ formatDistShort(ev.distanceMeters) }}</span>
                        <span v-if="ev.durationMinutes"> · {{ ev.durationMinutes }}min</span>
                      </div>
                      <div class="cal-event-title" v-if="ev.title">{{ ev.title }}</div>
                    </div>
                    <button
                      class="cal-event-del"
                      @click.stop="deleteCalEvent(ev)"
                      title="Remove"
                    ><i class="bi bi-x"></i></button>
                  </div>
                  <!-- Completed activities -->
                  <div
                    v-for="act in day.activities"
                    :key="'a' + act.id"
                    class="cal-event cal-event--done"
                  >
                    <div class="cal-event-type">✓ {{ act.sportType }}</div>
                    <div class="cal-event-detail">{{ formatDistShort(act.distanceMeters) }}</div>
                  </div>
                  <!-- Empty day placeholder -->
                  <div v-if="!day.events.length && !day.activities.length" class="cal-day-empty">
                    <button class="cal-add-btn" @click="openAddWorkout(day.date)" title="Add workout">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Workout Drawer -->
        <div v-if="showAddWorkout" class="drawer-overlay" @click.self="showAddWorkout = false">
          <div class="add-workout-drawer">
            <div class="drawer-header">
              <h3 class="drawer-title">Add Workout</h3>
              <button class="drawer-close" @click="showAddWorkout = false"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="drawer-body">
              <div class="form-field">
                <label class="field-label">Date</label>
                <input type="date" v-model="addForm.date" class="field-input" :min="todayStr" />
              </div>
              <div class="form-field">
                <label class="field-label">Type</label>
                <div class="type-pills">
                  <button
                    v-for="t in WORKOUT_TYPES"
                    :key="t"
                    :class="['type-pill', { active: addForm.workoutType === t }]"
                    :style="addForm.workoutType === t ? { background: typeColor(t), color: '#fff', border: 'none' } : {}"
                    @click="addForm.workoutType = t"
                  >{{ t.replace('_', ' ') }}</button>
                </div>
              </div>
              <div class="form-field">
                <label class="field-label">Title</label>
                <input v-model="addForm.title" class="field-input" :placeholder="addForm.workoutType + ' workout'" />
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Distance ({{ distanceLabel }})</label>
                  <input v-model.number="addForm.distanceDisplay" type="number" class="field-input" placeholder="0" min="0" step="0.1" />
                </div>
                <div class="form-field">
                  <label class="field-label">Duration (min)</label>
                  <input v-model.number="addForm.durationMinutes" type="number" class="field-input" placeholder="0" min="0" />
                </div>
              </div>
              <div class="form-field">
                <label class="field-label">Notes <span class="optional">(optional)</span></label>
                <textarea v-model="addForm.description" class="field-input" rows="3" placeholder="Workout details, targets, notes for athlete…"></textarea>
              </div>
            </div>
            <div class="drawer-footer">
              <button class="btn-ghost-sm" @click="showAddWorkout = false">Cancel</button>
              <button class="btn-primary-sm" @click="submitAddWorkout" :disabled="addingWorkout || !addForm.date || !addForm.workoutType">
                <span v-if="addingWorkout" class="spinner-border spinner-border-sm me-1"></span>
                Push to Calendar
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ── PLANS TAB ─────────────────────────────────────── -->
      <template v-else-if="tab === 'plans'">
        <div class="plans-toolbar">
          <div class="plans-toolbar-title">{{ plans.length }} plan{{ plans.length !== 1 ? 's' : '' }}</div>
          <button class="btn-primary-sm" @click="showCreatePlan = true">
            <i class="bi bi-plus me-1"></i> New Plan
          </button>
        </div>

        <div v-if="loadingPlans" class="loading-state">
          <div class="spinner-border"></div>
        </div>
        <div v-else-if="plans.length === 0" class="empty-card">
          <i class="bi bi-calendar3" style="font-size:2rem;color:#ccc"></i>
          <p>No plans yet. Create one and start building their training.</p>
          <button class="btn-primary-sm" @click="showCreatePlan = true">Create First Plan</button>
        </div>
        <div v-else class="plans-list">
          <div
            v-for="plan in plans"
            :key="plan.id"
            :class="['plan-row', { 'plan-row--active': plan.isActive || plan.active }]"
          >
            <div class="plan-row-left">
              <div class="plan-row-badge" v-if="plan.isActive || plan.active">Active</div>
              <div class="plan-row-name">{{ plan.name }}</div>
              <div class="plan-row-meta">
                {{ plan.sport }} · {{ plan.durationWeeks || plan.totalWeeks }} weeks
                <span v-if="plan.createdAt"> · Created {{ formatDateShort(plan.createdAt) }}</span>
              </div>
              <div class="plan-row-progress-wrap" v-if="(plan.isActive || plan.active) && plan.progress !== undefined">
                <div class="plan-row-progress-bar">
                  <div class="plan-row-progress-fill" :style="{ width: plan.progress + '%' }"></div>
                </div>
                <span class="plan-row-pct">{{ plan.progress }}% complete</span>
              </div>
            </div>
            <div class="plan-row-actions">
              <router-link :to="`/coach/plans/${plan.id}/edit`" class="btn-plan-edit">
                Edit
              </router-link>
              <button
                v-if="!plan.isActive && !plan.active"
                class="btn-plan-activate"
                @click="activatePlan(plan.id)"
                :disabled="activatingPlanId === plan.id"
              >
                <span v-if="activatingPlanId === plan.id" class="spinner-border spinner-border-sm"></span>
                <span v-else>Set Active</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Create Plan Modal -->
        <div v-if="showCreatePlan" class="modal-overlay" @click.self="showCreatePlan = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3>New Training Plan</h3>
              <button class="modal-close" @click="showCreatePlan = false"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body">
              <div class="form-field">
                <label class="field-label">Plan Name</label>
                <input v-model="createPlanForm.name" class="field-input" placeholder="e.g. 12-Week Marathon Base" />
              </div>
              <div class="form-field">
                <label class="field-label">Sport</label>
                <div class="type-pills">
                  <button
                    v-for="s in SPORTS"
                    :key="s"
                    :class="['type-pill', { active: createPlanForm.sport === s }]"
                    @click="createPlanForm.sport = s"
                  >{{ s }}</button>
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label class="field-label">Duration (weeks)</label>
                  <input v-model.number="createPlanForm.durationWeeks" type="number" class="field-input" min="1" max="52" />
                </div>
                <div class="form-field">
                  <label class="field-label">Days/week</label>
                  <input v-model.number="createPlanForm.daysPerWeek" type="number" class="field-input" min="1" max="7" />
                </div>
              </div>
              <div v-if="createPlanError" class="form-error">{{ createPlanError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn-ghost-sm" @click="showCreatePlan = false">Cancel</button>
              <button class="btn-primary-sm" @click="createPlan"
                :disabled="creatingPlan || !createPlanForm.name.trim() || !createPlanForm.sport">
                <span v-if="creatingPlan" class="spinner-border spinner-border-sm me-1"></span>
                Create & Edit →
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ── COMPLIANCE TAB ────────────────────────────────── -->
      <template v-else-if="tab === 'compliance'">
        <div v-if="loadingCompliance" class="loading-state">
          <div class="spinner-border"></div>
        </div>
        <div v-else-if="complianceWeeks.length === 0" class="empty-card">
          <i class="bi bi-bar-chart" style="font-size:2rem;color:#ccc"></i>
          <p>No compliance data yet. Assign a plan and start tracking workouts.</p>
        </div>
        <div v-else class="compliance-table-wrap">
          <div class="compliance-summary">
            <div class="cs-stat">
              <div class="cs-val" :class="compliancePct >= 75 ? 'val-green' : compliancePct >= 50 ? 'val-yellow' : 'val-red'">
                {{ compliancePct }}%
              </div>
              <div class="cs-lbl">4-Week Avg</div>
            </div>
            <div class="cs-stat">
              <div class="cs-val">{{ totalPlanned }}</div>
              <div class="cs-lbl">Planned</div>
            </div>
            <div class="cs-stat">
              <div class="cs-val">{{ totalCompleted }}</div>
              <div class="cs-lbl">Completed</div>
            </div>
            <div class="cs-stat">
              <div class="cs-val">{{ totalPlanned - totalCompleted }}</div>
              <div class="cs-lbl">Missed</div>
            </div>
          </div>

          <div class="compliance-weeks">
            <div v-for="week in complianceWeeks" :key="week.weekLabel" class="compliance-week-row">
              <div class="cw-label">{{ week.weekLabel }}</div>
              <div class="cw-bar-wrap">
                <div class="cw-bar-bg">
                  <div
                    class="cw-bar-fill"
                    :style="{ width: week.pct + '%', background: week.pct >= 75 ? '#16a34a' : week.pct >= 50 ? '#f59e0b' : '#ef4444' }"
                  ></div>
                </div>
                <span class="cw-fraction">{{ week.completed }}/{{ week.planned }}</span>
                <span class="cw-pct" :class="week.pct >= 75 ? 'val-green' : week.pct >= 50 ? 'val-yellow' : 'val-red'">
                  {{ week.pct }}%
                </span>
              </div>
              <!-- Day breakdown -->
              <div class="cw-days" v-if="week.days?.length">
                <div
                  v-for="day in week.days"
                  :key="day.date"
                  :class="['cw-dot', day.completed ? 'dot-done' : day.planned ? 'dot-missed' : 'dot-rest']"
                  :title="day.label"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── PMC TAB ────────────────────────────────────────── -->
      <template v-else-if="tab === 'pmc'">
        <div class="pmc-header">
          <div class="pmc-header-stats">
            <div class="pmc-stat">
              <div class="pmc-stat-val">{{ pmcCurrent.ctl }}</div>
              <div class="pmc-stat-lbl">Fitness (CTL)</div>
            </div>
            <div class="pmc-stat">
              <div class="pmc-stat-val" :class="pmcCurrent.atl > pmcCurrent.ctl ? 'val-red' : ''">{{ pmcCurrent.atl }}</div>
              <div class="pmc-stat-lbl">Fatigue (ATL)</div>
            </div>
            <div class="pmc-stat">
              <div class="pmc-stat-val" :class="pmcCurrent.tsb >= 0 ? 'val-green' : 'val-red'">{{ pmcCurrent.tsb > 0 ? '+' : '' }}{{ pmcCurrent.tsb }}</div>
              <div class="pmc-stat-lbl">Form (TSB)</div>
            </div>
            <div class="pmc-stat pmc-stat--explain">
              <div class="pmc-form-label" :class="formLabel.cls">{{ formLabel.text }}</div>
              <div class="pmc-stat-lbl">Training Phase</div>
            </div>
          </div>
          <div class="pmc-legend">
            <span class="pmc-legend-item"><span class="pmc-dot" style="background:#3b82f6"></span>Fitness (CTL)</span>
            <span class="pmc-legend-item"><span class="pmc-dot" style="background:#ef4444"></span>Fatigue (ATL)</span>
            <span class="pmc-legend-item"><span class="pmc-dot" style="background:#22c55e"></span>Form (TSB)</span>
          </div>
        </div>
        <div class="pmc-chart-wrap">
          <canvas ref="pmcCanvas" class="pmc-canvas"></canvas>
        </div>
        <div class="pmc-explainer">
          <div class="pmc-ex-item"><strong>CTL (Fitness)</strong> — 42-day rolling avg of training load. Higher = more fitness.</div>
          <div class="pmc-ex-item"><strong>ATL (Fatigue)</strong> — 7-day rolling avg of training load. Spikes after hard weeks.</div>
          <div class="pmc-ex-item"><strong>TSB (Form)</strong> — Fitness minus Fatigue. Positive = fresh, Negative = fatigued.</div>
          <div class="pmc-ex-item pmc-ex-phases">
            <span class="phase-chip phase-fresh">TSB +25 → +5: Fresh / Taper</span>
            <span class="phase-chip phase-optimal">TSB +5 → -10: Optimal</span>
            <span class="phase-chip phase-tired">TSB -10 → -30: Tired</span>
            <span class="phase-chip phase-overtrain">TSB &lt; -30: Overreaching</span>
          </div>
        </div>
      </template>

      <!-- ── ZONES TAB ──────────────────────────────────────── -->
      <template v-else-if="tab === 'zones'">
        <div class="zones-wrap">
          <div class="zones-section">
            <div class="zones-section-title">HR ZONES <span class="zones-subtitle">— Based on max HR or LTHR</span></div>
            <div class="zones-max-row">
              <div class="form-field">
                <label class="field-label">Max Heart Rate (bpm)</label>
                <input v-model.number="zonesForm.maxHr" type="number" min="100" max="220" class="field-input zones-input" placeholder="180" @input="calcHrZones" />
              </div>
              <div class="form-field">
                <label class="field-label">Lactate Threshold HR (bpm) <span class="optional">optional</span></label>
                <input v-model.number="zonesForm.lthr" type="number" min="100" max="210" class="field-input zones-input" placeholder="165" />
              </div>
            </div>
            <div class="zones-table">
              <div class="zones-table-header">
                <span>Zone</span><span>Name</span><span>BPM Range</span><span>% Max HR</span>
              </div>
              <div v-for="z in zonesForm.hrZones" :key="z.zone" class="zones-row" :style="{ borderLeft: `3px solid ${zoneColor(z.zone)}` }">
                <span class="z-zone" :style="{ color: zoneColor(z.zone) }">Z{{ z.zone }}</span>
                <span class="z-name">{{ z.name }}</span>
                <div class="z-range">
                  <input v-model.number="z.min" type="number" class="z-input" /> – <input v-model.number="z.max" type="number" class="z-input" />
                </div>
                <span class="z-pct">{{ zonesForm.maxHr ? `${Math.round(z.min / zonesForm.maxHr * 100)}–${Math.round(z.max / zonesForm.maxHr * 100)}%` : '—' }}</span>
              </div>
            </div>
          </div>

          <div class="zones-section">
            <div class="zones-section-title">PACE ZONES <span class="zones-subtitle">— min/{{ distanceLabel }}</span></div>
            <div class="zones-max-row">
              <div class="form-field">
                <label class="field-label">Threshold Pace (min/{{ distanceLabel }})</label>
                <input v-model="zonesForm.thresholdPace" class="field-input zones-input" placeholder="7:30" @input="calcPaceZones" />
              </div>
            </div>
            <div class="zones-table">
              <div class="zones-table-header">
                <span>Zone</span><span>Name</span><span>Pace Range</span><span>Effort</span>
              </div>
              <div v-for="z in zonesForm.paceZones" :key="z.zone" class="zones-row" :style="{ borderLeft: `3px solid ${zoneColor(z.zone)}` }">
                <span class="z-zone" :style="{ color: zoneColor(z.zone) }">Z{{ z.zone }}</span>
                <span class="z-name">{{ z.name }}</span>
                <div class="z-range">
                  <input v-model="z.min" class="z-input z-pace" placeholder="8:30" /> – <input v-model="z.max" class="z-input z-pace" placeholder="9:00" />
                </div>
                <span class="z-pct">{{ z.effort }}</span>
              </div>
            </div>
          </div>

          <div v-if="zonesSaveError" class="form-error">{{ zonesSaveError }}</div>

          <div class="zones-actions">
            <button class="btn-primary-sm" @click="saveZones" :disabled="savingZones">
              <span v-if="savingZones" class="spinner-border spinner-border-sm me-1"></span>
              Save Zones
            </button>
            <div v-if="zonesSaved" class="zones-saved-msg">Zones saved.</div>
          </div>
        </div>
      </template>

      <!-- ── MESSAGES TAB ──────────────────────────────────── -->
      <template v-else-if="tab === 'messages'">
        <div class="messages-wrap">
          <div class="messages-thread" ref="threadRef">
            <div v-if="loadingMessages" class="msg-loading">
              <div class="spinner-border"></div>
            </div>
            <div v-else-if="messages.length === 0" class="msg-empty">
              <i class="bi bi-chat-dots" style="font-size:2rem;color:#d0d0d0"></i>
              <p>No messages yet. Start the conversation.</p>
            </div>
            <div v-else class="msg-list">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="['msg-bubble', msg.senderId === myId ? 'msg-mine' : 'msg-theirs']"
              >
                <div class="msg-body">{{ msg.body }}</div>
                <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
              </div>
            </div>
          </div>
          <div class="msg-input-row">
            <textarea
              v-model="newMessage"
              class="msg-input"
              placeholder="Type a message…"
              rows="2"
              @keydown.enter.exact.prevent="sendMessage"
            ></textarea>
            <button class="msg-send" @click="sendMessage" :disabled="!newMessage.trim() || sendingMessage">
              <span v-if="sendingMessage" class="spinner-border spinner-border-sm"></span>
              <i v-else class="bi bi-send-fill"></i>
            </button>
          </div>
        </div>
      </template>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCoachStore } from '@/stores/coach'
import { usePlanStore } from '@/stores/plan'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'
import { useToast } from '@/composables/useToast'
import axios from 'axios'
import Chart from 'chart.js/auto'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route  = useRoute()
const router = useRouter()
const athleteId = computed(() => Number(route.params.id))

const authStore  = useAuthStore()
const coachStore = useCoachStore()
const planStore  = usePlanStore()
const { user }   = storeToRefs(authStore)
const myId       = computed(() => user.value?.id)

const { isImperial, distanceLabel, formatDistance } = useUnits()
const { showToast } = useToast()

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const WORKOUT_TYPES = ['EASY', 'TEMPO', 'INTERVAL', 'LONG_RUN', 'RECOVERY', 'REST']
const SPORTS = ['RUN', 'RIDE', 'SWIM', 'HIKE', 'WALK']
const TYPE_COLORS = {
  EASY: '#22c55e', TEMPO: '#f59e0b', INTERVAL: '#ef4444',
  LONG_RUN: '#0052FF', RECOVERY: '#8b5cf6', REST: '#9ca3af',
}
const typeColor = (t) => TYPE_COLORS[t] || '#767676'
const todayStr = new Date().toISOString().slice(0, 10)

// ── State ─────────────────────────────────────────────────────
const tab = ref('overview')

const athlete          = ref(null)
const loadingAthlete   = ref(false)
const activities       = ref([])
const loadingActivities = ref(false)
const plans            = ref([])
const loadingPlans     = ref(false)
const messages         = ref([])
const loadingMessages  = ref(false)
const newMessage       = ref('')
const sendingMessage   = ref(false)
const unreadCount      = ref(0)
const threadRef        = ref(null)

// Calendar
const calendarEvents   = ref([])
const loadingCalendar  = ref(false)
const showAddWorkout   = ref(false)
const addingWorkout    = ref(false)
const addForm = ref({ date: todayStr, workoutType: 'EASY', title: '', distanceDisplay: '', durationMinutes: '', description: '' })

// Plans
const showCreatePlan   = ref(false)
const creatingPlan     = ref(false)
const createPlanError  = ref('')
const activatingPlanId = ref(null)
const createPlanForm   = ref({ name: '', sport: 'RUN', durationWeeks: 8, daysPerWeek: 4 })

// Compliance
const complianceData   = ref([])
const loadingCompliance = ref(false)

// Drag-drop calendar
const dragEventId  = ref(null)
const dragSrcDate  = ref(null)
const dragOverDate = ref(null)

// Race targets
const races        = ref([])
const showAddRace  = ref(false)
const addingRace   = ref(false)
const raceForm     = ref({ name: '', raceDate: '', priority: 'A', distance: '' })

// Coach annotations on activities
const annotations    = ref({}) // activityId → note string
const annotatingId   = ref(null)
const annotationDraft = ref('')

// PMC chart
const pmcCanvas = ref(null)
let pmcChart = null

// Zones
const savingZones    = ref(false)
const zonesSaveError = ref('')
const zonesSaved     = ref(false)
const ZONE_COLORS_MAP = { 1: '#60a5fa', 2: '#22c55e', 3: '#f59e0b', 4: '#ef4444', 5: '#8b5cf6' }
const zoneColor = (z) => ZONE_COLORS_MAP[z] || '#767676'
const zonesForm = ref({
  maxHr: null,
  lthr: null,
  thresholdPace: '',
  hrZones: [
    { zone: 1, name: 'Active Recovery', min: 0,   max: 0 },
    { zone: 2, name: 'Aerobic',         min: 0,   max: 0 },
    { zone: 3, name: 'Tempo',           min: 0,   max: 0 },
    { zone: 4, name: 'Threshold',       min: 0,   max: 0 },
    { zone: 5, name: 'VO₂Max',          min: 0,   max: 0 },
  ],
  paceZones: [
    { zone: 1, name: 'Active Recovery', min: '', max: '', effort: 'Very Easy'    },
    { zone: 2, name: 'Aerobic',         min: '', max: '', effort: 'Easy'         },
    { zone: 3, name: 'Tempo',           min: '', max: '', effort: 'Moderate'     },
    { zone: 4, name: 'Threshold',       min: '', max: '', effort: 'Hard'         },
    { zone: 5, name: 'VO₂Max',          min: '', max: '', effort: 'Very Hard'    },
  ],
})

// ── Computed ──────────────────────────────────────────────────
const activePlan = computed(() =>
  plans.value.find(p => p.isActive || p.active) || plans.value[0] || null
)

const totalDistanceDisplay = computed(() => {
  const total = activities.value.reduce((s, a) => s + (a.distanceMeters || 0), 0)
  if (!total) return '—'
  return formatDistance(total)
})

// Build 4-week calendar view
const calendarWeeks = computed(() => {
  const weeks = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let w = 0; w < 4; w++) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() + w * 7 - today.getDay() + 1) // Monday

    const days = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + d)
      const dateStr = date.toISOString().slice(0, 10)
      days.push({
        date: dateStr,
        dow: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d],
        dayNum: date.getDate(),
        isToday: dateStr === todayStr,
        isPast: date < today,
        events: calendarEvents.value.filter(e => e.scheduledDate === dateStr),
        activities: activities.value.filter(a => a.createdAt?.slice(0, 10) === dateStr),
      })
    }

    const label = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    weeks.push({ label, startDate: weekStart.toISOString().slice(0, 10), days })
  }
  return weeks
})

// Compliance computed
const complianceWeeks = computed(() => {
  if (complianceData.value.length) return complianceData.value
  // Client-side fallback: build from calendar events + activities
  const weeks = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - w * 7 - today.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const planned = calendarEvents.value.filter(e => {
      const d = new Date(e.scheduledDate)
      return d >= weekStart && d <= weekEnd && e.workoutType !== 'REST'
    }).length

    const completed = activities.value.filter(a => {
      const d = new Date(a.createdAt)
      return d >= weekStart && d <= weekEnd
    }).length

    const pct = planned > 0 ? Math.round(Math.min(completed / planned, 1) * 100) : 0

    weeks.push({
      weekLabel: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      planned,
      completed,
      pct,
    })
  }
  return weeks
})

const totalPlanned   = computed(() => complianceWeeks.value.reduce((s, w) => s + w.planned, 0))
const totalCompleted = computed(() => complianceWeeks.value.reduce((s, w) => s + w.completed, 0))
const compliancePct  = computed(() =>
  totalPlanned.value > 0 ? Math.round(Math.min(totalCompleted.value / totalPlanned.value, 1) * 100) : 0
)

const thisWeekCompliance = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const planned = calendarEvents.value.filter(e => {
    const d = new Date(e.scheduledDate)
    return d >= weekStart && d <= weekEnd && e.workoutType !== 'REST'
  }).length

  const completed = activities.value.filter(a => {
    const d = new Date(a.createdAt)
    return d >= weekStart && d <= weekEnd
  }).length

  if (!planned) return null
  return { planned, completed, pct: Math.round(Math.min(completed / planned, 1) * 100) }
})

// ── PMC computed ──────────────────────────────────────────────
const IF_BY_TYPE = { EASY: 0.75, LONG_RUN: 0.78, TEMPO: 0.85, INTERVAL: 0.93, RECOVERY: 0.60, RUN: 0.75, BIKE: 0.72, SWIM: 0.70, HIKE: 0.65, WALK: 0.60 }

const pmcPoints = computed(() => {
  const tssMap = {}
  activities.value.forEach(a => {
    const dateStr = a.createdAt?.slice(0, 10)
    if (!dateStr) return
    const durationHours = (a.durationSeconds || 0) / 3600
    const ifactor = IF_BY_TYPE[a.type || a.sportType || 'RUN'] || 0.75
    const tss = Math.round(durationHours * 100 * ifactor * ifactor)
    tssMap[dateStr] = (tssMap[dateStr] || 0) + tss
  })
  const today = new Date()
  const points = []
  let ctl = 0, atl = 0
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const tss = tssMap[dateStr] || 0
    ctl = ctl + (tss - ctl) / 42
    atl = atl + (tss - atl) / 7
    points.push({ date: dateStr, ctl: Math.round(ctl), atl: Math.round(atl), tsb: Math.round(ctl - atl) })
  }
  return points
})

const pmcCurrent = computed(() => pmcPoints.value[pmcPoints.value.length - 1] || { ctl: 0, atl: 0, tsb: 0 })

const formLabel = computed(() => {
  const tsb = pmcCurrent.value.tsb
  if (tsb > 25) return { text: 'Fresh / Taper', cls: 'form-fresh' }
  if (tsb > 5)  return { text: 'Fresh / Ready', cls: 'form-fresh' }
  if (tsb >= -10) return { text: 'Optimal Training', cls: 'form-optimal' }
  if (tsb >= -30) return { text: 'Tired', cls: 'form-tired' }
  return { text: 'Overreaching', cls: 'form-over' }
})

// ── Fetch ─────────────────────────────────────────────────────
const fetchAthlete = async () => {
  loadingAthlete.value = true
  try {
    const { data } = await axios.get(`${API}/coach/athletes`, { headers: getAuthHeaders() })
    athlete.value = data.find(a => a.id === athleteId.value) || null
  } catch { athlete.value = null }
  finally { loadingAthlete.value = false }
}

const fetchActivities = async () => {
  loadingActivities.value = true
  try {
    const { data } = await axios.get(`${API}/activities`, {
      params: { userId: athleteId.value, page: 0, size: 50 },
      headers: getAuthHeaders()
    })
    activities.value = Array.isArray(data) ? data : (data.content || [])
  } catch { activities.value = [] }
  finally { loadingActivities.value = false }
}

const fetchPlans = async () => {
  loadingPlans.value = true
  try {
    const { data } = await axios.get(`${API}/plans`, {
      params: { athleteId: athleteId.value },
      headers: getAuthHeaders()
    })
    plans.value = Array.isArray(data) ? data : []
  } catch { plans.value = [] }
  finally { loadingPlans.value = false }
}

const fetchCalendar = async () => {
  loadingCalendar.value = true
  calendarEvents.value = await coachStore.fetchAthleteCalendar(athleteId.value)
  loadingCalendar.value = false
}

const fetchCompliance = async () => {
  loadingCompliance.value = true
  complianceData.value = await coachStore.fetchAthleteCompliance(athleteId.value)
  loadingCompliance.value = false
}

const fetchRaces = async () => {
  races.value = await coachStore.fetchAthleteRaces(athleteId.value)
}

const fetchZones = async () => {
  const data = await coachStore.fetchAthleteZones(athleteId.value)
  if (data) {
    if (data.maxHr) zonesForm.value.maxHr = data.maxHr
    if (data.lthr)  zonesForm.value.lthr  = data.lthr
    if (data.thresholdPace) zonesForm.value.thresholdPace = data.thresholdPace
    if (data.hrZones?.length)   zonesForm.value.hrZones   = data.hrZones
    if (data.paceZones?.length) zonesForm.value.paceZones = data.paceZones
  }
}

const fetchMessages = async () => {
  loadingMessages.value = true
  try {
    const { data } = await axios.get(`${API}/coach/messages/${athleteId.value}`, { headers: getAuthHeaders() })
    messages.value = Array.isArray(data) ? data : []
    scrollToBottom()
  } catch { messages.value = [] }
  finally { loadingMessages.value = false }
}

const fetchUnreadCount = async () => {
  try {
    const { data } = await axios.get(`${API}/coach/messages/${athleteId.value}`, { headers: getAuthHeaders() })
    const msgs = Array.isArray(data) ? data : []
    unreadCount.value = msgs.filter(m => !m.isRead && m.senderId !== myId.value).length
  } catch { unreadCount.value = 0 }
}

const markRead = async () => {
  try {
    await axios.patch(`${API}/coach/messages/${athleteId.value}/read`, {}, { headers: getAuthHeaders() })
    unreadCount.value = 0
    messages.value = messages.value.map(m => m.senderId !== myId.value ? { ...m, isRead: true } : m)
  } catch { /* silent */ }
}

// ── Actions ───────────────────────────────────────────────────
const switchTab = async (t) => {
  tab.value = t
  if (t === 'calendar' && !calendarEvents.value.length) await fetchCalendar()
  if (t === 'compliance') await Promise.all([
    !calendarEvents.value.length ? fetchCalendar() : Promise.resolve(),
    fetchCompliance()
  ])
  if (t === 'pmc') nextTick(() => renderPmcChart())
  if (t === 'zones') await fetchZones()
  if (t === 'messages') { await fetchMessages(); await markRead() }
}

const openAddWorkout = (date) => {
  addForm.value = {
    date: date || todayStr,
    workoutType: 'EASY',
    title: '',
    distanceDisplay: '',
    durationMinutes: '',
    description: ''
  }
  showAddWorkout.value = true
}

const submitAddWorkout = async () => {
  if (!addForm.value.date || !addForm.value.workoutType) return
  addingWorkout.value = true
  try {
    const metersPerUnit = isImperial.value ? 1609.34 : 1000
    const payload = {
      scheduledDate: addForm.value.date,
      workoutType:   addForm.value.workoutType,
      title:         addForm.value.title || addForm.value.workoutType,
      distanceMeters: addForm.value.distanceDisplay ? Math.round(addForm.value.distanceDisplay * metersPerUnit) : null,
      durationMinutes: addForm.value.durationMinutes || null,
      description:   addForm.value.description || null,
    }
    const event = await coachStore.addWorkoutToAthleteCalendar(athleteId.value, payload)
    calendarEvents.value.push(event)
    showAddWorkout.value = false
    showToast('Workout added to athlete calendar.', 'success')
  } catch {
    showToast('Failed to add workout. Please try again.', 'error')
  } finally {
    addingWorkout.value = false
  }
}

const createPlan = async () => {
  if (!createPlanForm.value.name.trim() || !createPlanForm.value.sport) return
  creatingPlan.value = true
  createPlanError.value = ''
  try {
    const plan = await planStore.createPlanForAthlete(athleteId.value, {
      name: createPlanForm.value.name.trim(),
      sport: createPlanForm.value.sport,
      durationWeeks: createPlanForm.value.durationWeeks,
      daysPerWeek: createPlanForm.value.daysPerWeek,
    })
    showCreatePlan.value = false
    router.push(`/coach/plans/${plan.id}/edit`)
  } catch {
    createPlanError.value = 'Failed to create plan. Please try again.'
  } finally {
    creatingPlan.value = false
  }
}

const activatePlan = async (planId) => {
  activatingPlanId.value = planId
  try {
    await planStore.setActivePlan(planId)
    plans.value = plans.value.map(p => ({ ...p, isActive: p.id === planId, active: p.id === planId }))
    showToast('Plan set as active.', 'success')
  } catch {
    showToast('Failed to activate plan.', 'error')
  } finally {
    activatingPlanId.value = null
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value) return
  sendingMessage.value = true
  const body = newMessage.value.trim()
  newMessage.value = ''
  try {
    const { data } = await axios.post(`${API}/coach/messages/${athleteId.value}`, { body }, { headers: getAuthHeaders() })
    messages.value.push(data)
    scrollToBottom()
  } catch {
    newMessage.value = body
  } finally {
    sendingMessage.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => { if (threadRef.value) threadRef.value.scrollTop = threadRef.value.scrollHeight })
}

// ── Drag-drop calendar ─────────────────────────────────────────
const onDragStart = (event, dateStr) => {
  dragEventId.value = event.id
  dragSrcDate.value = dateStr
}

const onDrop = async (targetDate) => {
  dragOverDate.value = null
  if (!dragEventId.value || dragSrcDate.value === targetDate) {
    dragEventId.value = null
    return
  }
  const evId = dragEventId.value
  dragEventId.value = null
  try {
    await coachStore.moveCalendarEvent(athleteId.value, evId, targetDate)
    const ev = calendarEvents.value.find(e => e.id === evId)
    if (ev) ev.scheduledDate = targetDate
    showToast('Workout moved.', 'success')
  } catch {
    showToast('Failed to move workout.', 'error')
  }
}

const deleteCalEvent = async (ev) => {
  try {
    await coachStore.deleteCalendarEvent(athleteId.value, ev.id)
    calendarEvents.value = calendarEvents.value.filter(e => e.id !== ev.id)
  } catch {
    showToast('Failed to remove workout.', 'error')
  }
}

// ── Annotations ────────────────────────────────────────────────
const startAnnotation = (activityId) => {
  annotatingId.value = activityId
  annotationDraft.value = annotations.value[activityId] || ''
}

const saveAnnotation = async (activityId) => {
  if (!annotationDraft.value.trim()) return
  try {
    await coachStore.addActivityAnnotation(activityId, annotationDraft.value.trim())
    annotations.value[activityId] = annotationDraft.value.trim()
    annotatingId.value = null
    showToast('Note saved.', 'success')
  } catch {
    showToast('Failed to save note.', 'error')
  }
}

// ── Race targets ───────────────────────────────────────────────
const addRace = async () => {
  if (!raceForm.value.name.trim() || !raceForm.value.raceDate) return
  addingRace.value = true
  try {
    const race = await coachStore.addAthleteRace(athleteId.value, { ...raceForm.value })
    races.value.push(race || { ...raceForm.value, id: Date.now() })
    races.value.sort((a, b) => new Date(a.raceDate) - new Date(b.raceDate))
    showAddRace.value = false
    raceForm.value = { name: '', raceDate: '', priority: 'A', distance: '' }
  } catch {
    showToast('Failed to add race.', 'error')
  } finally {
    addingRace.value = false
  }
}

const removeRace = async (raceId) => {
  try {
    await coachStore.deleteAthleteRace(athleteId.value, raceId)
    races.value = races.value.filter(r => r.id !== raceId)
  } catch {
    showToast('Failed to remove race.', 'error')
  }
}

const raceOnDate = (dateStr) => races.value.find(r => r.raceDate?.slice(0, 10) === dateStr)

const daysUntil = (dateStr) => {
  if (!dateStr) return '?'
  const diff = new Date(dateStr) - new Date()
  return Math.max(0, Math.ceil(diff / 86400000))
}

// ── Zones ──────────────────────────────────────────────────────
const calcHrZones = () => {
  const max = zonesForm.value.maxHr
  if (!max) return
  const pcts = [[0.50, 0.60], [0.60, 0.70], [0.70, 0.80], [0.80, 0.90], [0.90, 1.00]]
  pcts.forEach(([lo, hi], i) => {
    zonesForm.value.hrZones[i].min = Math.round(max * lo)
    zonesForm.value.hrZones[i].max = Math.round(max * hi)
  })
}

const calcPaceZones = () => {
  const tp = zonesForm.value.thresholdPace
  if (!tp || !tp.includes(':')) return
  const [m, s] = tp.split(':').map(Number)
  if (isNaN(m) || isNaN(s)) return
  const threshSecs = m * 60 + s
  // Zone multipliers relative to threshold pace
  const mults = [[1.20, 1.30], [1.10, 1.20], [1.02, 1.10], [0.97, 1.02], [0.90, 0.97]]
  mults.forEach(([lo, hi], i) => {
    const toStr = (secs) => `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, '0')}`
    zonesForm.value.paceZones[i].min = toStr(threshSecs * lo)
    zonesForm.value.paceZones[i].max = toStr(threshSecs * hi)
  })
}

const saveZones = async () => {
  savingZones.value = true
  zonesSaveError.value = ''
  zonesSaved.value = false
  try {
    await coachStore.saveAthleteZones(athleteId.value, { ...zonesForm.value })
    zonesSaved.value = true
    setTimeout(() => { zonesSaved.value = false }, 3000)
  } catch {
    zonesSaveError.value = 'Failed to save zones. Please try again.'
  } finally {
    savingZones.value = false
  }
}

// ── PMC Chart ─────────────────────────────────────────────────
const renderPmcChart = () => {
  if (!pmcCanvas.value || !pmcPoints.value.length) return
  if (pmcChart) { pmcChart.destroy(); pmcChart = null }
  const pts = pmcPoints.value
  pmcChart = new Chart(pmcCanvas.value, {
    type: 'line',
    data: {
      labels: pts.map(p => p.date),
      datasets: [
        {
          label: 'Fitness (CTL)',
          data: pts.map(p => p.ctl),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Fatigue (ATL)',
          data: pts.map(p => p.atl),
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: 'Form (TSB)',
          data: pts.map(p => p.tsb),
          borderColor: '#22c55e',
          backgroundColor: 'transparent',
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1.5,
          borderDash: [4, 3],
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (items) => items[0]?.label,
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 10,
            font: { size: 11 },
            color: '#767676',
          }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { size: 11 }, color: '#767676' },
        }
      }
    }
  })
}

// Re-render PMC when activities change and tab is visible
watch(activities, () => {
  if (tab.value === 'pmc') nextTick(() => renderPmcChart())
})

// ── Helpers ───────────────────────────────────────────────────
const formatDistShort = (m) => {
  if (!m) return '—'
  return isImperial.value ? `${(m * 0.000621371).toFixed(1)} mi` : `${(m / 1000).toFixed(1)} km`
}
const formatDurShort = (s) => {
  if (!s) return ''
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
const formatDateShort = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
const formatTime = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })
}
const sportIcon = (t) => {
  const m = { RUN: '🏃', Running: '🏃', BIKE: '🚴', Cycling: '🚴', SWIM: '🏊', HIKE: '🥾', WALK: '🚶' }
  return m[t] || '⚡'
}

// ── Lifecycle ─────────────────────────────────────────────────
onMounted(async () => {
  await fetchAthlete()
  await Promise.all([fetchActivities(), fetchPlans(), fetchUnreadCount(), fetchCalendar(), fetchRaces()])
})

onUnmounted(() => { if (pmcChart) { pmcChart.destroy(); pmcChart = null } })
</script>

<style scoped>
.athlete-detail {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: Futura, "Futura PT", "Avenir Next", system-ui, sans-serif;
}

/* ── HEADER ──────────────────────────────────────────────── */
.page-header { background: #000; color: #fff; padding: 24px 24px 0; }
.header-inner { max-width: 1200px; margin: 0 auto; }
.back-link {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  color: rgba(255,255,255,0.50); text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
  margin-bottom: 14px; transition: color 0.12s;
}
.back-link:hover { color: #fff; }
.header-kicker { font-size: 0.68rem; letter-spacing: 0.20em; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 12px; }

.header-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.ath-avatar {
  width: 56px; height: 56px; background: rgba(255,255,255,0.12); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 900; flex-shrink: 0;
}
.ath-name { font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 900; letter-spacing: -0.01em; margin: 0; }
.ath-sport-badge {
  display: inline-block; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.10em;
  text-transform: uppercase; color: rgba(255,255,255,0.60); background: rgba(255,255,255,0.10);
  padding: 2px 8px; margin-top: 4px;
}

.stats-row { display: flex; gap: 32px; padding: 16px 0; border-top: 1px solid rgba(255,255,255,0.10); flex-wrap: wrap; }
.stat-item { text-align: left; }
.stat-val { font-size: 1.4rem; font-weight: 900; color: #fff; line-height: 1; }
.val-green  { color: #4ade80 !important; }
.val-yellow { color: #fbbf24 !important; }
.val-red    { color: #f87171 !important; }
.stat-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-top: 3px; }

.tab-bar { display: flex; gap: 0; margin-top: 16px; overflow-x: auto; }
.tab {
  padding: 12px 20px; background: none; border: none; white-space: nowrap;
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.50); cursor: pointer; font-family: inherit;
  border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s;
}
.tab.active { color: #fff; border-bottom-color: #fff; }
.tab-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 4px;
  background: #ef4444; color: #fff; font-size: 0.6rem; font-weight: 700; margin-left: 6px;
}

.content-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 24px 80px; }

/* ── OVERVIEW ────────────────────────────────────────────── */
.overview-grid { display: grid; grid-template-columns: 320px 1fr; gap: 20px; align-items: start; }
.overview-card { border: 1px solid #E5E5E5; padding: 20px; }
.card-label { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(15,18,16,0.40); margin-bottom: 14px; }
.no-data { font-size: 0.85rem; color: #767676; padding: 8px 0; }
.link-btn { background: none; border: none; color: #0052FF; font-size: 0.85rem; font-weight: 600; cursor: pointer; padding: 0; }

.plan-card { display: flex; flex-direction: column; gap: 6px; }
.plan-name { font-size: 0.95rem; font-weight: 900; color: #000; }
.plan-meta { font-size: 0.75rem; color: #767676; }
.plan-progress-wrap { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
.plan-progress-bar { flex: 1; height: 2px; background: #E5E5E5; }
.plan-progress-fill { height: 100%; background: #000; }
.plan-pct { font-size: 0.7rem; font-weight: 700; color: #767676; }
.btn-edit-plan { font-size: 0.82rem; font-weight: 700; color: #000; text-decoration: none; margin-top: 4px; }
.btn-edit-plan:hover { text-decoration: underline; }

.compliance-mini { margin-top: 4px; }
.compliance-row { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.compliance-fraction { font-size: 0.82rem; font-weight: 600; color: #000; }
.compliance-chip { font-size: 0.72rem; font-weight: 700; padding: 2px 8px; letter-spacing: 0.05em; }
.chip-green  { background: #dcfce7; color: #16a34a; }
.chip-yellow { background: #fef9c3; color: #ca8a04; }
.chip-red    { background: #fee2e2; color: #dc2626; }

.activity-list { display: flex; flex-direction: column; }
.act-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #E5E5E5; text-decoration: none; color: inherit; }
.act-row:last-child { border-bottom: none; }
.act-row:hover { background: #fafafa; }
.act-icon { font-size: 1.2rem; }
.act-info { flex: 1; }
.act-name { font-size: 0.85rem; font-weight: 700; color: #000; }
.act-meta { font-size: 0.72rem; color: #767676; margin-top: 2px; }
.act-date { color: #aaa; }
.act-arrow { color: #ccc; font-size: 0.80rem; }

/* ── CALENDAR ────────────────────────────────────────────── */
.cal-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.cal-toolbar-title { font-size: 1rem; font-weight: 700; }

.cal-weeks { display: flex; flex-direction: column; gap: 28px; }
.cal-week-block {}
.cal-week-header {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
  color: #767676; border-bottom: 1px solid #E5E5E5; padding-bottom: 8px; margin-bottom: 10px;
}
.cal-week-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.cal-day { border: 1px solid #E5E5E5; padding: 8px; min-height: 80px; }
.cal-day--today { border-color: #0052FF; background: rgba(0,82,255,0.02); }
.cal-day--past { opacity: 0.60; }
.cal-day-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
.cal-day-dow { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #aaa; }
.cal-day-num { font-size: 0.82rem; font-weight: 700; color: #000; }
.today-num { color: #0052FF; }

.cal-event { padding: 4px 6px; margin-bottom: 3px; border-left: 3px solid; }
.cal-event--planned { background: #f9f9f9; }
.cal-event--done { background: #f0fdf4; border-left-color: #16a34a; }
.cal-event-type { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #000; }
.cal-event-detail { font-size: 0.65rem; color: #767676; margin-top: 1px; }
.cal-event-title { font-size: 0.65rem; color: #444; margin-top: 1px; }

.cal-day-empty { display: flex; align-items: center; justify-content: center; height: 40px; }
.cal-add-btn {
  width: 20px; height: 20px; background: none; border: 1px dashed #ddd; color: #ccc;
  font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.cal-add-btn:hover { border-color: #0052FF; color: #0052FF; }

/* Add Workout Drawer */
.drawer-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.40); z-index: 400;
  display: flex; align-items: flex-end;
}
.add-workout-drawer {
  width: 100%; max-width: 540px; background: #fff; margin: 0 auto;
  display: flex; flex-direction: column; max-height: 85vh;
}
.drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #E5E5E5;
}
.drawer-title { font-size: 1rem; font-weight: 700; margin: 0; }
.drawer-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #767676; }
.drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.drawer-footer { padding: 16px 24px; border-top: 1px solid #E5E5E5; display: flex; justify-content: flex-end; gap: 10px; }

/* ── PLANS ───────────────────────────────────────────────── */
.plans-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.plans-toolbar-title { font-size: 1rem; font-weight: 700; }

.plans-list { display: flex; flex-direction: column; gap: 10px; }
.plan-row {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
  padding: 16px 20px; border: 1px solid #E5E5E5;
}
.plan-row--active { border-color: #0052FF; background: rgba(0,82,255,0.02); }
.plan-row-left { flex: 1; min-width: 0; }
.plan-row-badge {
  display: inline-block; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; background: #0052FF; color: #fff; padding: 2px 8px; margin-bottom: 6px;
}
.plan-row-name { font-size: 0.95rem; font-weight: 700; color: #000; }
.plan-row-meta { font-size: 0.75rem; color: #767676; margin-top: 3px; }
.plan-row-progress-wrap { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.plan-row-progress-bar { width: 120px; height: 2px; background: #E5E5E5; }
.plan-row-progress-fill { height: 100%; background: #0052FF; }
.plan-row-pct { font-size: 0.7rem; color: #767676; font-weight: 600; }
.plan-row-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.btn-plan-edit {
  padding: 7px 14px; border: 1px solid #E5E5E5; background: #fff; color: #000;
  font-size: 0.75rem; font-weight: 600; text-decoration: none; cursor: pointer;
}
.btn-plan-edit:hover { border-color: #000; }
.btn-plan-activate {
  padding: 7px 14px; border: none; background: #0052FF; color: #fff;
  font-size: 0.75rem; font-weight: 600; cursor: pointer;
}
.btn-plan-activate:hover { background: #003ECC; }
.btn-plan-activate:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── COMPLIANCE ──────────────────────────────────────────── */
.compliance-summary {
  display: flex; gap: 40px; padding: 20px 24px;
  border: 1px solid #E5E5E5; margin-bottom: 24px;
}
.cs-stat {}
.cs-val { font-size: 2rem; font-weight: 900; line-height: 1; }
.cs-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase; color: #767676; margin-top: 4px; }

.compliance-weeks { display: flex; flex-direction: column; gap: 14px; }
.compliance-week-row { border: 1px solid #E5E5E5; padding: 14px 16px; }
.cw-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #767676; margin-bottom: 10px; }
.cw-bar-wrap { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.cw-bar-bg { flex: 1; height: 6px; background: #E5E5E5; }
.cw-bar-fill { height: 100%; transition: width 0.4s ease; }
.cw-fraction { font-size: 0.82rem; font-weight: 600; color: #767676; white-space: nowrap; }
.cw-pct { font-size: 0.82rem; font-weight: 700; min-width: 36px; text-align: right; }
.cw-days { display: flex; gap: 4px; flex-wrap: wrap; }
.cw-dot { width: 10px; height: 10px; }
.dot-done   { background: #16a34a; }
.dot-missed { background: #ef4444; }
.dot-rest   { background: #E5E5E5; }

/* ── SHARED FORM ELEMENTS ────────────────────────────────── */
.form-field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #767676; }
.field-input {
  border: 1px solid #E5E5E5; padding: 10px 12px; font-size: 0.88rem;
  font-family: inherit; outline: none; background: #fff; width: 100%;
}
.field-input:focus { border-color: #0052FF; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.optional { font-size: 0.65rem; color: #aaa; font-weight: 500; text-transform: none; letter-spacing: 0; }

.type-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.type-pill {
  padding: 6px 12px; border: 1px solid #E5E5E5; background: #fff; color: #767676;
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; cursor: pointer; font-family: inherit;
}
.type-pill.active { border-color: transparent; }
.type-pill:hover { border-color: #000; color: #000; }

/* ── MODALS ──────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.40); z-index: 300; display: flex; align-items: center; justify-content: center; padding: 20px; }
.modal-card { background: #fff; width: 100%; max-width: 480px; max-height: 90vh; display: flex; flex-direction: column; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 16px; border-bottom: 1px solid #E5E5E5; }
.modal-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #767676; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; }
.modal-footer { padding: 16px 24px; border-top: 1px solid #E5E5E5; display: flex; justify-content: flex-end; gap: 10px; }
.form-error { font-size: 0.82rem; color: #dc2626; font-weight: 600; }

/* ── MESSAGES ────────────────────────────────────────────── */
.messages-wrap { display: flex; flex-direction: column; height: calc(100vh - var(--nav-h, 64px) - 280px); min-height: 400px; border: 1px solid #E5E5E5; }
.messages-thread { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
.msg-loading, .msg-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; flex: 1; color: rgba(15,18,16,0.40); text-align: center; }
.msg-empty p { font-size: 0.85rem; margin: 0; font-weight: 600; }
.msg-list { display: flex; flex-direction: column; gap: 10px; }
.msg-bubble { max-width: 70%; display: flex; flex-direction: column; gap: 3px; }
.msg-mine { align-self: flex-end; align-items: flex-end; }
.msg-theirs { align-self: flex-start; align-items: flex-start; }
.msg-body { padding: 10px 14px; font-size: 0.88rem; line-height: 1.5; word-break: break-word; }
.msg-mine .msg-body { background: #000; color: #fff; }
.msg-theirs .msg-body { background: #f0f0f0; color: #000; }
.msg-time { font-size: 0.65rem; color: rgba(15,18,16,0.40); font-weight: 600; }
.msg-input-row { display: flex; gap: 0; border-top: 1px solid #E5E5E5; flex-shrink: 0; }
.msg-input { flex: 1; border: none; padding: 14px 16px; font-size: 0.88rem; font-family: inherit; resize: none; outline: none; background: #fff; }
.msg-send { width: 52px; background: #000; color: #fff; border: none; font-size: 1rem; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.msg-send:hover { opacity: 0.85; }
.msg-send:disabled { opacity: 0.40; cursor: not-allowed; }

/* ── SHARED BUTTONS ──────────────────────────────────────── */
.btn-primary-sm {
  display: inline-flex; align-items: center; padding: 8px 18px;
  background: #0052FF; color: #fff; border: 2px solid #0052FF;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.10em; text-transform: uppercase;
  cursor: pointer; font-family: inherit; text-decoration: none;
}
.btn-primary-sm:hover { background: #003ECC; border-color: #003ECC; }
.btn-primary-sm:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-ghost-sm {
  display: inline-flex; align-items: center; padding: 8px 18px;
  background: #fff; color: #000; border: 1px solid #E5E5E5;
  font-size: 0.75rem; font-weight: 600; cursor: pointer; font-family: inherit;
}
.btn-ghost-sm:hover { border-color: #000; }

.btn-ghost-xs {
  display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px;
  background: none; color: #767676; border: 1px solid #E5E5E5;
  font-size: 0.68rem; font-weight: 600; cursor: pointer; font-family: inherit;
}
.btn-ghost-xs:hover { border-color: #000; color: #000; }

/* ── DRAG-DROP CALENDAR ──────────────────────────────────── */
.cal-day--drag-over { background: rgba(0,82,255,0.05); outline: 1px dashed #0052FF; }
.cal-event--dragging { opacity: 0.4; }
.cal-event--planned { display: flex; align-items: flex-start; gap: 4px; cursor: grab; }
.cal-event--planned:active { cursor: grabbing; }
.cal-event-drag-handle { color: #BDBDBD; font-size: 0.7rem; padding-top: 1px; flex-shrink: 0; }
.cal-event-body { flex: 1; min-width: 0; }
.cal-event-del {
  background: none; border: none; color: #BDBDBD; cursor: pointer;
  font-size: 0.7rem; padding: 0 2px; flex-shrink: 0; opacity: 0; transition: opacity 0.15s;
}
.cal-event--planned:hover .cal-event-del { opacity: 1; }
.cal-event-del:hover { color: #ef4444; }

/* Race flag on calendar */
.cal-race-flag {
  font-size: 0.58rem; font-weight: 700; letter-spacing: 0.06em;
  text-transform: uppercase; padding: 2px 5px; margin-bottom: 4px;
  display: inline-block;
}
.priority-a { background: rgba(239,68,68,0.12); color: #dc2626; }
.priority-b { background: rgba(245,158,11,0.12); color: #b45309; }
.priority-c { background: rgba(59,130,246,0.12); color: #1d4ed8; }

/* ── ANNOTATIONS ─────────────────────────────────────────── */
.act-row-wrap { border-bottom: 1px solid #F5F5F5; }
.act-row-wrap:last-child { border-bottom: none; }
.annotation-wrap { padding: 0 12px 10px 44px; }
.annotation-saved { display: flex; align-items: flex-start; gap: 8px; padding: 6px 10px; background: rgba(59,130,246,0.06); border-left: 2px solid #3b82f6; }
.annotation-icon { color: #3b82f6; font-size: 0.82rem; flex-shrink: 0; margin-top: 1px; }
.annotation-text { font-size: 0.78rem; color: #555; font-style: italic; flex: 1; }
.annotation-edit-btn { background: none; border: none; color: #767676; cursor: pointer; font-size: 0.75rem; padding: 0 4px; flex-shrink: 0; }
.annotation-edit-btn:hover { color: #000; }
.annotation-input-row { display: flex; flex-direction: column; gap: 6px; }
.annotation-input {
  width: 100%; padding: 8px 10px; border: 1px solid #E5E5E5;
  font-family: inherit; font-size: 0.82rem; resize: none; outline: none; border-radius: 0; box-sizing: border-box;
}
.annotation-input:focus { border-color: #0052FF; }
.annotation-input-actions { display: flex; gap: 6px; justify-content: flex-end; }
.btn-annot-cancel { padding: 5px 12px; background: #fff; color: #767676; border: 1px solid #E5E5E5; font-family: inherit; font-size: 0.72rem; cursor: pointer; }
.btn-annot-save { padding: 5px 12px; background: #0052FF; color: #fff; border: none; font-family: inherit; font-size: 0.72rem; font-weight: 700; cursor: pointer; }
.btn-annot-save:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-annotate { background: none; border: none; color: #BDBDBD; cursor: pointer; font-family: inherit; font-size: 0.72rem; font-weight: 600; padding: 4px 0; display: flex; align-items: center; gap: 4px; }
.btn-annotate:hover { color: #767676; }

/* ── RACE TARGETS ────────────────────────────────────────── */
.card-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.card-label-row .card-label { margin-bottom: 0; }
.race-list { display: flex; flex-direction: column; gap: 8px; }
.race-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid #E5E5E5; }
.race-priority { width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
.race-info { flex: 1; min-width: 0; }
.race-name { font-weight: 700; font-size: 0.85rem; }
.race-meta { font-size: 0.72rem; color: #767676; margin-top: 1px; }
.race-days { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.race-days-val { font-size: 1.1rem; font-weight: 700; line-height: 1; }
.race-days-lbl { font-size: 0.6rem; color: #767676; text-transform: uppercase; letter-spacing: 0.06em; }
.race-del-btn { background: none; border: none; color: #BDBDBD; cursor: pointer; font-size: 0.85rem; padding: 4px; flex-shrink: 0; }
.race-del-btn:hover { color: #ef4444; }
.priority-pills { display: flex; gap: 6px; }
.priority-pill { width: 38px; height: 34px; border: 1px solid #E5E5E5; background: #fff; font-family: inherit; font-size: 0.82rem; font-weight: 700; cursor: pointer; border-radius: 0; transition: all 0.15s; }
.priority-pill.active { background: #000; color: #fff; border-color: #000; }

/* ── PMC CHART ───────────────────────────────────────────── */
.pmc-header { padding: 24px; border-bottom: 1px solid #E5E5E5; }
.pmc-header-stats { display: flex; gap: 32px; flex-wrap: wrap; margin-bottom: 16px; }
.pmc-stat { display: flex; flex-direction: column; gap: 2px; }
.pmc-stat-val { font-size: 2rem; font-weight: 800; line-height: 1; }
.pmc-stat-lbl { font-size: 0.7rem; color: #767676; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
.pmc-stat--explain { border-left: 1px solid #E5E5E5; padding-left: 24px; }
.pmc-form-label { font-size: 1.1rem; font-weight: 700; padding: 4px 10px; }
.form-fresh   { background: rgba(34,197,94,0.12);  color: #16a34a; }
.form-optimal { background: rgba(0,82,255,0.10);   color: #0052FF; }
.form-tired   { background: rgba(245,158,11,0.12); color: #b45309; }
.form-over    { background: rgba(239,68,68,0.12);  color: #dc2626; }
.pmc-legend { display: flex; gap: 16px; flex-wrap: wrap; }
.pmc-legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 600; color: #555; }
.pmc-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.pmc-chart-wrap { padding: 24px; height: 260px; }
.pmc-canvas { width: 100% !important; height: 100% !important; }
.pmc-explainer { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 6px; }
.pmc-ex-item { font-size: 0.78rem; color: #767676; }
.pmc-ex-item strong { color: #000; }
.pmc-ex-phases { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.phase-chip { padding: 4px 10px; font-size: 0.7rem; font-weight: 700; }
.phase-fresh    { background: rgba(34,197,94,0.10);  color: #16a34a; }
.phase-optimal  { background: rgba(0,82,255,0.08);   color: #0052FF; }
.phase-tired    { background: rgba(245,158,11,0.10); color: #b45309; }
.phase-overtrain { background: rgba(239,68,68,0.10); color: #dc2626; }

/* ── ZONES ───────────────────────────────────────────────── */
.zones-wrap { padding: 24px; display: flex; flex-direction: column; gap: 32px; }
.zones-section { display: flex; flex-direction: column; gap: 16px; }
.zones-section-title { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #000; }
.zones-subtitle { font-weight: 400; color: #767676; text-transform: none; letter-spacing: 0; }
.zones-max-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.zones-input { max-width: 200px; }
.zones-table { border: 1px solid #E5E5E5; }
.zones-table-header { display: grid; grid-template-columns: 50px 150px 1fr 80px; padding: 8px 12px; background: #F5F5F5; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #767676; gap: 12px; }
.zones-row { display: grid; grid-template-columns: 50px 150px 1fr 80px; padding: 10px 12px; border-top: 1px solid #F0F0F0; gap: 12px; align-items: center; }
.z-zone { font-size: 0.82rem; font-weight: 700; }
.z-name { font-size: 0.78rem; font-weight: 600; }
.z-range { display: flex; align-items: center; gap: 4px; }
.z-input { width: 56px; padding: 4px 6px; border: 1px solid #E5E5E5; font-family: inherit; font-size: 0.78rem; text-align: center; outline: none; border-radius: 0; }
.z-input:focus { border-color: #000; }
.z-pace { width: 52px; }
.z-pct { font-size: 0.72rem; color: #767676; font-weight: 600; }
.zones-actions { display: flex; align-items: center; gap: 16px; }
.zones-saved-msg { font-size: 0.78rem; font-weight: 700; color: #16a34a; }
.form-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #dc2626; font-size: 0.82rem; font-weight: 600; padding: 10px 12px; }

/* ── SHARED STATES ───────────────────────────────────────── */
.loading-state { display: flex; justify-content: center; padding: 60px; }
.empty-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 24px; border: 1px solid #E5E5E5; text-align: center; }
.empty-card p { font-size: 0.88rem; color: #767676; margin: 0; }

.spinner-border { width: 1.2rem; height: 1.2rem; border: 2px solid rgba(0,0,0,0.10); border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
.me-1 { margin-right: 4px; }
.me-2 { margin-right: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .overview-grid { grid-template-columns: 1fr; }
  .cal-week-days { grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; }
}
@media (max-width: 600px) {
  .hero-bar { padding: 24px 16px 20px; }
  .hero-name { font-size: clamp(1.6rem, 6vw, 2.5rem); }
  .stats-row { gap: 16px; flex-wrap: wrap; }
  .stat-item { flex: 0 0 calc(50% - 8px); }
  .compliance-summary { gap: 16px; flex-wrap: wrap; }
  .tab-bar {
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 0;
  }
  .tab-bar::-webkit-scrollbar { display: none; }
  .tab-bar .tab { flex-shrink: 0; font-size: 0.68rem; padding: 10px 10px; }
  .tab-content { padding: 16px; }
  .cal-week-days { grid-template-columns: 1fr; }
  .cal-week-day { min-height: 52px; }
  .pmc-stat-row { gap: 16px; flex-wrap: wrap; }
  .pmc-stat { flex: 0 0 calc(33% - 12px); }
  .zones-form { gap: 12px; }
  .zone-row { flex-direction: column; gap: 8px; }
  .zone-inputs { flex-wrap: wrap; gap: 6px; }
  .overview-grid { gap: 16px; }
  .activity-list { gap: 8px; }
  .activity-card { padding: 10px 12px; }
  .race-list { gap: 8px; }
  .race-card { flex-wrap: wrap; gap: 6px; }
}
</style>
