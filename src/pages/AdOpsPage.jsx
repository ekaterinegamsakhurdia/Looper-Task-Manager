import { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, Users, AlertCircle } from 'lucide-react'
import { fetchAdCampaigns, updateAdCampaign } from '../lib/queries'
import { BRAND } from '../config/brand'

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function ReportStatusCell({ campaign }) {
  const days = daysSince(campaign.last_reported)
  if (!campaign.last_reported) return <span style={{ color: 'var(--text-dim)' }}>—</span>
  const isOverdue = days >= 30
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
      {isOverdue && <AlertCircle size={12} color="#EF4444" />}
      <span style={{ color: isOverdue ? '#EF4444' : 'var(--text-muted)' }}>
        {days === 0 ? 'Today' : `${days}d ago`}
      </span>
    </span>
  )
}

function TasksLinked({ campaign }) {
  const briefs = campaign.briefs || []
  if (briefs.length === 0) return <span style={{ color: 'var(--text-dim)' }}>—</span>
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {briefs.slice(0, 2).map(b => (
        <span key={b.id} className="chip" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</span>
      ))}
      {briefs.length > 2 && <span className="chip" style={{ color: 'var(--violet)' }}>+{briefs.length - 2}</span>}
    </div>
  )
}

function CampaignRow({ campaign, onStatusChange }) {
  const sc = BRAND.adCampaignStatuses[campaign.status] || BRAND.adCampaignStatuses['Awaiting Tasks']
  const initials = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
  const ams = [campaign.am_owner, campaign.advertiser].filter(Boolean)

  return (
    <tr>
      <td className="id-cell">{campaign.id?.toString().slice(0, 6) || '—'}</td>
      <td style={{ fontWeight: 500, fontSize: 13 }}>{campaign.name}</td>
      <td><TasksLinked campaign={campaign} /></td>
      <td>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
          {campaign.client?.name || '—'}
        </span>
      </td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {ams.map(a => (
            <div key={a.id} className="am-row">
              <div className="am-ava" style={{ width: 20, height: 20, fontSize: 9 }}>{initials(a.full_name)}</div>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{a.full_name}</span>
            </div>
          ))}
        </div>
      </td>
      <td>
        <select
          className="filter-select"
          style={{ fontSize: 12, padding: '3px 8px' }}
          value={campaign.status || ''}
          onChange={e => onStatusChange(campaign.id, e.target.value)}
        >
          {Object.keys(BRAND.adCampaignStatuses).map(s => <option key={s}>{s}</option>)}
        </select>
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
      </td>
      <td>
        {campaign.report_status ? (
          <span style={{ fontSize: 12 }}>{campaign.report_status}</span>
        ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {campaign.budget ? `$${Number(campaign.budget).toLocaleString()}` : '—'}
      </td>
      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
      </td>
      <td><ReportStatusCell campaign={campaign} /></td>
      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {campaign.am_owner?.full_name || '—'}
      </td>
    </tr>
  )
}

function ClientGroup({ clientName, campaigns, onStatusChange, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen ?? true)
  const tierCfg = campaigns[0]?.client?.tier ? BRAND.clientTiers[campaigns[0].client.tier] : null

  return (
    <div className="ad-ops-group">
      <div className="ad-ops-group-header" onClick={() => setOpen(v => !v)}>
        {open ? <ChevronDown size={15} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />}
        <span className="client-name">{clientName}</span>
        {tierCfg && <span className="tier-dot" style={{ background: tierCfg.color }} />}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</span>
      </div>
      {open && (
        <div className="ad-ops-group-table">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Campaign Name</th>
                <th>Tasks / Briefs</th>
                <th>Client</th>
                <th>Advertiser</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Report Status</th>
                <th>Budget</th>
                <th>End Date</th>
                <th>Last Reported</th>
                <th>AM Owner</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <CampaignRow key={c.id} campaign={c} onStatusChange={onStatusChange} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdOpsPage({ currentEmployee }) {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [myCampaigns, setMyCampaigns] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // all | live | due

  const load = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (search) filters.search = search
      if (filterStatus) filters.status = filterStatus
      if (myCampaigns && currentEmployee) filters.am_owner_id = currentEmployee.id
      const data = await fetchAdCampaigns(filters)
      setCampaigns(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, filterStatus, myCampaigns])

  const handleStatusChange = async (id, status) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    try { await updateAdCampaign(id, { status }) }
    catch { load() }
  }

  // Tab filter
  const tabFiltered = campaigns.filter(c => {
    if (activeTab === 'live') return c.status === 'Live'
    if (activeTab === 'due') return daysSince(c.last_reported) >= 30 || !c.last_reported
    return true
  })

  // Group by client
  const grouped = {}
  for (const c of tabFiltered) {
    const key = c.client?.name || 'Unknown'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(c)
  }
  const clientGroups = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]))

  const liveCount = campaigns.filter(c => c.status === 'Live').length
  const dueCount = campaigns.filter(c => daysSince(c.last_reported) >= 30 || !c.last_reported).length

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Ad Ops</div>
          <div className="page-subtitle">One row per running ad campaign · update Last Reported after each report sent</div>
        </div>
      </div>

      {/* Quick tabs */}
      <div className="tab-bar">
        <button className={`tab-btn${activeTab === 'all' ? ' active' : ''}`} onClick={() => setActiveTab('all')}>
          Table ({campaigns.length})
        </button>
        <button className={`tab-btn${activeTab === 'live' ? ' active' : ''}`} onClick={() => setActiveTab('live')}>
          My Campaigns
        </button>
        <button className={`tab-btn${activeTab === 'due' ? ' active' : ''}`} onClick={() => setActiveTab('due')}>
          Report Due {dueCount > 0 && <span style={{ color: '#EF4444', marginLeft: 4 }}>({dueCount})</span>}
        </button>
        <button className="tab-btn" onClick={() => {}}>Finished Campaigns</button>
      </div>

      <div className="filter-bar">
        <div className="filter-search">
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button
          className={`filter-btn${myCampaigns ? ' active' : ''}`}
          onClick={() => setMyCampaigns(v => !v)}
        ><Users size={12} /> My Campaigns</button>

        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.keys(BRAND.adCampaignStatuses).map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading && <div className="loading-row">Loading…</div>}

      {!loading && clientGroups.length === 0 && (
        <div className="empty-state"><p>No campaigns found.</p></div>
      )}

      {!loading && clientGroups.map(([clientName, cams], i) => (
        <ClientGroup
          key={clientName}
          clientName={clientName}
          campaigns={cams}
          onStatusChange={handleStatusChange}
          defaultOpen={i < 5}
        />
      ))}
    </div>
  )
}
