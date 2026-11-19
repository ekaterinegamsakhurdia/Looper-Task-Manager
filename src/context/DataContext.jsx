import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BRAND } from '../config/brand'
import { buildProps } from '../lib/properties'
import { daysBetween, localToday } from '../lib/filters'
import { useAuth } from './AuthContext'

// Everything is loaded once (paged, 1000 rows per request) and kept in memory, so
// Notion-style filters / sorts / groups run instantly in the browser. Realtime
// keeps every browser in sync.
const TABLES = ['employees', 'clients', 'ad_campaigns', 'briefs', 'tasks',
  'config_options', 'saved_views', 'custom_properties', 'workspace_settings']
const PK = (t) => (t === 'workspace_settings' ? 'key' : 'id')
const ORDER = (t) => (t === 'workspace_settings' ? ['key'] : ['created_at', 'id'])
const PAGE = 1000

async function fetchAll(table) {
  const out = []
  for (let from = 0; ; from += PAGE) {
    let q = supabase.from(table).select('*')
    for (const col of ORDER(table)) q = q.order(col, { ascending: true })
    const { data, error } = await q.range(from, from + PAGE - 1)
    if (error) throw error
    out.push(...data)
    if (data.length < PAGE) break
  }
  return out
}

const friendly = (error) =>
  /row-level security|permission denied/i.test(error?.message || '')
    ? 'Only the developer account can change this.' : (error?.message || 'Something went wrong')

const DataCtx = createContext(null)
export const useData = () => useContext(DataCtx)


export function DataProvider({ children }) {
  const { session, isDeveloper } = useAuth()
  const [db, setDb] = useState(() => Object.fromEntries(TABLES.map((t) => [t, []])))
  const [status, setStatus] = useState({ loading: true, error: null })
  const [toasts, setToasts] = useState([])
  const [viewingAs, setViewingAsState] = useState(() => {
    try { return localStorage.getItem(`${BRAND.slug}:viewing-as`) || undefined } catch { return undefined }
  })

  const notify = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 6000 : 2400)
  }, [])

  const loadTable = useCallback(async (t) => {
    const rows = await fetchAll(t)
    setDb((d) => ({ ...d, [t]: rows }))
  }, [])
  const reload = useCallback((tables = TABLES) => Promise.all(tables.map(loadTable)), [loadTable])

  useEffect(() => {
    reload().then(() => setStatus({ loading: false, error: null }))
      .catch((e) => setStatus({ loading: false, error: e.message || String(e) }))
  }, [reload])

  // Realtime: apply row-level changes from any browser.
  useEffect(() => {
    const ch = supabase.channel('looper-db')
    TABLES.forEach((t) => ch.on('postgres_changes', { event: '*', schema: 'public', table: t }, (p) => {
      const pk = PK(t)
      setDb((d) => {
        const rows = d[t]
        if (p.eventType === 'INSERT') return rows.some((r) => r[pk] === p.new[pk]) ? d : { ...d, [t]: [...rows, p.new] }
        if (p.eventType === 'UPDATE') return { ...d, [t]: rows.map((r) => (r[pk] === p.new[pk] ? { ...r, ...p.new } : r)) }
        if (p.eventType === 'DELETE') return { ...d, [t]: rows.filter((r) => r[pk] !== p.old[pk]) }
        return d
      })
    }))
    ch.subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  // ── Mutations (optimistic, rolled back by reloading the table on error) ───
  const updateRow = useCallback(async (table, id, patch) => {
    const pk = PK(table)
    setDb((d) => ({ ...d, [table]: d[table].map((r) => (r[pk] === id ? { ...r, ...patch } : r)) }))
    const { data, error } = await supabase.from(table).update(patch).eq(pk, id).select(pk)
    if (error || !data || data.length === 0) {
      notify(error ? friendly(error) : 'Only the developer account can change this.', 'error')
      loadTable(table)
      return { error: error || new Error('not allowed') }
    }
    return {}
  }, [notify, loadTable])

  const insertRow = useCallback(async (table, row) => {
    const { data, error } = await supabase.from(table).insert(row).select().single()
    if (error) { notify(friendly(error), 'error'); return { error } }
    const pk = PK(table)
    setDb((d) => (d[table].some((r) => r[pk] === data[pk]) ? d : { ...d, [table]: [...d[table], data] }))
    return { data }
  }, [notify])

  const deleteRow = useCallback(async (table, id) => {
    const pk = PK(table)
    setDb((d) => ({ ...d, [table]: d[table].filter((r) => r[pk] !== id) }))
    const { error } = await supabase.from(table).delete().eq(pk, id)
    if (error) { notify(friendly(error), 'error'); loadTable(table); return { error } }
    return {}
  }, [notify, loadTable])

  const setSetting = useCallback(async (key, value) => {
    setDb((d) => {
      const has = d.workspace_settings.some((r) => r.key === key)
      return { ...d, workspace_settings: has
        ? d.workspace_settings.map((r) => (r.key === key ? { ...r, value } : r))
        : [...d.workspace_settings, { key, value }] }
    })
    const { error } = await supabase.from('workspace_settings').upsert({ key, value })
    if (error) { notify(friendly(error), 'error'); loadTable('workspace_settings') }
    return { error }
  }, [notify, loadTable])

  const rpc = useCallback(async (fn, args) => {
    const { data, error } = await supabase.rpc(fn, args)
    if (error) notify(friendly(error), 'error')
    return { data, error }
  }, [notify])

  // ── Settings / options ────────────────────────────────────────────────────
  const settings = useMemo(() => {
    const m = Object.fromEntries(db.workspace_settings.map((r) => [r.key, r.value]))
    return {
      app_name: m.app_name ?? BRAND.appName,
      org_name: m.org_name ?? BRAND.orgName,
      logo_text: m.logo_text ?? BRAND.logoText,
      accent: m.accent ?? BRAND.accent,
      report_due_days: Number(m.report_due_days ?? BRAND.reportDueDays),
      bounce_stage: 'bounce_stage' in m ? m.bounce_stage : BRAND.bounceStage,
      property_labels: m.property_labels ?? {},
    }
  }, [db.workspace_settings])

  const optionsByKind = useMemo(() => {
    const out = {}
    for (const r of db.config_options) (out[r.kind] ||= []).push(r)
    for (const k of Object.keys(out)) out[k].sort((a, b) => a.sort_order - b.sort_order)
    return out
  }, [db.config_options])

  const getOptions = useCallback((kind, { includeArchived = false } = {}) => {
    let list = optionsByKind[kind]
    if (!list && db.config_options.length === 0) { // database not seeded yet → brand.js defaults
      list = (BRAND.options[kind] || []).map((o, i) => ({ id: `default-${kind}-${i}`, kind, value: o.value, color: o.color, sort_order: i, archived: false, meta: o.meta || {} }))
    }
    list = list || []
    return (includeArchived ? list : list.filter((o) => !o.archived)).map((o) => ({
      id: o.id, value: o.value, label: o.value, color: o.color, meta: o.meta || {}, archived: o.archived,
    }))
  }, [optionsByKind, db.config_options.length])

  const optionMeta = useCallback((kind, value) =>
    getOptions(kind, { includeArchived: true }).find((o) => o.value === value) || null, [getOptions])

  // ── Lookup maps ───────────────────────────────────────────────────────────
  const maps = useMemo(() => {
    const by = (rows, label) => new Map(rows.map((r) => [String(r.id), r[label] || 'Untitled']))
    return {
      employees: by(db.employees, 'full_name'), clients: by(db.clients, 'name'), briefs: by(db.briefs, 'title'),
      campaigns: by(db.ad_campaigns, 'name'), tasks: by(db.tasks, 'title'),
    }
  }, [db.employees, db.clients, db.briefs, db.ad_campaigns, db.tasks])

  const sourceOptions = useMemo(() => {
    const mk = (rows, label) => rows.map((r) => ({ value: r.id, label: r[label] || 'Untitled' }))
      .sort((a, b) => String(a.label).localeCompare(String(b.label)))
    return { employees: mk(db.employees, 'full_name'), clients: mk(db.clients, 'name'), briefs: mk(db.briefs, 'title'),
      campaigns: mk(db.ad_campaigns, 'name'), tasks: mk(db.tasks, 'title') }
  }, [db.employees, db.clients, db.briefs, db.ad_campaigns, db.tasks])

  const optionsFor = useCallback((prop, { includeArchived = false } = {}) => {
    if (prop.options) return prop.options.map((o) => ({ value: o.value, label: o.label || o.value, color: o.color || null }))
    if (prop.kind) return getOptions(prop.kind, { includeArchived })
    if (prop.source) return sourceOptions[prop.source] || []
    return []
  }, [getOptions, sourceOptions])

  const labelFor = useCallback((prop, value) => {
    if (value === null || value === undefined || value === '') return ''
    if (prop.source) return maps[prop.source]?.get(String(value)) ?? '(deleted)'
    return String(value)
  }, [maps])

  // ── Derived rows (joins computed client-side) ─────────────────────────────
  const today = localToday()
  const props = useMemo(() => Object.fromEntries(
    ['tasks', 'briefs', 'clients', 'campaigns'].map((e) => [e, buildProps(e, db.custom_properties, settings.property_labels)])
  ), [db.custom_properties, settings.property_labels])

  const rows = useMemo(() => {
    const stageMeta = new Map(getOptions('stage', { includeArchived: true }).map((o) => [o.value, o.meta]))
    const campMeta = new Map(getOptions('campaign_status', { includeArchived: true }).map((o) => [o.value, o.meta]))
    const lower = (...xs) => xs.filter(Boolean).join(' ').toLowerCase()
    const briefById = new Map(db.briefs.map((b) => [b.id, b]))

    const tasksByBrief = new Map(), tasksByCampaign = new Map()
    for (const t of db.tasks) {
      if (t.brief_id) (tasksByBrief.get(t.brief_id) || tasksByBrief.set(t.brief_id, []).get(t.brief_id)).push(t.id)
      if (t.campaign_id != null) (tasksByCampaign.get(t.campaign_id) || tasksByCampaign.set(t.campaign_id, []).get(t.campaign_id)).push(t.id)
    }
    const briefsByClient = new Map(), campaignsByClient = new Map(), briefsByCampaign = new Map()
    for (const b of db.briefs) {
      (briefsByClient.get(b.client_id) || briefsByClient.set(b.client_id, []).get(b.client_id)).push(b.id)
      if (b.campaign_id != null) (briefsByCampaign.get(b.campaign_id) || briefsByCampaign.set(b.campaign_id, []).get(b.campaign_id)).push(b.id)
    }
    for (const c of db.ad_campaigns) (campaignsByClient.get(c.client_id) || campaignsByClient.set(c.client_id, []).get(c.client_id)).push(c.id)

    const tasks = db.tasks.map((t) => ({
      ...t,
      am_id: briefById.get(t.brief_id)?.am_owner_id ?? null,
      _complete: !!stageMeta.get(t.stage)?.complete,
      _search: lower(t.title, maps.clients.get(String(t.client_id)), maps.briefs.get(String(t.brief_id)),
        maps.campaigns.get(String(t.campaign_id)), ...(t.assigned_to || []).map((id) => maps.employees.get(String(id)))),
    }))
    const clients = db.clients.map((c) => ({
      ...c, briefs: briefsByClient.get(c.id) || [], campaigns: campaignsByClient.get(c.id) || [],
      _search: lower(c.name, c.industry, c.tier),
    }))
    const briefs = db.briefs.map((b) => {
      const ids = tasksByBrief.get(b.id) || []
      const actual = ids.length, committed = b.committed_task_count || 0
      return { ...b, tasks: ids, actual_task_count: actual,
        count_check: actual === committed ? '✓ Match' : actual < committed ? 'Missing tasks' : 'Extra tasks',
        _search: lower(b.title, maps.clients.get(String(b.client_id)), maps.campaigns.get(String(b.campaign_id))) }
    })
    const campaigns = db.ad_campaigns.map((c) => {
      const complete = !!campMeta.get(c.status)?.complete
      let report_state = 'New'
      if (complete) report_state = 'Closed'
      else if (c.last_reported) report_state = daysBetween(c.last_reported, today) >= settings.report_due_days ? 'Report due' : 'Reported'
      else if (c.start_date && daysBetween(c.start_date, today) >= settings.report_due_days) report_state = 'Report due'
      return { ...c, tasks: tasksByCampaign.get(c.id) || [], briefs: briefsByCampaign.get(c.id) || [], report_state, _complete: complete,
        _search: lower(c.name, maps.clients.get(String(c.client_id))) }
    })
    return { tasks, clients, briefs, campaigns }
  }, [db, maps, getOptions, settings.report_due_days, today])

  // ── "Viewing as" (no logins yet) ──────────────────────────────────────────
  const sessionEmployee = useMemo(() => {
    const mail = session?.user?.email?.toLowerCase()
    return mail ? db.employees.find((e) => e.email.toLowerCase() === mail) : null
  }, [session, db.employees])
  const meId = viewingAs === 'none' ? null : (viewingAs && db.employees.some((e) => e.id === viewingAs) ? viewingAs : sessionEmployee?.id ?? null)
  const me = db.employees.find((e) => e.id === meId) || null
  const setViewingAs = useCallback((id) => {
    setViewingAsState(id || 'none')
    try { localStorage.setItem(`${BRAND.slug}:viewing-as`, id || 'none') } catch { /* ignore */ }
  }, [])

  const value = useMemo(() => ({
    db, status, toasts, notify, reload, updateRow, insertRow, deleteRow, setSetting, rpc,
    settings, getOptions, optionMeta, optionsFor, labelFor, props, rows, maps,
    employees: db.employees, me, meId, setViewingAs, isDeveloper,
    views: db.saved_views, today,
  }), [db, status, toasts, notify, reload, updateRow, insertRow, deleteRow, setSetting, rpc,
    settings, getOptions, optionMeta, optionsFor, labelFor, props, rows, maps, me, meId, setViewingAs, isDeveloper, today])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

