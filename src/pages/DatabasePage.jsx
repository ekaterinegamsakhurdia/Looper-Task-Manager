import { useCallback, useEffect, useMemo, useState } from 'react'
import { useData } from '../context/DataContext'
import { BRAND } from '../config/brand'
import { ENTITIES, defaultColumns, setPatch } from '../lib/properties'
import { applyView, groupRows } from '../lib/filters'
import ViewBar from '../components/ViewBar'
import DataTable from '../components/DataTable'
import KanbanBoard from '../components/KanbanBoard'
import RecordDrawer from '../components/RecordDrawer'
import NewRecordModal from '../components/NewRecordModal'

const BOARDABLE = (p) => ['select', 'person', 'relation'].includes(p.type)

function normalize(cfg, props) {
  const c = cfg || {}
  return {
    layout: c.layout === 'board' ? 'board' : 'table',
    filter: c.filter || { op: 'and', rules: [] },
    sort: c.sort || [],
    groupBy: c.groupBy || null,
    columns: c.columns || defaultColumns(props),
    cardProps: c.cardProps || props.filter((p) => p.dv && !p.title).slice(0, 4).map((p) => p.key),
    hiddenGroups: c.hiddenGroups || [],
  }
}

/** One Notion-style database page (Tasks / Briefs / Clients / Ad Ops) driven by saved views. */
export default function DatabasePage({ entity }) {
  const { props: allProps, rows: allRows, views: allViews, optionsFor, labelFor, meId, today, isDeveloper,
    updateRow, insertRow, deleteRow, getOptions, notify, db } = useData()
  const def = ENTITIES[entity]
  const props = allProps[entity]
  const rowsRaw = allRows[entity]
  const propMap = useMemo(() => Object.fromEntries(props.map((p) => [p.key, p])), [props])
  const titleProp = props.find((p) => p.title)
  const views = useMemo(() => allViews.filter((v) => v.page === entity).sort((a, b) => a.sort_order - b.sort_order), [allViews, entity])

  const lsKey = `${BRAND.slug}:view:${entity}`
  const [activeId, setActiveId] = useState(() => { try { return localStorage.getItem(lsKey) } catch { return null } })
  const active = views.find((v) => v.id === activeId) || views[0] || null
  const saved = useMemo(() => normalize(active?.config, props), [active, props])
  const savedJson = JSON.stringify(saved)
  const [draft, setDraft] = useState(saved)
  useEffect(() => { setDraft(saved) }, [active?.id, savedJson])
  const setConfig = useCallback((patch) => setDraft((d) => ({ ...d, ...patch })), [])
  const dirty = JSON.stringify(draft) !== savedJson

  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(null)   // null | { preset }

  const selectView = (id) => { setActiveId(id); setSearch(''); try { localStorage.setItem(lsKey, id) } catch { /* ignore */ } }

  const ctx = useMemo(() => ({ propMap, meId, today, optionsFor, labelFor }), [propMap, meId, today, optionsFor, labelFor])
  const filtered = useMemo(() => applyView(rowsRaw, draft, ctx, search), [rowsRaw, draft, ctx, search])

  const board = draft.layout === 'board'
  const groupProp = useMemo(() => {
    const p = draft.groupBy ? propMap[draft.groupBy] : null
    if (board) return p && BOARDABLE(p) ? p : props.find((x) => x.kind && BOARDABLE(x)) || null
    return p || null
  }, [draft.groupBy, propMap, board, props])
  const ordered = !!(groupProp && (groupProp.kind || groupProp.options))
  const groups = useMemo(() => (groupProp ? groupRows(filtered, groupProp, ctx, { showEmpty: board && ordered }) : []),
    [filtered, groupProp, ctx, board, ordered])
  const visibleGroups = groups.filter((g) => !draft.hiddenGroups.includes(String(g.key)))

  const columns = useMemo(() => {
    const cols = draft.columns.map((k) => propMap[k]).filter(Boolean)
    return cols.some((p) => p.title) ? cols : [titleProp, ...cols]
  }, [draft.columns, propMap, titleProp])
  const cardProps = useMemo(() => draft.cardProps.map((k) => propMap[k]).filter(Boolean), [draft.cardProps, propMap])

  // ── Record edits ──────────────────────────────────────────────────────────
  const onCellChange = (row, prop, value) => updateRow(def.table, row.id, setPatch(row, prop, value))
  const onMove = (id, key) => {
    if (groupProp.readonly) return notify(`“${groupProp.label}” is calculated automatically — it can't be changed by dragging.`, 'error')
    const row = rowsRaw.find((r) => r.id === id)
    if (row) onCellChange(row, groupProp, key)
  }

  // ── Board column reorder (developer): writes the option order to the database ──
  const canReorder = isDeveloper && !!groupProp && (!!groupProp.kind || !!(groupProp.custom && groupProp.options))
  const reorderColumns = async (keys) => {
    if (groupProp.kind) {
      const all = getOptions(groupProp.kind, { includeArchived: true })
      const order = [...keys, ...all.map((o) => o.value).filter((v) => !keys.includes(v))]
      await Promise.all(order.map((v, i) => {
        const o = all.find((x) => x.value === v)
        return o && o.sort_order !== i && !String(o.id).startsWith('default-') ? updateRow('config_options', o.id, { sort_order: i }) : null
      }))
    } else {
      const cp = db.custom_properties.find((c) => c.id === groupProp.id)
      const opts = cp.options || []
      const next = [...keys.map((k) => opts.find((o) => o.value === k)).filter(Boolean), ...opts.filter((o) => !keys.includes(o.value))]
      await updateRow('custom_properties', cp.id, { options: next })
    }
  }

  // ── View management (developer) ───────────────────────────────────────────
  const viewActions = {
    rename: (v, name) => updateRow('saved_views', v.id, { name }),
    duplicate: async (v) => {
      const { data } = await insertRow('saved_views', { page: entity, name: `${v.name} copy`, config: v.config, sort_order: views.length })
      if (data) selectView(data.id)
    },
    move: (v, dir) => {
      const next = [...views]
      const i = next.findIndex((x) => x.id === v.id), j = i + dir
      if (j < 0 || j >= next.length) return
      ;[next[i], next[j]] = [next[j], next[i]]
      next.forEach((x, idx) => { if (x.sort_order !== idx) updateRow('saved_views', x.id, { sort_order: idx }) })
    },
    remove: async (v) => {
      if (views.length <= 1) return notify('Keep at least one view on each page.', 'error')
      const { error } = await deleteRow('saved_views', v.id)
      if (!error) selectView(views.find((x) => x.id !== v.id).id)
    },
  }
  const onCreateView = async (name) => {
    const { data } = await insertRow('saved_views', { page: entity, name, config: draft, sort_order: views.length })
    if (data) { selectView(data.id); notify(`View “${name}” created`) }
  }
  const onSave = async () => { if (active) { const { error } = await updateRow('saved_views', active.id, { config: draft }); if (!error) notify('View saved') } }

  const openRow = openId ? rowsRaw.find((r) => r.id === openId) : null
  const needsMe = !meId && JSON.stringify(draft.filter).includes('__me__')

  return (
    <div className="db-page">
      <div className="page-header">
        <div>
          <div className="page-title">{def.label}</div>
          <div className="page-subtitle">{rowsRaw.length} {def.singular}{rowsRaw.length === 1 ? '' : 's'}
            {entity === 'campaigns' && ' · one row per running ad campaign — update Last Reported every time a report is sent'}</div>
        </div>
      </div>

      <ViewBar entity={entity} views={views} activeId={active?.id} onSelect={selectView} config={draft} setConfig={setConfig}
        dirty={dirty && !!active} props={props} groups={groups} search={search} setSearch={setSearch}
        isDeveloper={isDeveloper} onSave={onSave} onReset={() => setDraft(saved)} onCreateView={onCreateView}
        viewActions={viewActions} onNew={() => setCreating({ preset: {} })} newLabel={`New ${def.singular}`} />

      {needsMe && (
        <div className="notice">This view filters by “Me”. Pick who you are under <strong>Viewing as</strong> (bottom of the sidebar) to see your items.</div>)}

      {board ? (
        <KanbanBoard groups={visibleGroups} titleProp={titleProp} cardProps={cardProps} onOpen={(r) => setOpenId(r.id)}
          onMove={onMove} canReorder={canReorder} onReorder={reorderColumns}
          onHide={(k) => setConfig({ hiddenGroups: [...draft.hiddenGroups, String(k)] })}
          onNewIn={(key) => setCreating({ preset: groupProp && !groupProp.readonly && key !== null ? { [groupProp.key]: key } : {} })} />
      ) : (
        <DataTable rows={filtered} total={rowsRaw.length} columns={columns} sort={draft.sort}
          groups={groupProp ? visibleGroups : null} onSortChange={(sort) => setConfig({ sort })}
          onOpen={(r) => setOpenId(r.id)} onCellChange={onCellChange} />
      )}

      {openRow && <RecordDrawer entity={entity} row={openRow} onClose={() => setOpenId(null)} />}
      {creating && <NewRecordModal entity={entity} preset={creating.preset} onClose={() => setCreating(null)} onCreated={(r) => setOpenId(r.id)} />}
    </div>
  )
}
