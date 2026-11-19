import { useState, useEffect } from 'react'
import { Search, Plus, ChevronRight, Users } from 'lucide-react'
import { fetchClients } from '../lib/queries'
import { BRAND } from '../config/brand'
import ClientDrawer from '../components/ClientDrawer'

export default function ClientsPage({ currentEmployee }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [myClients, setMyClients] = useState(false)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (search) filters.search = search
      if (filterTier) filters.tier = filterTier
      if (filterStatus) filters.status = filterStatus
      if (myClients && currentEmployee) filters.am_owner_id = currentEmployee.id
      const data = await fetchClients(filters)
      setClients(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterTier, filterStatus, myClients])

  // client-side platform filter (platforms is an array column)
  const displayed = filterPlatform
    ? clients.filter(c => Array.isArray(c.platforms) && c.platforms.includes(filterPlatform))
    : clients

  const initials = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-subtitle">{displayed.length} client{displayed.length !== 1 ? 's' : ''}</div>
        </div>
        <button className="btn btn-primary"><Plus size={14} /> New Client</button>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search clients…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button
          className={`filter-btn${myClients ? ' active' : ''}`}
          onClick={() => setMyClients(v => !v)}
        ><Users size={12} /> My Clients</button>

        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.keys(BRAND.clientStatuses).map(s => <option key={s}>{s}</option>)}
        </select>

        <select className="filter-select" value={filterTier} onChange={e => setFilterTier(e.target.value)}>
          <option value="">All Tiers</option>
          {Object.keys(BRAND.clientTiers).map(t => <option key={t}>{t}</option>)}
        </select>

        <select className="filter-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
          <option value="">All Platforms</option>
          {BRAND.platforms.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>№</th>
              <th>Client Name</th>
              <th>AM Owner</th>
              <th>Status</th>
              <th>Client Tier</th>
              <th>Platforms</th>
              <th>Ad Campaigns</th>
              <th>Briefs</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={9} className="loading-row">Loading…</td></tr>
            )}
            {!loading && displayed.length === 0 && (
              <tr><td colSpan={9} className="loading-row" style={{ color: 'var(--text-muted)' }}>No clients found</td></tr>
            )}
            {!loading && displayed.map(client => {
              const tierCfg = BRAND.clientTiers[client.tier] || BRAND.clientTiers.Standard
              const statusCfg = BRAND.clientStatuses[client.status] || BRAND.clientStatuses.Active
              const campaigns = client.ad_campaigns || []
              const briefs = client.briefs || []
              return (
                <tr key={client.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(client)}>
                  <td className="id-cell">{client.row_number ?? client.id?.slice(0,4)}</td>
                  <td><strong style={{ fontSize: 13 }}>{client.name}</strong></td>
                  <td>
                    {client.am_owner ? (
                      <div className="am-row">
                        <div className="am-ava" style={{ background: 'var(--violet)', fontSize: 10 }}>
                          {initials(client.am_owner.full_name)}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{client.am_owner.full_name}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <span className="badge" style={{ color: statusCfg.color, background: statusCfg.bg }}>
                      {client.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    {client.tier ? (
                      <span style={{ display: 'flex', alignItems: 'center', fontSize: 12.5 }}>
                        <span className="tier-dot" style={{ background: tierCfg.color }} />
                        {client.tier}
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {Array.isArray(client.platforms) && client.platforms.length > 0 ? (
                      <div className="platforms-cell">
                        {client.platforms.map(p => (
                          <span key={p} className="badge-platform">{p}</span>
                        ))}
                      </div>
                    ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                  </td>
                  <td>
                    <div className="chips-row">
                      {campaigns.slice(0, 3).map(c => (
                        <span key={c.id} className="chip">{c.name}</span>
                      ))}
                      {campaigns.length > 3 && (
                        <span className="chip" style={{ color: 'var(--violet)' }}>+{campaigns.length - 3}</span>
                      )}
                      {campaigns.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {briefs.length}
                    </span>
                  </td>
                  <td><ChevronRight size={14} style={{ color: 'var(--text-dim)' }} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <ClientDrawer client={selected} onClose={() => setSelected(null)} currentEmployee={currentEmployee} />
      )}
    </div>
  )
}
