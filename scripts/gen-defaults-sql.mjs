// Prints the SQL that inserts default options, workspace settings, developer
// emails and default views. Source of truth: src/config/brand.js + defaultViews.js
//   node scripts/gen-defaults-sql.mjs > supabase/defaults.generated.sql
import { BRAND } from '../src/config/brand.js'
import { DEFAULT_VIEWS } from '../src/config/defaultViews.js'

const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const j = (o) => `${q(JSON.stringify(o))}::jsonb`
const out = []

out.push('-- ── Defaults (generated from src/config/brand.js + defaultViews.js) ──')
const optRows = []
for (const [kind, list] of Object.entries(BRAND.options)) {
  list.forEach((o, i) => optRows.push(`  (${q(kind)}, ${q(o.value)}, ${q(o.color)}, ${i}, ${j(o.meta || {})})`))
}
out.push('INSERT INTO config_options (kind, value, color, sort_order, meta) VALUES\n' + optRows.join(',\n') + ';')

out.push(`INSERT INTO workspace_settings (key, value) VALUES
  ('app_name', ${j(BRAND.appName)}),
  ('org_name', ${j(BRAND.orgName)}),
  ('logo_text', ${j(BRAND.logoText)}),
  ('accent', ${j(BRAND.accent)}),
  ('report_due_days', ${j(BRAND.reportDueDays)}),
  ('bounce_stage', ${j(BRAND.bounceStage)}),
  ('property_labels', '{}'::jsonb);`)

out.push('INSERT INTO app_admins (email) VALUES\n' + BRAND.developerEmails.map((e) => `  (${q(e.toLowerCase())})`).join(',\n') + ';')

const viewRows = []
for (const [page, views] of Object.entries(DEFAULT_VIEWS)) {
  views.forEach((v, i) => viewRows.push(`  (${q(page)}, ${q(v.name)}, ${j(v.config)}, ${i})`))
}
out.push('INSERT INTO saved_views (page, name, config, sort_order) VALUES\n' + viewRows.join(',\n') + ';')

console.log(out.join('\n\n'))
