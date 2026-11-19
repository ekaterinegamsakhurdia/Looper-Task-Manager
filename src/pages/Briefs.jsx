import { useState, useEffect } from 'react'
import { fetchBriefs } from '../lib/queries'
import BRAND from '../config/brand'

const statusColor = s => ({
  Copy: 'var(--d-copy)', Design: 'var(--d-design)',
  Production: 'var(--d-production)', Done: 'var(--s-approved)', Archived: 'var(--text-muted)'
})[s] ?? 'var(--text-muted)'

export function Briefs() {
  const [briefs, setBriefs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState(null)

  useEffect(() => {
    fetchBriefs(filter ? { status: filter } : {})
      .then(d => { setBriefs(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [filter])

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Briefs</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {[null, ...BRAND.briefStatuses].map(s => (
            <button
              key={s ?? 'all'}
              onClick={() => setFilter(s)}
              style={{
                padding: '4px 12px', borderRadius: 99,
                fontSize: 11, fontWeight: 600,
                background: filter === s ? 'var(--violet-dim)' : 'var(--surface-2)',
                border: `1px solid ${filter === s ? 'var(--violet)' : 'var(--border)'}`,
                color: filter === s ? 'var(--violet)' : 'var(--text-second)',
                cursor: 'pointer',
              }}
            >
              {s ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 12,
        }}>
          {briefs.map(brief => {
            const countMatch = brief.committed_task_count === 0 ||
              brief.actual_count === brief.committed_task_count
            return (
              <div key={brief.id} style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                {/* Header */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
                    color: statusColor(brief.status), background: `${statusColor(brief.status)}18`,
                    border: `1px solid ${statusColor(brief.status)}30`,
                    borderRadius: 99, padding: '2px 7px', flexShrink: 0, marginTop: 2,
                  }}>
                    {brief.status}
                  </span>
                  <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: 'var(--text-primary)' }}>
                    {brief.title}
                  </p>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {brief.client?.name ?? '—'} · {brief.brief_type}
                  </span>
                  <span
                    title="committed vs actual task count"
                    style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)',
                      color: countMatch ? 'var(--s-approved)' : 'var(--p1)',
                      background: countMatch ? 'rgba(16,185,129,0.1)' : 'rgba(248,92,92,0.1)',
                      border: `1px solid ${countMatch ? 'rgba(16,185,129,0.2)' : 'rgba(248,92,92,0.2)'}`,
                      borderRadius: 99, padding: '2px 7px',
                    }}
                  >
                    {countMatch ? '✓' : '✗'} {brief.committed_task_count} tasks
                  </span>
                </div>

                {/* AM + deadline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>AM: {brief.am_owner?.full_name ?? '—'}</span>
                  {brief.copy_deadline && (
                    <span>Copy by {new Date(brief.copy_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Briefs
