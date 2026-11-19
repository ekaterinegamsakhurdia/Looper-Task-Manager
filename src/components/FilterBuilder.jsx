import { Plus, X } from 'lucide-react'
import { ARRAY_VALUE_OPS, NO_VALUE_OPS, NUMBER_DATE_OPS, defaultOp, opFamily, opsFor } from '../lib/filters'
import { SelectProp } from './Property'

function FilterValue({ rule, prop, onChange }) {
  if (NO_VALUE_OPS.has(rule.op)) return <span className="fvalue muted-note">no value needed</span>
  const fam = opFamily(prop.type)
  if (fam === 'select' || fam === 'multi') {
    return (
      <span className="fvalue">
        <SelectProp prop={prop} allowMe multi={ARRAY_VALUE_OPS.has(rule.op)} value={rule.value ?? (ARRAY_VALUE_OPS.has(rule.op) ? [] : null)}
          onChange={onChange} placeholder="Choose…" />
      </span>)
  }
  if (fam === 'date' && !NUMBER_DATE_OPS.has(rule.op)) {
    return <input type="date" className="form-input slim fvalue" value={rule.value || ''} onChange={(e) => onChange(e.target.value || null)} />
  }
  const numeric = fam === 'number' || NUMBER_DATE_OPS.has(rule.op)
  return <input type={numeric ? 'number' : 'text'} className="form-input slim fvalue" placeholder="Value…"
    value={rule.value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)} />
}

/** Recursive AND/OR filter editor (Notion's "advanced filter"). */
export function FilterGroupEditor({ group, onChange, props, depth = 0, onRemove }) {
  const rules = group.rules || []
  const propMap = Object.fromEntries(props.map((p) => [p.key, p]))
  const setRules = (r) => onChange({ ...group, rules: r })
  const update = (i, patch) => setRules(rules.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const removeAt = (i) => setRules(rules.filter((_, j) => j !== i))

  const addRule = () => {
    const p = props.find((x) => !x.title) || props[0]
    setRules([...rules, { prop: p.key, op: defaultOp(p.type), value: null }])
  }
  const changeProp = (i, key) => { const p = propMap[key]; setRules(rules.map((r, j) => (j === i ? { prop: key, op: defaultOp(p.type), value: null } : r))) }
  const changeOp = (i, op) => {
    const cur = rules[i]
    let value = cur.value
    if (NO_VALUE_OPS.has(op)) value = undefined
    else if (ARRAY_VALUE_OPS.has(op)) value = Array.isArray(value) ? value : (value ? [value] : [])
    else if (Array.isArray(value)) value = value[0] ?? null
    update(i, { op, value })
  }
  const join = (i) => (i === 0 ? <span className="fjoin">Where</span>
    : i === 1 ? (
      <select className="mini-select fjoin" value={group.op} onChange={(e) => onChange({ ...group, op: e.target.value })}>
        <option value="and">And</option><option value="or">Or</option>
      </select>)
    : <span className="fjoin">{group.op === 'or' ? 'Or' : 'And'}</span>)

  return (
    <div className={`fgroup depth-${depth}`}>
      {rules.length === 0 && depth === 0 && <div className="menu-empty">No filters yet — everything is shown.</div>}
      {rules.map((r, i) => {
        if (r.group) {
          return (
            <div className="frow" key={i}>
              {join(i)}
              <div className="fnested">
                <FilterGroupEditor group={r.group} props={props} depth={depth + 1}
                  onChange={(g) => update(i, { group: g })} onRemove={() => removeAt(i)} />
              </div>
            </div>)
        }
        const prop = propMap[r.prop]
        if (!prop) return null
        return (
          <div className="frow" key={i}>
            {join(i)}
            <select className="mini-select fprop" value={r.prop} onChange={(e) => changeProp(i, e.target.value)}>
              {props.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
            </select>
            <select className="mini-select fop" value={r.op} onChange={(e) => changeOp(i, e.target.value)}>
              {opsFor(prop.type).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <FilterValue rule={r} prop={prop} onChange={(value) => update(i, { value })} />
            <button className="icon-btn" aria-label="Remove filter" onClick={() => removeAt(i)}><X size={14} /></button>
          </div>)
      })}
      <div className="factions">
        <button className="link-btn" onClick={addRule}><Plus size={13} /> Add filter</button>
        {depth < 1 && (
          <button className="link-btn" onClick={() => setRules([...rules, { group: { op: 'or', rules: [] } }])}>
            <Plus size={13} /> Add filter group</button>)}
        {depth > 0 && <button className="link-btn danger" onClick={onRemove}>Delete group</button>}
        {depth === 0 && rules.length > 0 && (
          <button className="link-btn danger" onClick={() => onChange({ ...group, rules: [] })}>Delete all filters</button>)}
      </div>
    </div>
  )
}
