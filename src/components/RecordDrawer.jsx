import { useEffect, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import { useData } from '../context/DataContext'
import { ENTITIES, setPatch } from '../lib/properties'
import { PropertyInput } from './Property'
import { ConfirmButton } from './ui'
import TaskExtras from './TaskExtras'

/** Side panel showing every property of a record, editable in place (Notion's "open page"). */
export default function RecordDrawer({ entity, row, onClose }) {
  const { props, updateRow, deleteRow, isDeveloper, notify } = useData()
  const def = ENTITIES[entity]
  const list = props[entity]
  const titleProp = list.find((p) => p.title)
  const [title, setTitle] = useState(row[titleProp.key] || '')
  useEffect(() => { setTitle(row[titleProp.key] || '') }, [row.id, row[titleProp.key]])

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const change = (prop, value) => updateRow(def.table, row.id, setPatch(row, prop, value))
  const commitTitle = () => {
    const t = title.trim()
    if (!t) return setTitle(row[titleProp.key] || '')
    if (t !== row[titleProp.key]) change(titleProp, t)
  }
  const remove = async () => {
    const { error } = await deleteRow(def.table, row.id)
    if (!error) { notify(`Deleted ${def.singular}`); onClose() }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`${def.singular} details`}>
        <div className="drawer-head">
          <input className="drawer-title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={commitTitle}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()} aria-label="Title" />
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="drawer-body">
          <div className="prop-list">
            {list.filter((p) => !p.title).map((p) => (
              <div className="prop-line" key={p.key}>
                <label>{p.label}{p.custom && <span className="custom-dot" title="Custom property" />}</label>
                <div className="prop-control"><PropertyInput prop={p} row={row} onChange={(v) => change(p, v)} /></div>
              </div>))}
          </div>
          {entity === 'tasks' && <TaskExtras task={row} />}
          {isDeveloper && (
            <div className="drawer-foot">
              <ConfirmButton label={`Delete ${def.singular}`} icon={<Trash2 size={13} />} onConfirm={remove} />
            </div>)}
        </div>
      </aside>
    </div>
  )
}
