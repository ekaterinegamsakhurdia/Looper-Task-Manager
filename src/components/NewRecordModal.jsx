import { useState } from 'react'
import { useData } from '../context/DataContext'
import { ENTITIES } from '../lib/properties'
import { PropertyInput } from './Property'
import { Modal } from './ui'

const FIELDS = {
  tasks: ['client_id', 'brief_id', 'stage', 'priority', 'department', 'assigned_to', 'deadline'],
  briefs: ['client_id', 'campaign_id', 'status', 'brief_type', 'am_owner_id'],
  clients: ['am_owner_id', 'status', 'tier', 'industry', 'platforms'],
  campaigns: ['client_id', 'status', 'start_date', 'am_owner_ids', 'advertiser_ids'],
}
const REQUIRED = { briefs: 'client_id', campaigns: 'client_id' }

export default function NewRecordModal({ entity, preset = {}, onClose, onCreated }) {
  const { props, getOptions, insertRow, rows, notify } = useData()
  const def = ENTITIES[entity]
  const list = props[entity]
  const titleProp = list.find((p) => p.title)
  const firstOption = (kind) => getOptions(kind)[0]?.value ?? null
  const [values, setValues] = useState(() => ({
    [titleProp.key]: '',
    ...(entity === 'tasks' ? { stage: firstOption('stage'), priority: getOptions('priority')[2]?.value ?? firstOption('priority') } : {}),
    ...(entity === 'briefs' ? { status: firstOption('brief_status') } : {}),
    ...(entity === 'clients' ? { status: firstOption('client_status') } : {}),
    ...(entity === 'campaigns' ? { status: firstOption('campaign_status') } : {}),
    ...preset,
  }))
  const [saving, setSaving] = useState(false)
  const fields = FIELDS[entity].map((k) => list.find((p) => p.key === k)).filter(Boolean)
  const missing = REQUIRED[entity] && !values[REQUIRED[entity]]
  const set = (key, v) => setValues((s) => ({ ...s, [key]: v }))

  const create = async () => {
    if (!String(values[titleProp.key]).trim()) return notify('Please enter a name', 'error')
    if (missing) return notify(`Please choose a ${list.find((p) => p.key === REQUIRED[entity]).label}`, 'error')
    const row = { ...values, [titleProp.key]: String(values[titleProp.key]).trim() }
    for (const k of Object.keys(row)) if (row[k] === undefined) delete row[k]
    if (entity === 'tasks' && row.brief_id) {   // inherit client / campaign from the brief
      const b = rows.briefs.find((x) => x.id === row.brief_id)
      if (b) { row.client_id ||= b.client_id; if (row.campaign_id == null) row.campaign_id = b.campaign_id }
    }
    setSaving(true)
    const { data } = await insertRow(def.table, row)
    setSaving(false)
    if (data) { notify(`${def.singular[0].toUpperCase() + def.singular.slice(1)} created`); onCreated?.(data); onClose() }
  }

  return (
    <Modal title={`New ${def.singular}`} onClose={onClose} width={480}>
      <div className="prop-list">
        <div className="prop-line">
          <label>{titleProp.label}</label>
          <div className="prop-control">
            <input className="form-input slim" autoFocus value={values[titleProp.key]} onChange={(e) => set(titleProp.key, e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()} placeholder="Name…" />
          </div>
        </div>
        {fields.map((p) => (
          <div className="prop-line" key={p.key}>
            <label>{p.label}{REQUIRED[entity] === p.key && ' *'}</label>
            <div className="prop-control"><PropertyInput prop={p} row={values} onChange={(v) => set(p.key, v)} /></div>
          </div>))}
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" disabled={saving} onClick={create}>Create</button>
      </div>
    </Modal>
  )
}
