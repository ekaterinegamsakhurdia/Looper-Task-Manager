// Registry of every editable option list. `flags` are per-option switches the
// developer can toggle in Customize → Options.
export const OPTION_KINDS = [
  { kind: 'stage',           label: 'Task stages',          hint: 'Columns of the task board. Order here = order on the board.', flags: ['complete', 'dim'] },
  { kind: 'priority',        label: 'Priorities',           hint: 'Task priority levels.' },
  { kind: 'department',      label: 'Departments',          hint: 'Used on tasks and employees.' },
  { kind: 'task_type',       label: 'Task types',           hint: 'Video, Reel, Post/Design…' },
  { kind: 'brief_status',    label: 'Brief statuses',       hint: 'Where a brief currently sits.', flags: ['complete'] },
  { kind: 'brief_type',      label: 'Brief types',          hint: '' },
  { kind: 'client_status',   label: 'Client statuses',      hint: '' },
  { kind: 'client_tier',     label: 'Client tiers',         hint: '' },
  { kind: 'industry',        label: 'Industries',           hint: '' },
  { kind: 'platform',        label: 'Platforms',            hint: 'Multi-select on clients.' },
  { kind: 'campaign_status', label: 'Ad campaign statuses', hint: 'Ad Ops statuses. "Complete" excludes a campaign from report reminders.', flags: ['complete'] },
]

export const FLAG_LABELS = {
  complete: 'Counts as finished',
  dim: 'Dimmed',
}

export const CUSTOM_PROPERTY_TYPES = [
  { type: 'text',         label: 'Text' },
  { type: 'number',       label: 'Number' },
  { type: 'select',       label: 'Select' },
  { type: 'multi_select', label: 'Multi-select' },
  { type: 'date',         label: 'Date' },
  { type: 'checkbox',     label: 'Checkbox' },
  { type: 'person',       label: 'Person' },
]
