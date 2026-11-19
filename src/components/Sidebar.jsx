import { LayoutGrid, List, FileText, Users, UsersRound } from 'lucide-react'
import BRAND from '../config/brand'

const NAV = [
  { id: 'board',    label: 'Board',     icon: LayoutGrid },
  { id: 'list',     label: 'My Tasks',  icon: List },
  { id: 'briefs',   label: 'Briefs',    icon: FileText },
  { id: 'clients',  label: 'Clients',   icon: Users },
  { id: 'team',     label: 'Team',      icon: UsersRound },
]

export function Sidebar({ activePage, onNav, currentUser }) {
  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      flexShrink: 0,
      background: 'var(--surface-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Logo */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'var(--violet)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
        }}>
          {BRAND.logoText}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {BRAND.appName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{BRAND.orgName}</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 'var(--r-md)',
                background: active ? 'var(--violet-dim)' : 'transparent',
                border: `1px solid ${active ? 'rgba(124,92,252,0.2)' : 'transparent'}`,
                color: active ? 'var(--violet)' : 'var(--text-second)',
                cursor: 'pointer',
                fontSize: 13, fontWeight: active ? 600 : 400,
                width: '100%', textAlign: 'left',
                transition: 'background 0.12s, color 0.12s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-3)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* User */}
      {currentUser && (
        <div style={{
          padding: '12px 12px',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: currentUser.avatar_color ?? 'var(--violet)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {currentUser.initials}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser.full_name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{currentUser.role}</div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
