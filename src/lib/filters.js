// Notion-style filtering, sorting and grouping — pure functions, no React.
//
// filter group:  { op: 'and' | 'or', rules: [ rule | { group: filterGroup } ] }
// rule:          { prop: 'stage', op: 'is', value: 'Editing' }
// "__me__" as a value means "the person selected in Viewing as / signed in".
//
// ctx = { propMap, meId, today?, optionsFor(prop, {includeArchived}), labelFor(prop, value) }
import { getValue, isMulti } from './properties.js'

export const OPS = {
  text: [['contains', 'contains'], ['not_contains', 'does not contain'], ['is', 'is'], ['is_not', 'is not'],
         ['starts_with', 'starts with'], ['is_empty', 'is empty'], ['not_empty', 'is not empty']],
  number: [['eq', '='], ['neq', '≠'], ['gt', '>'], ['gte', '≥'], ['lt', '<'], ['lte', '≤'],
           ['is_empty', 'is empty'], ['not_empty', 'is not empty']],
  select: [['is', 'is'], ['is_not', 'is not'], ['any_of', 'is any of'], ['none_of', 'is none of'],
           ['is_empty', 'is empty'], ['not_empty', 'is not empty']],
  multi: [['contains', 'contains'], ['not_contains', 'does not contain'], ['contains_any', 'contains any of'],
          ['is_empty', 'is empty'], ['not_empty', 'is not empty']],
  date: [['is', 'is'], ['before', 'is before'], ['after', 'is after'], ['on_or_before', 'is on or before'],
         ['on_or_after', 'is on or after'], ['overdue', 'is overdue (before today)'],
         ['next_days', 'is within the next … days'], ['past_days', 'is within the past … days'],
         ['is_empty', 'is empty'], ['not_empty', 'is not empty']],
  checkbox: [['checked', 'is checked'], ['unchecked', 'is unchecked']],
}

export const NO_VALUE_OPS = new Set(['is_empty', 'not_empty', 'checked', 'unchecked', 'overdue'])
export const ARRAY_VALUE_OPS = new Set(['any_of', 'none_of', 'contains_any'])
export const NUMBER_DATE_OPS = new Set(['next_days', 'past_days'])

export function opFamily(type) {
  if (type === 'text') return 'text'
  if (type === 'number') return 'number'
  if (type === 'date') return 'date'
  if (type === 'checkbox') return 'checkbox'
  return isMulti(type) ? 'multi' : 'select'
}
export const opsFor = (type) => OPS[opFamily(type)]
export const defaultOp = (type) => opsFor(type)[0][0]

const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)
const same = (a, b) => String(a) === String(b)
const dstr = (v) => (v ? String(v).slice(0, 10) : null)
const pad = (n) => String(n).padStart(2, '0')
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const localToday = () => fmt(new Date())
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return fmt(d)
}
export function daysBetween(fromStr, toStr) {
  const day = (x) => new Date(String(x).slice(0, 10) + 'T00:00:00')
  return Math.round((day(toStr) - day(fromStr)) / 86400000)
}

const resolve = (value, ctx) => {
  const me = ctx.meId || '__nobody__'
  if (Array.isArray(value)) return value.map((v) => (v === '__me__' ? me : v))
  return value === '__me__' ? me : value
}

export function ruleIsActive(rule, ctx) {
  const prop = ctx.propMap[rule.prop]
  if (!prop) return false
  if (NO_VALUE_OPS.has(rule.op)) return true
  const v = rule.value
  return !(v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0))
}

export function evalRule(row, rule, ctx) {
  const prop = ctx.propMap[rule.prop]
  if (!prop) return true
  const v = getValue(row, prop)
  const op = rule.op
  if (op === 'is_empty') return isEmpty(v)
  if (op === 'not_empty') return !isEmpty(v)
  const rv = resolve(rule.value, ctx)
  const today = ctx.today || localToday()

  switch (opFamily(prop.type)) {
    case 'text': {
      const a = String(v ?? '').toLowerCase(), b = String(rv ?? '').toLowerCase()
      if (op === 'contains') return a.includes(b)
      if (op === 'not_contains') return !a.includes(b)
      if (op === 'is') return a === b
      if (op === 'is_not') return a !== b
      if (op === 'starts_with') return a.startsWith(b)
      return true
    }
    case 'number': {
      if (isEmpty(v)) return op === 'neq'
      const a = Number(v), b = Number(rv)
      return { eq: a === b, neq: a !== b, gt: a > b, gte: a >= b, lt: a < b, lte: a <= b }[op] ?? true
    }
    case 'select': {
      if (op === 'is') return !isEmpty(v) && same(v, rv)
      if (op === 'is_not') return isEmpty(v) || !same(v, rv)
      const list = Array.isArray(rv) ? rv : [rv]
      if (op === 'any_of') return !isEmpty(v) && list.some((x) => same(x, v))
      if (op === 'none_of') return isEmpty(v) || !list.some((x) => same(x, v))
      return true
    }
    case 'multi': {
      const arr = Array.isArray(v) ? v : []
      if (op === 'contains') return arr.some((x) => same(x, rv))
      if (op === 'not_contains') return !arr.some((x) => same(x, rv))
      const list = Array.isArray(rv) ? rv : [rv]
      if (op === 'contains_any') return list.some((x) => arr.some((y) => same(x, y)))
      return true
    }
    case 'date': {
      const d = dstr(v)
      if (!d) return false
      const r = dstr(rv)
      switch (op) {
        case 'is': return d === r
        case 'before': return d < r
        case 'after': return d > r
        case 'on_or_before': return d <= r
        case 'on_or_after': return d >= r
        case 'overdue': return d < today
        case 'next_days': return d >= today && d <= addDays(today, Number(rv) || 0)
        case 'past_days': return d <= today && d >= addDays(today, -(Number(rv) || 0))
        default: return true
      }
    }
    case 'checkbox':
      return op === 'checked' ? !!v : !v
    default:
      return true
  }
}

export function evalGroup(row, group, ctx) {
  const rules = (group?.rules || []).filter((r) => (r.group ? true : ruleIsActive(r, ctx)))
  if (!rules.length) return true
  const test = (r) => (r.group ? evalGroup(row, r.group, ctx) : evalRule(row, r, ctx))
  return group.op === 'or' ? rules.some(test) : rules.every(test)
}

export const countRules = (group) =>
  (group?.rules || []).reduce((n, r) => n + (r.group ? countRules(r.group) : 1), 0)

// ── Sorting ─────────────────────────────────────────────────────────────────
function sortKey(prop, value, ctx, orderCache) {
  const t = prop.type
  if (t === 'number') return Number(value)
  if (t === 'date') return dstr(value)
  if (t === 'checkbox') return value ? 1 : 0
  if (t === 'text') return String(value).toLowerCase()
  const first = Array.isArray(value) ? value[0] : value
  if (prop.kind || prop.options) {
    if (!orderCache.has(prop.key)) {
      const m = new Map()
      ctx.optionsFor(prop, { includeArchived: true }).forEach((o, i) => m.set(String(o.value), i))
      orderCache.set(prop.key, m)
    }
    const idx = orderCache.get(prop.key).get(String(first))
    return idx === undefined ? 9999 : idx
  }
  return String(ctx.labelFor(prop, first)).toLowerCase()
}

export function sortRows(rows, sorts, ctx) {
  const active = (sorts || []).filter((s) => ctx.propMap[s.prop])
  if (!active.length) return rows
  const orderCache = new Map()
  const keys = active.map((s) => ({ prop: ctx.propMap[s.prop], dir: s.dir === 'desc' ? -1 : 1 }))
  return [...rows].sort((a, b) => {
    for (const { prop, dir } of keys) {
      const va = getValue(a, prop), vb = getValue(b, prop)
      const ea = isEmpty(va), eb = isEmpty(vb)
      if (ea && eb) continue
      if (ea) return 1           // empty values always last
      if (eb) return -1
      const ka = sortKey(prop, va, ctx, orderCache), kb = sortKey(prop, vb, ctx, orderCache)
      if (ka < kb) return -1 * dir
      if (ka > kb) return 1 * dir
    }
    return 0
  })
}

// ── Grouping ────────────────────────────────────────────────────────────────
export const EMPTY_GROUP = '__empty__'

/** → [{ key, label, color, meta, rows, empty? }] */
export function groupRows(rows, prop, ctx, { showEmpty = false } = {}) {
  const opts = ctx.optionsFor(prop, { includeArchived: true })
  const buckets = new Map()
  const none = []
  for (const row of rows) {
    const v = getValue(row, prop)
    if (isEmpty(v)) { none.push(row); continue }
    for (const x of Array.isArray(v) ? v : [v]) {
      const k = String(x)
      if (!buckets.has(k)) buckets.set(k, [])
      buckets.get(k).push(row)
    }
  }
  const groups = []
  const used = new Set()
  const ordered = !!(prop.kind || prop.options)
  if (ordered) {
    for (const o of opts) {
      const k = String(o.value)
      if (buckets.has(k) || showEmpty) {
        groups.push({ key: o.value, label: o.label, color: o.color, meta: o.meta, rows: buckets.get(k) || [] })
        used.add(k)
      }
    }
  }
  const rest = [...buckets.entries()].filter(([k]) => !used.has(k))
    .map(([k, rs]) => {
      const o = opts.find((x) => String(x.value) === k)
      return { key: o ? o.value : k, label: o ? o.label : ctx.labelFor(prop, k), color: o?.color || null, meta: o?.meta, rows: rs }
    })
  if (!ordered) rest.sort((a, b) => String(a.label).localeCompare(String(b.label)))
  groups.push(...rest)
  if (none.length) groups.push({ key: EMPTY_GROUP, label: `No ${prop.label}`, rows: none, empty: true })
  return groups
}

// ── Whole pipeline ──────────────────────────────────────────────────────────
export function applyView(rows, config, ctx, search = '') {
  let out = rows
  if (config.filter && countRules(config.filter)) out = out.filter((r) => evalGroup(r, config.filter, ctx))
  const q = search.trim().toLowerCase()
  if (q) out = out.filter((r) => (r._search || '').includes(q))
  return sortRows(out, config.sort, ctx)
}
