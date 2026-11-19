// ─────────────────────────────────────────────────────────────────────────────
// Looper Tasks — default branding + default option lists.
//
// These are the DEFAULTS. Once the database is set up, the developer account can
// change almost all of this live from the in-app Customize screen (stored in
// Supabase). To re-generate the default rows in SQL after editing this file:
//     node scripts/gen-defaults-sql.mjs > supabase/defaults.generated.sql
// ─────────────────────────────────────────────────────────────────────────────

export const BRAND = {
  appName: 'Looper Tasks',
  orgName: 'Looper Agency',
  slug: 'looper-tasks',          // prefix for localStorage keys
  logoText: 'LT',
  accent: '#7C5CFC',

  reportDueDays: 30,             // ad campaign "Report due" after this many days without a report
  bounceStage: 'Bounced',        // stage a task moves to when an AM bounces it
  developerEmails: ['ekagamsakhurdia0325@gmail.com'],

  // value = what is stored on records. `meta.complete` = counts as finished,
  // `meta.dim` = visually muted column/card.
  options: {
    stage: [
      { value: 'Not started',     color: '#6B7280' },
      { value: 'Editing',         color: '#3B82F6' },
      { value: 'Motion',          color: '#6366F1' },
      { value: 'Designing',       color: '#8B5CF6' },
      { value: 'Bounced',         color: '#EF4444' },
      { value: 'Internal Review', color: '#F59E0B' },
      { value: 'Sent to client',  color: '#06B6D4' },
      { value: 'Approved',        color: '#10B981', meta: { complete: true } },
      { value: 'Delivered',       color: '#22C55E', meta: { complete: true } },
      { value: 'Archive',         color: '#4ADE80', meta: { complete: true } },
      { value: 'Shoot Readiness', color: '#94A3B8', meta: { dim: true } },
      { value: 'Filming',         color: '#94A3B8', meta: { dim: true } },
    ],
    priority: [
      { value: 'P1', color: '#F85C5C' },
      { value: 'P2', color: '#FB923C' },
      { value: 'P3', color: '#FACC15' },
      { value: 'P4', color: '#6B7E99' },
    ],
    department: [
      { value: 'Design',     color: '#A78BFA' },
      { value: 'Production', color: '#34D399' },
      { value: 'DM',         color: '#60A5FA' },
      { value: 'Copy',       color: '#F472B6' },
    ],
    task_type: [
      { value: 'Video',       color: '#3B82F6' },
      { value: 'Post/Design', color: '#8B5CF6' },
      { value: 'Story',       color: '#EC4899' },
      { value: 'Reel',        color: '#F97316' },
      { value: 'Animation',   color: '#6366F1' },
      { value: 'Copy',        color: '#F472B6' },
      { value: 'Photo',       color: '#06B6D4' },
      { value: 'OOH',         color: '#EAB308' },
      { value: 'Print',       color: '#94A3B8' },
    ],
    brief_type: [
      { value: 'Video',       color: '#3B82F6' },
      { value: 'Post/Design', color: '#8B5CF6' },
      { value: 'Story',       color: '#EC4899' },
      { value: 'Campaign',    color: '#F59E0B' },
    ],
    brief_status: [
      { value: 'Copy',       color: '#F472B6' },
      { value: 'Design',     color: '#A78BFA' },
      { value: 'Production', color: '#34D399' },
      { value: 'Done',       color: '#22C55E', meta: { complete: true } },
      { value: 'Archived',   color: '#6B7280', meta: { complete: true } },
    ],
    client_status: [
      { value: 'Active',   color: '#10B981' },
      { value: 'Paused',   color: '#F59E0B' },
      { value: 'Inactive', color: '#6B7280' },
    ],
    client_tier: [
      { value: 'Standard',  color: '#EC4899' },
      { value: 'Strategic', color: '#3B82F6' },
    ],
    industry: [
      { value: 'სამშენებლო',          color: '#6B7280' },
      { value: 'სამშენებლო მასალები', color: '#B7791F' },
      { value: 'რესტორანი',           color: '#F59E0B' },
      { value: 'საინფორმაციო',        color: '#8B5CF6' },
      { value: 'ტექინსპექტირება',     color: '#3B82F6' },
      { value: 'აბანო',               color: '#A78BFA' },
      { value: 'ინტერნეტ სერვისი',    color: '#F97316' },
      { value: 'ბუღალტერია',          color: '#D4A017' },
    ],
    platform: [
      { value: 'Instagram',  color: '#10B981' },
      { value: 'Facebook',   color: '#D4A017' },
      { value: 'Meta Ads',   color: '#8B5CF6' },
      { value: 'Tik-Tok',    color: '#B7791F' },
      { value: 'YouTube',    color: '#A16207' },
      { value: 'Google Ads', color: '#EC4899' },
      { value: 'linkedin',   color: '#6B7280' },
    ],
    campaign_status: [
      { value: 'Awaiting Tasks', color: '#F59E0B' },
      { value: 'Tasks Done',     color: '#6B7280' },
      { value: 'Live',           color: '#3B82F6' },
      { value: 'Paused',         color: '#94A3B8' },
      { value: 'Finished',       color: '#22C55E', meta: { complete: true } },
    ],
  },
}
