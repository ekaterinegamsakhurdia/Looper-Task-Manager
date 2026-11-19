// Property (field) definitions for every database page — the equivalent of Notion's
// "properties". Built-in ones live here; the developer adds more in Customize →
// Properties (stored in `custom_properties`, values in each record's `custom` JSON).
//
// type: text | number | date | checkbox | select | person | relation (single value)
//       multi_select | people | relations (array of values)
// kind:   name of a config_options list (colors/order editable by the developer)
// source: employees | clients | briefs | campaigns | tasks (values are record ids)

export const ENTITIES = {
  tasks:     { label: 'Tasks',   singular: 'task',     table: 'tasks',        title: 'title' },
  briefs:    { label: 'Briefs',  singular: 'brief',    table: 'briefs',       title: 'title' },
  clients:   { label: 'Clients', singular: 'client',   table: 'clients',      title: 'name'  },
  campaigns: { label: 'Ad Ops',  singular: 'campaign', table: 'ad_campaigns', title: 'name'  },
}

export const REPORT_STATES = [
  { value: 'Reported',   color: '#10B981' },
  { value: 'Report due', color: '#EF4444' },
  { value: 'New',        color: '#6B7280' },
  { value: 'Closed',     color: '#94A3B8' },
]

// dv = visible by default in tables
const P = (key, label, type, extra = {}) => ({ key, label, type, ...extra })

const BUILTIN = {
  tasks: [
    P('title', 'Task', 'text', { title: true, dv: true, width: 300 }),
    P('stage', 'Stage', 'select', { kind: 'stage', dv: true }),
    P('priority', 'Priority', 'select', { kind: 'priority', dv: true }),
    P('department', 'Department', 'select', { kind: 'department', dv: true }),
    P('task_type', 'Type', 'select', { kind: 'task_type' }),
    P('assigned_to', 'Assignee', 'people', { source: 'employees', dv: true }),
    P('client_id', 'Client', 'relation', { source: 'clients', dv: true }),
    P('brief_id', 'Brief', 'relation', { source: 'briefs', dv: true, width: 220 }),
    P('campaign_id', 'Ad Campaign', 'relation', { source: 'campaigns' }),
    P('am_id', 'AM (from brief)', 'person', { source: 'employees', readonly: true }),
    P('deadline', 'Deadline', 'date', { dv: true }),
    P('bounce_internal', 'Internal bounce', 'checkbox'),
    P('bounce_client', 'Client bounce', 'checkbox'),
    P('rev_internal', 'Internal revisions', 'number'),
    P('rev_client', 'Client revisions', 'number'),
    P('notes', 'Notes', 'text', { multiline: true }),
    P('created_at', 'Created', 'date', { readonly: true }),
  ],
  briefs: [
    P('title', 'Brief', 'text', { title: true, dv: true, width: 300 }),
    P('client_id', 'Client', 'relation', { source: 'clients', dv: true }),
    P('campaign_id', 'Ad Campaign', 'relation', { source: 'campaigns', dv: true, width: 220 }),
    P('status', 'Brief status', 'select', { kind: 'brief_status', dv: true }),
    P('brief_type', 'Type', 'select', { kind: 'brief_type', dv: true }),
    P('am_owner_id', 'AM Owner', 'person', { source: 'employees', dv: true }),
    P('copywriter_id', 'Copywriter', 'person', { source: 'employees' }),
    P('committed_task_count', 'Committed tasks', 'number', { dv: true }),
    P('actual_task_count', 'Actual tasks', 'number', { readonly: true, dv: true }),
    P('count_check', 'Count check', 'select', { readonly: true, dv: true, options: [
      { value: '✓ Match', color: '#10B981' }, { value: 'Missing tasks', color: '#F59E0B' }, { value: 'Extra tasks', color: '#EF4444' }] }),
    P('tasks', 'Tasks', 'relations', { source: 'tasks', readonly: true }),
    P('content', 'Brief content', 'text', { multiline: true }),
    P('created_at', 'Created', 'date', { readonly: true }),
  ],
  clients: [
    P('name', 'Client Name', 'text', { title: true, dv: true, width: 260 }),
    P('am_owner_id', 'AM Owner', 'person', { source: 'employees', dv: true }),
    P('status', 'Status', 'select', { kind: 'client_status', dv: true }),
    P('industry', 'Industry', 'select', { kind: 'industry', dv: true }),
    P('tier', 'Client Tier', 'select', { kind: 'client_tier', dv: true }),
    P('platforms', 'Platforms', 'multi_select', { kind: 'platform', dv: true, width: 220 }),
    P('briefs', 'Briefs', 'relations', { source: 'briefs', readonly: true, dv: true, width: 240 }),
    P('campaigns', 'Ad Campaigns', 'relations', { source: 'campaigns', readonly: true, dv: true, width: 240 }),
    P('notes', 'Notes', 'text', { multiline: true }),
    P('created_at', 'Created', 'date', { readonly: true }),
  ],
  campaigns: [
    P('name', 'Campaign Name', 'text', { title: true, dv: true, width: 280 }),
    P('tasks', 'Tasks', 'relations', { source: 'tasks', readonly: true, dv: true, width: 240 }),
    P('client_id', 'Client', 'relation', { source: 'clients', dv: true }),
    P('advertiser_ids', 'Advertiser', 'people', { source: 'employees', dv: true }),
    P('status', 'Status', 'select', { kind: 'campaign_status', dv: true }),
    P('start_date', 'Start Date', 'date', { dv: true }),
    P('report_state', 'Report Status', 'select', { readonly: true, dv: true, options: REPORT_STATES }),
    P('budget', 'Budget', 'number', { dv: true }),
    P('end_date', 'End Date', 'date', { dv: true }),
    P('last_reported', 'Last Reported', 'date', { dv: true }),
    P('am_owner_ids', 'AM Owner', 'people', { source: 'employees', dv: true }),
    P('briefs', 'Briefs', 'relations', { source: 'briefs', readonly: true }),
    P('notes', 'Notes', 'text', { multiline: true }),
    P('created_at', 'Created', 'date', { readonly: true }),
  ],
}

export const isMulti = (type) => type === 'multi_select' || type === 'people' || type === 'relations'
export const isSelectLike = (type) => ['select', 'person', 'relation', 'multi_select', 'people', 'relations'].includes(type)

/** Custom property row → property def. */
export function customToProp(cp) {
  const type = cp.type
  return {
    key: cp.key, label: cp.label, type: type === 'person' ? 'person' : type, custom: true, id: cp.id,
    source: type === 'person' ? 'employees' : undefined,
    options: type === 'select' || type === 'multi_select' ? (cp.options || []) : undefined,
    width: 160,
  }
}

/** Built-in + custom properties for an entity, with label overrides applied. */
export function buildProps(entity, customRows = [], labelOverrides = {}) {
  const overrides = labelOverrides?.[entity] || {}
  const builtin = BUILTIN[entity].map((p) => ({ ...p, label: overrides[p.key] || p.label, defaultLabel: p.label }))
  const custom = customRows
    .filter((c) => c.entity === entity)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => ({ ...customToProp(c), label: overrides[c.key] || c.label }))
  return [...builtin, ...custom]
}

export const titleKey = (entity) => ENTITIES[entity].title

export const defaultColumns = (props) => props.filter((p) => p.dv || p.title).map((p) => p.key)

/** Raw value of a property on a (derived) row. */
export function getValue(row, prop) {
  if (!row) return undefined
  if (prop.custom) return row.custom ? row.custom[prop.key] : undefined
  return row[prop.key]
}

/** Patch to write when `prop` of a record changes. */
export function setPatch(row, prop, value) {
  if (prop.custom) return { custom: { ...(row.custom || {}), [prop.key]: value } }
  return { [prop.key]: value }
}
