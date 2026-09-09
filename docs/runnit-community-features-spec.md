# Runnit community features spec

## Product direction

Turn an activity into a richer piece of athlete context: what happened, what
was playing, what race it supports, and how the crew can respond. Keep the
first release lightweight and additive so existing activities and integrations
continue to work.

## Release 1 — ship now

### Races profile tab

Add a `Races` tab to profiles. It combines activities classified as `RACE`
with saved race bookmarks, sorted newest first. A race row shows name/type,
date, distance, time, and a link to the activity where available. Existing
PRs remain in `Records`; this tab is the athlete's race history.

### Trophy Case

Rename the profile's `Badges` surface to `Trophy Case` without changing badge
IDs, earning rules, or URLs. This is a presentation-only change.

### Listening to

Store optional track metadata on an activity: track name, artist, provider,
and provider URL. The first provider is Spotify. Activity detail displays it
only when present; older activities remain unchanged. Do not store listening
history or audio data.

### Conversation foundations

Comments gain optional `parent_id`, `media_url`, and `media_type`. Replies are
returned chronologically with enough metadata for the client to render a
thread. Media is URL-based in this release; uploads/GIF search should use the
existing upload service in a follow-up after moderation and size limits are
settled.

## Release 2 — training blocks and race goals

- Rebrand an active plan as a named goal folder (for example, `London
  Marathon`) and expose its workouts as a progress collection.
- Add goal progress: completed workouts, planned workouts, weekly volume,
  training phase, and countdown from `targetRaceDate`.
- Allow an athlete to attach an activity to a goal folder after logging.

The existing `Plan`, `PlanWorkout`, adaptive-plan audit trail, and
`targetRaceDate` are the correct foundation; a separate generic folder table
would duplicate that model.

## Release 3 — event composition and conversation polish

- Let athletes create a multisport event from existing activities and show one
  combined summary. The current `MultisportEvent` model/detail route already
  support this direction.
- Add mention suggestions and notification fan-out for `@mentions`.
- Add GIF search/provider integration, upload validation, reply threading in
  moments as well as activities, and moderation/reporting.

## Acceptance criteria for Release 1

- Existing activities, comments, and profiles load with no migration-related
  errors.
- A new activity can include listening metadata and activity detail renders it.
- A profile's Races tab works for another athlete, not only the current user.
- Reply metadata is preserved and parent comments remain stable in chronological
  order.
- Empty and legacy states are explicit rather than showing invented data.
