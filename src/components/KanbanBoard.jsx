import { useRef, useState } from 'react'
import { EyeOff, Plus } from 'lucide-react'
import { EMPTY_GROUP } from '../lib/filters'
import { getValue } from '../lib/properties'
import { PropertyValue } from './Property'

function Card({ row, titleProp, cardProps, onOpen, onDragStart }) {
  return (
    <div className={`kcard${row._complete ? ' complete' : ''}`} draggable onDragStart={(e) => onDragStart(e, row.id)} onClick={() => onOpen(row)}>
      <div className="kcard-title">{row[titleProp.key] || 'Untitled'}</div>
      <div className="kcard-props">
        {cardProps.map((p) => {
          const v = getValue(row, p)
          if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) return null
          return <div className="kcard-prop" key={p.key}><PropertyValue prop={p} row={row} /></div>
        })}
      </div>
    </div>
  )
}

/** Generic board: columns come from any single-select-like property, cards are records. */
export default function KanbanBoard({ groups, titleProp, cardProps, onOpen, onMove, canReorder, onReorder, onHide, onNewIn }) {
  const drag = useRef(null)            // { type: 'card', id } | { type: 'col', key }
  const [over, setOver] = useState(null)

  const dropOnColumn = (e, g) => {
    e.preventDefault(); setOver(null)
    const d = drag.current; drag.current = null
    if (!d) return
    if (d.type === 'card') onMove(d.id, g.key === EMPTY_GROUP ? null : g.key)
    if (d.type === 'col' && canReorder && g.key !== EMPTY_GROUP && d.key !== g.key) {
      const keys = groups.filter((x) => x.key !== EMPTY_GROUP).map((x) => x.key)
      const from = keys.indexOf(d.key), to = keys.indexOf(g.key)
      if (from < 0 || to < 0) return
      keys.splice(to, 0, keys.splice(from, 1)[0])
      onReorder(keys)
    }
  }

  return (
    <div className="kanban">
      {groups.map((g) => (
        <div key={String(g.key)} className={`kcol${over === g.key ? ' drag-over' : ''}${g.meta?.dim ? ' dim' : ''}`}
          onDragOver={(e) => { if (drag.current) { e.preventDefault(); setOver(g.key) } }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null) }}
          onDrop={(e) => dropOnColumn(e, g)}>
          <div className={`kcol-head${canReorder && g.key !== EMPTY_GROUP ? ' reorderable' : ''}`}
            draggable={canReorder && g.key !== EMPTY_GROUP}
            onDragStart={(e) => { drag.current = { type: 'col', key: g.key }; e.dataTransfer.setData('text/plain', 'col') }}
            onDragEnd={() => { drag.current = null; setOver(null) }}>
            <span className="kcol-dot" style={{ background: g.color || '#6B7280' }} />
            <span className="kcol-title">{g.label}</span>
            <span className="count-note">{g.rows.length}</span>
            <button className="icon-btn kcol-hide" title="Hide column" aria-label={`Hide ${g.label}`} onClick={() => onHide(g.key)}><EyeOff size={13} /></button>
          </div>
          <div className="kcol-cards">
            {g.rows.map((row) => (
              <Card key={row.id} row={row} titleProp={titleProp} cardProps={cardProps} onOpen={onOpen}
                onDragStart={(e, id) => { drag.current = { type: 'card', id }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'card') }} />))}
            <button className="kcol-add" onClick={() => onNewIn(g.key === EMPTY_GROUP ? null : g.key)}><Plus size={13} /> New</button>
          </div>
        </div>))}
      {groups.length === 0 && <div className="empty-state">No columns to show. Pick a property under “Columns”.</div>}
    </div>
  )
}
