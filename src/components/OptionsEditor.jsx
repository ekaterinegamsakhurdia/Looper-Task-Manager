import { useEffect, useState } from 'react'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { ColorSwatchPicker, SortableList } from './ui'
import { FLAG_LABELS } from '../config/optionKinds'

function OptionRow({ opt, flags, dragProps, grip, handlers }) {
  const [name, setName] = useState(opt.value)
  useEffect(() => { setName(opt.value) }, [opt.value])
  const commit = () => {
    const n = name.trim()
    if (!n) return setName(opt.value)
    if (n !== opt.value) handlers.onRename(opt, n)
  }
  return (
    <div className={`opt-row${opt.archived ? ' archived' : ''}`}>
      <span className="opt-grip" title="Drag to reorder" {...dragProps}>{grip}</span>
      <ColorSwatchPicker value={opt.color || '#6B7280'} onChange={(c) => handlers.onColor(opt, c)} />
      <input className="form-input slim opt-name" value={name} aria-label={`Name of ${opt.value}`}
        onChange={(e) => setName(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} />
      {flags.map((f) => (
        <label className="opt-flag" key={f} title={FLAG_LABELS[f]}>
          <input type="checkbox" checked={!!opt.meta?.[f]} onChange={(e) => handlers.onFlag(opt, f, e.target.checked)} />{FLAG_LABELS[f]}
        </label>))}
      <span className="grow" />
      {handlers.onArchive && (
        <button className="icon-btn" title={opt.archived ? 'Hidden from pickers — click to show again' : 'Hide from pickers (existing records keep it)'}
          aria-label={opt.archived ? `Show ${opt.value}` : `Hide ${opt.value}`} onClick={() => handlers.onArchive(opt)}>
          {opt.archived ? <EyeOff size={14} /> : <Eye size={14} />}</button>)}
      <button className="icon-btn danger" aria-label={`Delete ${opt.value}`} title="Delete" onClick={() => handlers.onDelete(opt)}><Trash2 size={14} /></button>
    </div>
  )
}

/** Add / rename / recolor / reorder / hide / delete a list of options. Storage-agnostic. */
export default function OptionsEditor({ options, flags = [], handlers }) {
  const [adding, setAdding] = useState('')
  const add = () => { const n = adding.trim(); if (n) { handlers.onAdd(n); setAdding('') } }
  return (
    <div className="opts">
      <SortableList items={options} getKey={(o) => o.id || o.value} onReorder={handlers.onReorder}
        renderItem={(opt, _i, dragProps, grip) => <OptionRow opt={opt} flags={flags} dragProps={dragProps} grip={grip} handlers={handlers} />} />
      <div className="opt-add">
        <input className="form-input slim" placeholder="Add an option…" value={adding} onChange={(e) => setAdding(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button className="btn btn-ghost" onClick={add} disabled={!adding.trim()}><Plus size={14} /> Add</button>
      </div>
    </div>
  )
}
