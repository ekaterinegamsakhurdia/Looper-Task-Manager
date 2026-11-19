import { useEffect, useState } from 'react'
import { Check, Minus } from 'lucide-react'
import { useData } from '../context/DataContext'
import { getValue, isSelectLike, isMulti } from '../lib/properties'
import { SelectField, Switch } from './ui'

export const fmtDate = (v) => {
  if (!v) return ''
  const d = new Date(String(v).slice(0, 10) + 'T00:00:00')
  return isNaN(d) ? String(v) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const variantOf = (prop) => (prop.type === 'people' || prop.type === 'person' ? 'people' : 'color')

/** Select-like property as a (possibly editable) dropdown. */
export function SelectProp({ prop, value, onChange, readOnly, bare, placeholder, allowMe, multi }) {
  const { optionsFor } = useData()
  let options = optionsFor(prop, { includeArchived: true })
  // "Me" is only offered inside filters, where it is resolved at filter time.
  if (allowMe && prop.source === 'employees') options = [{ value: '__me__', label: 'Me (viewing as)' }, ...options]
  return (
    <SelectField options={options} value={value} multi={multi ?? isMulti(prop.type)} readOnly={readOnly} bare={bare}
      variant={variantOf(prop)} placeholder={placeholder} onChange={onChange} />
  )
}

/** Read-only rendering of one property of a row. */
export function PropertyValue({ prop, row }) {
  const { today } = useData()
  const v = getValue(row, prop)
  if (isSelectLike(prop.type)) return <SelectProp prop={prop} value={v} readOnly placeholder="" />
  if (prop.type === 'checkbox') return v ? <Check size={14} className="ok-icon" /> : <Minus size={12} className="dim-icon" />
  if (v === null || v === undefined || v === '') return null
  if (prop.type === 'date') {
    const late = prop.key === 'deadline' && !row._complete && String(v).slice(0, 10) < today
    return <span className={`cell-date${late ? ' late' : ''}`}>{fmtDate(v)}</span>
  }
  if (prop.type === 'number') return <span className="mono">{prop.key === 'budget' ? `$${Number(v).toLocaleString()}` : v}</span>
  return <span className={prop.title ? 'cell-title' : 'cell-text'}>{String(v)}</span>
}

/** Editable control for one property (drawer, new-record dialog, table cells). */
export function PropertyInput({ prop, row, onChange, bare }) {
  const v = getValue(row, prop)
  const [local, setLocal] = useState(v ?? '')
  useEffect(() => { setLocal(v ?? '') }, [v])

  if (prop.readonly) return <PropertyValue prop={prop} row={row} />
  if (isSelectLike(prop.type)) return <SelectProp prop={prop} value={v} onChange={onChange} bare={bare} />
  if (prop.type === 'checkbox') return <Switch checked={!!v} onChange={onChange} />
  if (prop.type === 'date') {
    return <input type="date" className="form-input slim" value={v ? String(v).slice(0, 10) : ''}
      onChange={(e) => onChange(e.target.value || null)} />
  }
  if (prop.type === 'number') {
    return <input type="number" className="form-input slim" value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { const n = local === '' ? null : Number(local); if (n !== (v ?? null)) onChange(n) }}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
  }
  const commit = () => { if ((local || null) !== (v || null)) onChange(local || null) }
  if (prop.multiline) {
    return <textarea className="form-input slim" rows={3} value={local} onChange={(e) => setLocal(e.target.value)} onBlur={commit} />
  }
  return <input className="form-input slim" value={local} onChange={(e) => setLocal(e.target.value)} onBlur={commit}
    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
}

/** Table cell: dropdowns and checkboxes edit in place; everything else is display-only. */
export function PropertyCell({ prop, row, onChange }) {
  if (!prop.readonly && (isSelectLike(prop.type) || prop.type === 'checkbox')) {
    return <PropertyInput prop={prop} row={row} onChange={onChange} bare />
  }
  return <PropertyValue prop={prop} row={row} />
}
