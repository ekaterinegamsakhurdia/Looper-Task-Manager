import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, GripVertical, X } from 'lucide-react'
import { badgeStyle, PALETTE } from '../lib/color'

/** Floating panel anchored to its trigger; rendered in a portal so tables never clip it. */
export function Popover({ trigger, children, align = 'left', width = 280 }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({})
  const wrap = useRef(null)
  const pop = useRef(null)
  const close = () => setOpen(false)

  const toggle = () => {
    if (open) return close()
    const r = wrap.current.getBoundingClientRect()
    const vh = window.innerHeight, vw = window.innerWidth
    const below = vh - r.bottom - 12, above = r.top - 12
    const up = below < 260 && above > below
    const left = Math.max(8, Math.min(align === 'right' ? r.right - width : r.left, vw - width - 8))
    setPos(up ? { bottom: vh - r.top + 6, left, maxHeight: Math.min(above, 560) }
              : { top: r.bottom + 6, left, maxHeight: Math.min(below, 560) })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    // Clicks inside this popover or any nested popover (e.g. a dropdown opened from
    // within the filter panel) must not close it.
    const down = (e) => { if (!wrap.current?.contains(e.target) && !e.target.closest?.('.pop')) close() }
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close() } }
    // Ignore scroll events right after opening (momentum scrolling / scroll-into-view settling).
    const openedAt = performance.now()
    const scroll = (e) => { if (performance.now() - openedAt > 200 && !pop.current?.contains(e.target)) close() }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key, true)
    window.addEventListener('scroll', scroll, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key, true)
      window.removeEventListener('scroll', scroll, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  return (
    <>
      <span ref={wrap} className="pop-anchor" onClick={(e) => e.stopPropagation()}>{trigger({ open, toggle })}</span>
      {open && createPortal(
        <div ref={pop} className="pop" style={{ ...pos, width }} onClick={(e) => e.stopPropagation()}>
          {typeof children === 'function' ? children({ close }) : children}
        </div>, document.body)}
    </>
  )
}

const hue = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
export const initials = (name) => (name ? name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?')

export function Avatar({ name, size = 20 }) {
  return (
    <span className="avatar" title={name}
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue(name)} 45% 38%)` }}>
      {initials(name)}
    </span>
  )
}

export function Tag({ label, color, onRemove, variant = 'color' }) {
  if (variant === 'people') {
    return <span className="chip chip-person"><Avatar name={label} size={16} />{label}</span>
  }
  if (!color) return <span className="chip">{label}</span>
  return (
    <span className="tag" style={badgeStyle(color)}>
      {label}
      {onRemove && <button className="tag-x" onClick={(e) => { e.stopPropagation(); onRemove() }}><X size={10} /></button>}
    </span>
  )
}

/** Single / multi select dropdown used in tables, filters and the record drawer. */
export function SelectField({ options, value, onChange, multi = false, placeholder = 'Empty', readOnly = false,
  clearable = true, variant = 'color', bare = false, width = 260 }) {
  const selected = multi ? (Array.isArray(value) ? value : []) : (value === null || value === undefined || value === '' ? [] : [value])
  const lookup = new Map(options.map((o) => [String(o.value), o]))
  const [q, setQ] = useState('')

  const chips = selected.map((v) => {
    const o = lookup.get(String(v))
    return <Tag key={String(v)} label={o ? o.label : String(v)} color={o?.color} variant={variant === 'people' ? 'people' : 'color'} />
  })
  const display = chips.length ? <span className="sel-chips">{chips}</span> : <span className="sel-empty">{placeholder}</span>

  if (readOnly) return <span className="select-trigger readonly">{display}</span>

  const isSel = (v) => selected.some((x) => String(x) === String(v))
  const pick = (v, close) => {
    if (multi) onChange(isSel(v) ? selected.filter((x) => String(x) !== String(v)) : [...selected, v])
    else { onChange(v); close() }
  }
  const visible = options.filter((o) => (!o.archived || isSel(o.value)) && (!q || String(o.label).toLowerCase().includes(q.toLowerCase())))

  return (
    <Popover width={width} trigger={({ toggle, open }) => (
      <button type="button" className={`select-trigger${bare ? ' bare' : ''}${open ? ' open' : ''}`}
        onClick={() => { setQ(''); toggle() }}>
        {display}{!bare && <ChevronDown size={12} className="sel-caret" />}
      </button>)}>
      {({ close }) => (
        <div className="menu">
          {options.length > 7 && (
            <input className="menu-search" autoFocus placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />)}
          {!multi && clearable && selected.length > 0 && (
            <button className="menu-item muted" onClick={() => { onChange(null); close() }}><X size={12} /> No value</button>)}
          {visible.map((o) => (
            <button key={String(o.value)} className="menu-item" onClick={() => pick(o.value, close)}>
              <span className="menu-item-label"><Tag label={o.label} color={o.color} variant={variant === 'people' ? 'people' : 'color'} /></span>
              {isSel(o.value) && <Check size={13} className="menu-check" />}
            </button>))}
          {visible.length === 0 && <div className="menu-empty">No options</div>}
        </div>)}
    </Popover>
  )
}

export function Switch({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      className={`switch${checked ? ' on' : ''}`} onClick={(e) => { e.stopPropagation(); onChange(!checked) }}>
      <span />
    </button>
  )
}

/** Two-step delete button — no browser confirm dialogs. */
export function ConfirmButton({ label = 'Delete', confirmLabel = 'Click again to confirm', onConfirm, className = 'btn btn-danger', icon }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3500); return () => clearTimeout(t) }, [armed])
  return (
    <button type="button" className={`${className}${armed ? ' armed' : ''}`}
      onClick={(e) => { e.stopPropagation(); if (armed) { setArmed(false); onConfirm() } else setArmed(true) }}>
      {icon}{armed ? confirmLabel : label}
    </button>
  )
}

/** Drag-to-reorder list. `onReorder` receives the new array of items. */
export function SortableList({ items, getKey, renderItem, onReorder }) {
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)
  const drop = (to) => {
    if (drag === null || drag === to) { setDrag(null); setOver(null); return }
    const next = [...items]
    const [moved] = next.splice(drag, 1)
    next.splice(to, 0, moved)
    setDrag(null); setOver(null)
    onReorder(next)
  }
  return items.map((item, i) => (
    <div key={getKey(item)} className={`sortable${over === i && drag !== i ? ' over' : ''}${drag === i ? ' dragging' : ''}`}
      onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(i) } }}
      onDrop={(e) => { e.preventDefault(); drop(i) }}>
      {renderItem(item, i, {
        draggable: true,
        onDragStart: (e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'row') },
        onDragEnd: () => { setDrag(null); setOver(null) },
      }, <GripVertical size={14} />)}
    </div>
  ))
}

export function ColorSwatchPicker({ value, onChange }) {
  return (
    <Popover width={208} trigger={({ toggle }) => (
      <button type="button" className="swatch-btn" style={{ background: value }} onClick={toggle} aria-label="Change color" />)}>
      {({ close }) => (
        <div className="swatch-grid">
          {PALETTE.map((c) => (
            <button key={c} className={`swatch${c.toLowerCase() === String(value).toLowerCase() ? ' sel' : ''}`} style={{ background: c }}
              onClick={() => { onChange(c); close() }} aria-label={c} />))}
          <label className="swatch-custom">Custom
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#6B7280'} onChange={(e) => onChange(e.target.value)} />
          </label>
        </div>)}
    </Popover>
  )
}

export function Modal({ title, onClose, children, width = 440 }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" style={{ width }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head"><strong>{title}</strong><button className="icon-btn" onClick={onClose}><X size={16} /></button></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>, document.body)
}
