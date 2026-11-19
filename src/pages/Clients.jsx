import { useState, useEffect } from 'react'
import { fetchClients } from '../lib/queries'
import BRAND from '../config/brand'

export function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients().then(d => { setClients(d); setLoading(false) })
  }, [])

  const tierColor = t => BRAND.clientTiers[t]?.color ?? '#8B9BB8'

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Clients</h1>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
        }}>
          {clients.map(c => (
            <div key={c.id} style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '16px',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700 }}>{c.name}</h3>
                <span style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                  color: tierColor(c.client_tier),
                  background: `${tierColor(c.client_tier)}18`,
                  border: `1px solid ${tierColor(c.client_tier)}30`,
                  borderRadius: 99, padding: '2px 7px',
                }}>
                  {c.client_tier}
                </span>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {c.industry && <span>{c.industry}</span>}
                <span>AM: {c.am_owner?.full_name ?? '—'}</span>
                {c.platforms?.length > 0 && (
                  <span style={{ color: 'var(--text-second)' }}>
                    {c.platforms.join(' · ')}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Clients
