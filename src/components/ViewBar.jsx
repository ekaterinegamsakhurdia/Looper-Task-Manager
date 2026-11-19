import { useState } from 'react'
import {
  ArrowDownAZ, ArrowUpAZ, Columns3, Copy, Eye, EyeOff, Filter, Layers, LayoutGrid, MoreHorizontal,
  Plus, Search, Table2, Trash2, X, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react'
import { Popover, SortableList, ConfirmButton } from './ui'
import { FilterGroupEditor } from './FilterBuilder'
import { countRules } from '../lib/filters'

const GROUPABLE = (p) => ['select', 'person', 'relation'].includes(p.type) && !p.readonly || p.key === 'report_state' || p.key === 'count_check'
const BOARDABLE = (p) => ['select', 'person', 'relation'].includes(p.type)

function SortEditor({ sort, onChange, props }) {
  const set = (i, patch) => onChange(sort.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  return (
    <div className="panel">
      {sort.length === 0 && <div className="menu-empty">No sorting — rows keep their natural order.</div>}
      {sort.map((s, i) => (
        <div className="frow" key={i}>
          <select className="mini-select fprop" value={s.prop} onChange={(e) => set(i, { prop: e.target.value })}>
            {props.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <select className="mini-select" value={s.dir} onChange={(e) => set(i, { dir: e.target.value })}>
            <option value="asc">Ascending</option><option value="desc">Descending</option>
          </select>
          <button className="icon-btn" onClick={() => onChange(sort.filter((_, j) => j !== i))}><X size={14} /></button>
        </div>))}
      <div className="factions">
        <button className="link-btn" onClick={() => onChange([...sort, { prop: (props.find((p) => !p.title) || props[0]).key, dir: 'asc' }])}>
          <Plus size={13} /> Add sort</button>
        {sort.length > 0 && <button className="link-btn danger" onClick={() => onChange([])}>Delete sort</button>}
      </div>
    </div>
  )
}

function GroupEditor({ config, setConfig, props, groups }) {
  const board = config.layout === 'board'
  const options = props.filter(board ? BOARDABLE : GROUPABLE)
  const hidden = config.hiddenGroups || []
  return (
    <div className="panel">
      <label className="panel-label">{board ? 'Board columns by' : 'Group by'}</label>
      <select className="mini-select wide" value={config.groupBy || ''} onChange={(e) => setConfig({ groupBy: e.target.value || null, hiddenGroups: [] })}>
        {!board && <option value="">None</option>}
        {options.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>
      {config.groupBy && groups.length > 0 && (
        <>
          <label className="panel-label">{board ? 'Visible columns' : 'Visible groups'}</label>
          <div className="checklist">
            {groups.map((g) => {
              const off = hidden.includes(String(g.key))
              return (
                <button key={String(g.key)} className="menu-item" onClick={() =>
                  setConfig({ hiddenGroups: off ? hidden.filter((k) => k !== String(g.key)) : [...hidden, String(g.key)] })}>
                  <span className="menu-item-label">{g.label}<span className="count-note">{g.rows.length}</span></span>
                  {off ? <EyeOff size={13} className="dim-icon" /> : <Eye size={13} className="menu-check" />}
                </button>)
            })}
          </div>
        </>)}
    </div>
  )
}

function PropertiesEditor({ props, active, onChange, title }) {
  const byKey = Object.fromEntries(props.map((p) => [p.key, p]))
  const shown = active.filter((k) => byKey[k] && !byKey[k].title).map((k) => byKey[k])
  const hiddenProps = props.filter((p) => !p.title && !active.includes(p.key))
  const titleProp = props.find((p) => p.title)
  return (
    <div className="panel">
      <label className="panel-label">{title}</label>
      {titleProp && <div className="prop-row fixed"><span className="prop-grip" /> <span className="prop-name">{titleProp.label}</span><span className="count-note">always shown</span></div>}
      <SortableList items={shown} getKey={(p) => p.key}
        onReorder={(next) => onChange([titleProp?.key, ...next.map((p) => p.key)].filter(Boolean))}
        renderItem={(p, _i, dragProps, grip) => (
          <div className="prop-row">
            <span className="prop-grip" {...dragProps}>{grip}</span><span className="prop-name">{p.label}</span>
            <button className="icon-btn" aria-label={`Hide ${p.label}`} onClick={() => onChange(active.filter((k) => k !== p.key))}><Eye size={14} /></button>
          </div>)} />
      {hiddenProps.length > 0 && <label className="panel-label">Hidden</label>}
      {hiddenProps.map((p) => (
        <div className="prop-row" key={p.key}>
          <span className="prop-grip" /><span className="prop-name dim">{p.label}</span>
          <button className="icon-btn" aria-label={`Show ${p.label}`} onClick={() => onChange([...active, p.key])}><EyeOff size={14} /></button>
        </div>))}
    </div>
  )
}

function ViewTab({ view, active, onSelect, canEdit, index, count, actions }) {
  const [name, setName] = useState(view.name)
  return (
    <div className={`vtab${active ? ' active' : ''}`}>
      <button className="vtab-btn" onClick={() => onSelect(view.id)}>
        {view.config?.layout === 'board' ? <LayoutGrid size={13} /> : <Table2 size={13} />}{view.name}
      </button>
      {active && canEdit && (
        <Popover width={230} align="left" trigger={({ toggle }) => (
          <button className="vtab-more" aria-label="View options" onClick={() => { setName(view.name); toggle() }}><MoreHorizontal size={14} /></button>)}>
          {({ close }) => (
            <div className="menu">
              <input className="form-input slim" value={name} onChange={(e) => setName(e.target.value)} aria-label="View name"
                onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { actions.rename(view, name.trim()); close() } }} />
              <button className="menu-item" onClick={() => { if (name.trim()) actions.rename(view, name.trim()); close() }}>Rename</button>
              <button className="menu-item" onClick={() => { actions.duplicate(view); close() }}><Copy size={13} /> Duplicate</button>
              <button className="menu-item" disabled={index === 0} onClick={() => { actions.move(view, -1); close() }}><ChevronLeft size={13} /> Move left</button>
              <button className="menu-item" disabled={index === count - 1} onClick={() => { actions.move(view, 1); close() }}><ChevronRight size={13} /> Move right</button>
              <div className="menu-sep" />
              <ConfirmButton className="menu-item danger" label="Delete view" confirmLabel="Click again to delete" icon={<Trash2 size={13} />}
                onConfirm={() => { actions.remove(view); close() }} />
            </div>)}
        </Popover>)}
    </div>
  )
}

export default function ViewBar({
  entity, views, activeId, onSelect, config, setConfig, dirty, props, groups, search, setSearch,
  isDeveloper, onSave, onReset, onCreateView, viewActions, onNew, newLabel,
}) {
  const [newName, setNewName] = useState('')
  const filterCount = countRules(config.filter)
  const boardColumns = config.layout === 'board'
  const cardOrColumns = boardColumns ? (config.cardProps || []) : (config.columns || [])
  const tableProps = props.filter((p) => !p.title || !boardColumns)

  return (
    <div className="viewbar">
      <div className="vtabs">
        {views.map((v, i) => (
          <ViewTab key={v.id} view={v} index={i} count={views.length} active={v.id === activeId} onSelect={onSelect}
            canEdit={isDeveloper} actions={viewActions} />))}
        {isDeveloper && (
          <Popover width={250} trigger={({ toggle }) => (
            <button className="vtab-add" onClick={() => { setNewName(''); toggle() }}><Plus size={13} /> Add view</button>)}>
            {({ close }) => (
              <div className="menu">
                <label className="panel-label">New view from the current settings</label>
                <input className="form-input slim" autoFocus placeholder="View name" value={newName} onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) { onCreateView(newName.trim()); close() } }} />
                <button className="btn btn-primary full" disabled={!newName.trim()} onClick={() => { onCreateView(newName.trim()); close() }}>Create view</button>
              </div>)}
          </Popover>)}
      </div>

      <div className="toolbar">
        <div className="seg">
          <button className={!boardColumns ? 'on' : ''} onClick={() => setConfig({ layout: 'table' })}><Table2 size={13} /> Table</button>
          <button className={boardColumns ? 'on' : ''} onClick={() => setConfig({
            layout: 'board',
            groupBy: props.some((p) => p.key === config.groupBy && BOARDABLE(p)) ? config.groupBy : (props.find((p) => p.kind && BOARDABLE(p))?.key || null),
          })}><LayoutGrid size={13} /> Board</button>
        </div>

        <Popover width={660} trigger={({ toggle, open }) => (
          <button className={`tool-btn${filterCount ? ' on' : ''}${open ? ' open' : ''}`} onClick={toggle}>
            <Filter size={13} /> Filter{filterCount > 0 && <span className="badge-count">{filterCount}</span>}</button>)}>
          <FilterGroupEditor group={config.filter || { op: 'and', rules: [] }} props={props} onChange={(filter) => setConfig({ filter })} />
        </Popover>

        <Popover width={420} trigger={({ toggle, open }) => (
          <button className={`tool-btn${(config.sort || []).length ? ' on' : ''}${open ? ' open' : ''}`} onClick={toggle}>
            {(config.sort?.[0]?.dir === 'desc') ? <ArrowUpAZ size={13} /> : <ArrowDownAZ size={13} />} Sort
            {(config.sort || []).length > 0 && <span className="badge-count">{config.sort.length}</span>}</button>)}>
          <SortEditor sort={config.sort || []} props={props} onChange={(sort) => setConfig({ sort })} />
        </Popover>

        <Popover width={300} trigger={({ toggle, open }) => (
          <button className={`tool-btn${config.groupBy ? ' on' : ''}${open ? ' open' : ''}`} onClick={toggle}>
            <Layers size={13} /> {boardColumns ? 'Columns' : 'Group'}</button>)}>
          <GroupEditor config={config} setConfig={setConfig} props={props} groups={groups} />
        </Popover>

        <Popover width={300} trigger={({ toggle, open }) => (
          <button className={`tool-btn${open ? ' open' : ''}`} onClick={toggle}>
            {boardColumns ? <SlidersHorizontal size={13} /> : <Columns3 size={13} />} {boardColumns ? 'Card fields' : 'Properties'}</button>)}>
          <PropertiesEditor props={tableProps} active={cardOrColumns}
            title={boardColumns ? 'Shown on cards' : 'Visible columns (drag to reorder)'}
            onChange={(next) => setConfig(boardColumns ? { cardProps: next.filter((k) => !props.find((p) => p.key === k)?.title) } : { columns: next })} />
        </Popover>

        <div className="searchbox"><Search size={13} /><input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>

        <div className="toolbar-spacer" />
        {dirty && (
          <div className="dirty-note">
            <span>Unsaved view changes</span>
            {isDeveloper && <button className="btn btn-primary sm" onClick={onSave}>Save to view</button>}
            <button className="btn btn-ghost sm" onClick={onReset}>Reset</button>
          </div>)}
        {onNew && <button className="btn btn-primary" onClick={onNew}><Plus size={14} /> {newLabel}</button>}
      </div>
    </div>
  )
}
