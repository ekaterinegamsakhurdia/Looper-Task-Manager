import { Fragment, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight } from 'lucide-react'
import { PropertyCell } from './Property'
import { Tag } from './ui'

export default function DataTable({ rows, columns, groups, sort, onSortChange, onOpen, onCellChange, total }) {
  const [collapsed, setCollapsed] = useState(() => new Set())

  const cycleSort = (p) => {
    const cur = sort?.[0]
    if (!cur || cur.prop !== p.key) onSortChange([{ prop: p.key, dir: 'asc' }])
    else if (cur.dir === 'asc') onSortChange([{ prop: p.key, dir: 'desc' }])
    else onSortChange([])
  }

  const renderRow = (row) => (
    <tr key={row.id} onClick={() => onOpen(row)} className={row._complete ? 'row-complete' : ''}>
      {columns.map((p) => (
        <td key={p.key} className={p.title ? 'sticky-col' : ''} style={{ minWidth: p.width || 130 }}>
          <PropertyCell prop={p} row={row} onChange={(v) => onCellChange(row, p, v)} />
        </td>))}
    </tr>)

  const toggle = (k) => setCollapsed((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })
  const empty = groups ? groups.every((g) => g.rows.length === 0) : rows.length === 0

  return (
    <div className="table-wrap">
      <table className="dtable">
        <thead>
          <tr>
            {columns.map((p) => {
              const s = sort?.[0]?.prop === p.key ? sort[0].dir : null
              return (
                <th key={p.key} className={p.title ? 'sticky-col' : ''} onClick={() => cycleSort(p)} title="Click to sort">
                  {p.label}{s === 'asc' && <ArrowUp size={11} />}{s === 'desc' && <ArrowDown size={11} />}
                </th>)
            })}
          </tr>
        </thead>
        <tbody>
          {groups
            ? groups.map((g) => {
              const k = String(g.key), isOpen = !collapsed.has(k)
              return (
                <Fragment key={k}>
                  <tr className="group-row" onClick={() => toggle(k)}>
                    <td colSpan={columns.length}>
                      <span className="group-head">
                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {g.color ? <Tag label={g.label} color={g.color} /> : <strong>{g.label}</strong>}
                        <span className="count-note">{g.rows.length}</span>
                      </span>
                    </td>
                  </tr>
                  {isOpen && g.rows.map(renderRow)}
                </Fragment>)
            })
            : rows.map(renderRow)}
          {empty && (
            <tr className="empty-row"><td colSpan={columns.length}>
              {total === 0 ? 'Nothing here yet.' : 'No results — try changing the filters or search.'}</td></tr>)}
        </tbody>
      </table>
      <div className="table-foot">{rows.length} of {total} shown</div>
    </div>
  )
}
