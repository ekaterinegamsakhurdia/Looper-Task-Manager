import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { fetchClient } from '../lib/queries'
import { BRAND } from '../config/brand'

export default function ClientDrawer({ client, onClose, currentEmployee }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('campaigns')

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    fetchClient(client.id).then(d => { setDetail(d); setLoading(false) }).catch(() => setLoading(false))
  }, [client.id])

  const tierCfg = BRAND.clientTiers[client.tier] || BRAND.clientTiers.Standard
  const statusCfg = BRAND.clientStatuses[client.status] || BRAND.clientStatuses.Active
  const initials = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  const campaigns = detail?.ad_campaigns || []
  const briefs = detail?.briefs || []

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{client.name}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge" style={{ color: statusCfg.color, background: statusCfg.bg }}>{client.status || 'Active'}</span>
              {client.tier && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: tierCfg.color }}>
                  <span className="tier-dot" style={{ background: tierCfg.color }} />{client.tier}
                </span>
              )}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {/* Meta */}
          <div className="detail-grid">
            <div className="detail-item">
              <label>AM Owner</label>
              <div className="val">
                {client.am_owner ? (
                  <div className="am-row">
                    <div className="am-ava">{initials(client.am_owner.full_name)}</div>
                    {client.am_owner.full_name}
                  </div>
                ) : '—'}
              </div>
            </div>
            <div className="detail-item">
              <label>Industry</label>
              <div className="val">{client.industry || '—'}</div>
            </div>
            <div className="detail-item">
              <label>Platforms</label>
              <div className="val" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                {Array.isArray(client.platforms) && client.platforms.length > 0
                  ? client.platforms.map(p => <span key={p} className="badge-platform">{p}</span>)
                  : '—'}
              </div>
            </div>
            <div className="detail-item">
              <label>Total Briefs</label>
              <div className="val mono">{briefs.length}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 12 }}>
            <button className={`tab-btn${tab === 'campaigns' ? ' active' : ''}`} onClick={() => setTab('campaigns')}>
              Ad Campaigns ({campaigns.length})
            </button>
            <button className={`tab-btn${tab === 'briefs' ? ' active' : ''}`} onClick={() => setTab('briefs')}>
              Briefs ({briefs.length})
            </button>
          </div>

          {loading && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div>}

          {!loading && tab === 'campaigns' && (
            <div>
              {campaigns.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No campaigns yet.</div>}
              {campaigns.map(c => {
                const sc = BRAND.adCampaignStatuses[c.status] || BRAND.adCampaignStatuses['Awaiting Tasks']
                return (
                  <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                    <span className="badge" style={{ color: sc.color, background: sc.bg, flexShrink: 0 }}>{c.status}</span>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && tab === 'briefs' && (
            <div>
              {briefs.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No briefs yet.</div>}
              {briefs.map(b => (
                <div key={b.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13 }}>{b.title}</div>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
