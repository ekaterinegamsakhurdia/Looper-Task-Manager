import { useCallback, useEffect, useMemo, useState } from 'react'
import { Lock, Plus, Trash2, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { OPTION_KINDS, CUSTOM_PROPERTY_TYPES } from '../config/optionKinds'
import { ENTITIES } from '../lib/properties'
import { nextColor, PALETTE } from '../lib/color'
import OptionsEditor from '../components/OptionsEditor'
import { ConfirmButton, Modal, SelectField, SortableList } from '../components/ui'

const DATA_TABLES = ['employees', 'clients', 'ad_campaigns', 'briefs', 'tasks', 'config_options', 'workspace_settings']

// ── Option lists (stages, priorities, departments, …) ───────────────────────
function DeleteOptionDialog({ kind, option, others, onClose }) {
  const { rpc, reload, notify } = useData()
  const [usage, setUsage] = useState(null)
  const [moveTo, setMoveTo] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { rpc('option_usage', { p_kind: kind, p_value: option.value }).then(({ data }) => setUsage(Number(data) || 0)) }, [kind, option.value, rpc])

  const confirm = async () => {
    setBusy(true)
    const { error } = await rpc('delete_option', { p_kind: kind, p_value: option.value, p_replacement: moveTo })
    if (!error) { await reload(DATA_TABLES); notify(`Deleted “${option.value}”`); onClose() }
    setBusy(false)
  }
  return (
    <Modal title={`Delete “${option.value}”`} onClose={onClose}>
      {usage === null ? <p className="muted-note">Checking where it is used…</p> : usage === 0
        ? <p>It is not used by any record. It will simply be removed.</p>
        : (
          <>
            <p><strong>{usage}</strong> record{usage === 1 ? ' uses' : 's use'} this option. Where should {usage === 1 ? 'it' : 'they'} go?</p>
            <SelectField options={others.map((o) => ({ value: o.value, label: o.value, color: o.color }))} value={moveTo}
              onChange={setMoveTo} placeholder="Leave empty (no value)" />
          </>)}
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" disabled={busy || usage === null} onClick={confirm}>Delete</button>
      </div>
    </Modal>
  )
}

function OptionsTab() {
  const { getOptions, updateRow, insertRow, rpc, reload, notify, db } = useData()
  const [kind, setKind] = useState(OPTION_KINDS[0].kind)
  const [deleting, setDeleting] = useState(null)
  const def = OPTION_KINDS.find((k) => k.kind === kind)
  const options = getOptions(kind, { includeArchived: true })
  const seeded = db.config_options.length > 0

  const handlers = useMemo(() => ({
    onAdd: async (name) => {
      if (options.some((o) => o.value.toLowerCase() === name.toLowerCase())) return notify(`“${name}” already exists`, 'error')
      await insertRow('config_options', { kind, value: name, color: nextColor(options.map((o) => o.color)), sort_order: options.length })
    },
    onRename: async (opt, name) => {
      if (options.some((o) => o.value.toLowerCase() === name.toLowerCase() && o.id !== opt.id)) return notify(`“${name}” already exists`, 'error')
      const { error } = await rpc('rename_option', { p_kind: kind, p_old: opt.value, p_new: name })
      await reload(DATA_TABLES)
      if (!error) notify(`Renamed to “${name}” everywhere`)
    },
    onColor: (opt, color) => updateRow('config_options', opt.id, { color }),
    onFlag: (opt, flag, on) => updateRow('config_options', opt.id, { meta: { ...(opt.meta || {}), [flag]: on } }),
    onArchive: (opt) => updateRow('config_options', opt.id, { archived: !opt.archived }),
    onDelete: (opt) => setDeleting(opt),
    onReorder: (next) => next.forEach((o, i) => { if (db.config_options.find((r) => r.id === o.id)?.sort_order !== i) updateRow('config_options', o.id, { sort_order: i }) }),
  }), [kind, options, insertRow, updateRow, rpc, reload, notify, db.config_options])

  return (
    <div className="settings-split">
      <nav className="kind-list">
        {OPTION_KINDS.map((k) => (
          <button key={k.kind} className={k.kind === kind ? 'active' : ''} onClick={() => setKind(k.kind)}>
            {k.label}<span className="count-note">{getOptions(k.kind, { includeArchived: true }).length}</span></button>))}
      </nav>
      <div className="settings-panel">
        <h3>{def.label}</h3>
        {def.hint && <p className="muted-note">{def.hint}</p>}
        {!seeded && <div className="notice">The option lists are not in your database yet — run <code>supabase/02_defaults.sql</code> in the SQL Editor first.</div>}
        <OptionsEditor options={options} flags={def.flags || []} handlers={handlers} />
        <p className="muted-note">Renaming changes the value on every record that uses it. Hiding keeps existing records but removes it from dropdowns.</p>
      </div>
      {deleting && <DeleteOptionDialog kind={kind} option={deleting} others={options.filter((o) => o.id !== deleting.id && !o.archived)} onClose={() => setDeleting(null)} />}
    </div>
  )
}

// ── Custom properties ("add a property") ────────────────────────────────────
function CustomPropertyCard({ cp, entityKey, onDelete, dragProps, grip }) {
  const { updateRow, db, notify } = useData()
  const table = ENTITIES[entityKey].table
  const [label, setLabel] = useState(cp.label)
  useEffect(() => setLabel(cp.label), [cp.label])
  const hasOptions = cp.type === 'select' || cp.type === 'multi_select'
  const options = (cp.options || []).map((o) => ({ ...o, id: o.value }))
  const save = (next) => updateRow('custom_properties', cp.id, { options: next.map(({ value, color }) => ({ value, color })) })

  // Rewrites (or clears) a value on every record when an option is renamed / deleted.
  const migrate = (from, to) => {
    for (const r of db[table]) {
      const v = r.custom?.[cp.key]
      if (v === undefined || v === null) continue
      const next = Array.isArray(v) ? v.flatMap((x) => (x === from ? (to ? [to] : []) : [x])) : (v === from ? (to ?? null) : v)
      if (JSON.stringify(next) !== JSON.stringify(v)) updateRow(table, r.id, { custom: { ...r.custom, [cp.key]: next } })
    }
  }
  const handlers = {
    onAdd: (name) => (options.some((o) => o.value.toLowerCase() === name.toLowerCase())
      ? notify(`“${name}” already exists`, 'error') : save([...options, { value: name, color: nextColor(options.map((o) => o.color)) }])),
    onRename: (opt, name) => {
      if (options.some((o) => o.value.toLowerCase() === name.toLowerCase() && o.value !== opt.value)) return notify(`“${name}” already exists`, 'error')
      save(options.map((o) => (o.value === opt.value ? { ...o, value: name } : o))); migrate(opt.value, name)
    },
    onColor: (opt, color) => save(options.map((o) => (o.value === opt.value ? { ...o, color } : o))),
    onFlag: () => {},
    onDelete: (opt) => { save(options.filter((o) => o.value !== opt.value)); migrate(opt.value, null) },
    onReorder: (next) => save(next),
  }
  const typeLabel = CUSTOM_PROPERTY_TYPES.find((t) => t.type === cp.type)?.label || cp.type

  return (
    <div className="prop-card">
      <div className="prop-card-head">
        <span className="opt-grip" title="Drag to reorder" {...dragProps}>{grip}</span>
        <input className="form-input slim" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Property name"
          onBlur={() => label.trim() && label.trim() !== cp.label && updateRow('custom_properties', cp.id, { label: label.trim() })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
        <span className="chip">{typeLabel}</span>
        <ConfirmButton className="btn btn-ghost danger-text" label="Delete" confirmLabel="Delete property?" icon={<Trash2 size={13} />}
          onConfirm={onDelete} />
      </div>
      {hasOptions && <OptionsEditor options={options} handlers={handlers} />}
    </div>
  )
}

function PropertiesTab() {
  const { db, props, insertRow, updateRow, deleteRow, setSetting, settings, notify } = useData()
  const [entity, setEntity] = useState('tasks')
  const [name, setName] = useState('')
  const [type, setType] = useState('text')
  const customs = db.custom_properties.filter((c) => c.entity === entity).sort((a, b) => a.sort_order - b.sort_order)
  const builtin = props[entity].filter((p) => !p.custom)
  const labels = settings.property_labels || {}

  const add = async () => {
    const label = name.trim()
    if (!label) return
    const key = `cf_${Math.random().toString(36).slice(2, 8)}`
    const { error } = await insertRow('custom_properties', { entity, key, label, type, options: [], sort_order: customs.length })
    if (!error) { setName(''); notify(`Property “${label}” added — find it in the Properties menu of any view`) }
  }
  const rename = (p, label) => {
    const next = { ...labels, [entity]: { ...(labels[entity] || {}) } }
    if (label && label !== p.defaultLabel) next[entity][p.key] = label; else delete next[entity][p.key]
    setSetting('property_labels', next)
  }

  return (
    <div className="settings-panel wide">
      <div className="seg">{Object.entries(ENTITIES).map(([k, d]) => (
        <button key={k} className={entity === k ? 'on' : ''} onClick={() => setEntity(k)}>{d.label}</button>))}</div>

      <h3>Custom properties</h3>
      <p className="muted-note">Extra fields on every {ENTITIES[entity].singular}. They show up in the drawer, in filters, sorting, grouping and in each view's Properties menu.</p>
      <SortableList items={customs} getKey={(c) => c.id}
        onReorder={(next) => next.forEach((c, i) => { if (c.sort_order !== i) updateRow('custom_properties', c.id, { sort_order: i }) })}
        renderItem={(cp, _i, dragProps, grip) => (
          <CustomPropertyCard cp={cp} entityKey={entity} dragProps={dragProps} grip={grip}
            onDelete={() => deleteRow('custom_properties', cp.id)} />)} />
      {customs.length === 0 && <div className="muted-note">No custom properties yet.</div>}
      <div className="opt-add">
        <input className="form-input slim" placeholder="New property name…" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <select className="mini-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Property type">
          {CUSTOM_PROPERTY_TYPES.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={add} disabled={!name.trim()}><Plus size={14} /> Add property</button>
      </div>

      <h3>Built-in property names</h3>
      <p className="muted-note">Rename how a built-in property is labelled everywhere (e.g. “Stage” → “Status”). Clear the box to restore the original.</p>
      <div className="label-grid">
        {builtin.map((p) => <LabelRow key={p.key} prop={p} onCommit={(l) => rename(p, l)} />)}
      </div>
    </div>
  )
}

function LabelRow({ prop, onCommit }) {
  const [v, setV] = useState(prop.label)
  useEffect(() => setV(prop.label), [prop.label])
  return (
    <label className="label-row"><span className="muted-note">{prop.defaultLabel}</span>
      <input className="form-input slim" value={v} onChange={(e) => setV(e.target.value)}
        onBlur={() => { const t = v.trim(); if (t !== prop.label) onCommit(t === prop.defaultLabel ? '' : t) }}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
    </label>
  )
}

// ── Workspace (branding, thresholds, developer accounts) ────────────────────
function Field({ label, children, hint }) {
  return <div className="field"><label>{label}</label>{children}{hint && <div className="muted-note">{hint}</div>}</div>
}
function TextSetting({ name, settingKey, maxLength, type = 'text' }) {
  const { settings, setSetting } = useData()
  const cur = settings[settingKey]
  const [v, setV] = useState(cur)
  useEffect(() => setV(cur), [cur])
  const commit = () => {
    const out = type === 'number' ? Math.max(1, Number(v) || 1) : v.trim()
    if (out !== cur && out !== '') setSetting(settingKey, out); else setV(cur)
  }
  return <input className="form-input slim" aria-label={name} type={type} maxLength={maxLength} value={v} onChange={(e) => setV(e.target.value)}
    onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
}

function AdminsCard() {
  const { email } = useAuth()
  const { notify } = useData()
  const [admins, setAdmins] = useState([])
  const [input, setInput] = useState('')
  const load = useCallback(() => supabase.from('app_admins').select('*').order('created_at').then(({ data }) => setAdmins(data || [])), [])
  useEffect(() => { load() }, [load])
  const add = async () => {
    const e = input.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(e)) return notify('Enter a valid email', 'error')
    const { error } = await supabase.from('app_admins').insert({ email: e })
    if (error) return notify(error.message, 'error')
    setInput(''); load()
  }
  const remove = async (e) => { const { error } = await supabase.from('app_admins').delete().eq('email', e); if (error) notify(error.message, 'error'); load() }
  return (
    <div className="card">
      <h3>Developer accounts</h3>
      <p className="muted-note">These emails get the full customization kit after they sign in (the account must exist in Supabase → Authentication).</p>
      {admins.map((a) => (
        <div className="admin-row" key={a.email}>
          <span className="grow">{a.email}{a.email.toLowerCase() === (email || '').toLowerCase() && <span className="chip">you</span>}</span>
          {a.email.toLowerCase() !== (email || '').toLowerCase() && <ConfirmButton className="btn btn-ghost danger-text" label="Remove" confirmLabel="Confirm remove" onConfirm={() => remove(a.email)} />}
        </div>))}
      <div className="opt-add">
        <input className="form-input slim" placeholder="name@company.com" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className="btn btn-ghost" onClick={add}><UserPlus size={14} /> Add developer</button>
      </div>
    </div>
  )
}

function WorkspaceTab() {
  const { settings, setSetting, getOptions } = useData()
  const stages = getOptions('stage')
  return (
    <div className="settings-panel wide">
      <div className="card">
        <h3>Branding</h3>
        <div className="field-grid">
          <Field label="App name"><TextSetting name="App name" settingKey="app_name" /></Field>
          <Field label="Organisation"><TextSetting name="Organisation" settingKey="org_name" /></Field>
          <Field label="Logo letters"><TextSetting name="Logo letters" settingKey="logo_text" maxLength={3} /></Field>
        </div>
        <Field label="Accent colour" hint="Buttons, selected tabs and highlights.">
          <div className="accent-row">
            {PALETTE.filter((c) => c !== '#6B7280' && c !== '#94A3B8').map((c) => (
              <button key={c} className={`swatch${settings.accent.toLowerCase() === c.toLowerCase() ? ' sel' : ''}`} style={{ background: c }}
                aria-label={`Accent ${c}`} onClick={() => setSetting('accent', c)} />))}
            <input type="color" value={settings.accent} onChange={(e) => setSetting('accent', e.target.value)} aria-label="Custom accent colour" />
          </div>
        </Field>
      </div>

      <div className="card">
        <h3>Behaviour</h3>
        <div className="field-grid">
          <Field label="Report due after (days)" hint="Ad campaigns without a report for this long show “Report due”."><TextSetting name="Report due days" settingKey="report_due_days" type="number" /></Field>
          <Field label="Bounce moves task to" hint="Stage a task jumps to when an AM bounces it.">
            <SelectField options={stages.map((s) => ({ value: s.value, label: s.value, color: s.color }))} value={settings.bounce_stage}
              onChange={(v) => setSetting('bounce_stage', v)} placeholder="Don't change the stage" />
          </Field>
        </div>
      </div>

      <AdminsCard />
    </div>
  )
}

export default function SettingsPage({ onSignIn }) {
  const { isDeveloper } = useAuth()
  const [tab, setTab] = useState('options')
  if (!isDeveloper) {
    return (
      <div className="center-card"><Lock size={28} />
        <h2>Developer only</h2>
        <p className="muted-note">Customize is available to the developer account.</p>
        <button className="btn btn-primary" onClick={onSignIn}>Developer sign-in</button>
      </div>)
  }
  return (
    <div className="settings">
      <div className="page-header"><div>
        <div className="page-title">Customize</div>
        <div className="page-subtitle">Everything here changes the app for everyone, instantly.</div>
      </div></div>
      <div className="tab-bar">
        {[['options', 'Options & colours'], ['properties', 'Properties'], ['workspace', 'Workspace']].map(([k, l]) => (
          <button key={k} className={`tab-btn${tab === k ? ' active' : ''}`} onClick={() => setTab(k)}>{l}</button>))}
      </div>
      {tab === 'options' && <OptionsTab />}
      {tab === 'properties' && <PropertiesTab />}
      {tab === 'workspace' && <WorkspaceTab />}
    </div>
  )
}
