import { useEffect, useState } from 'react'
import { FileText, LayoutGrid, LogIn, LogOut, Radio, Settings, ShieldCheck, Users } from 'lucide-react'
import { supabaseConfigured } from './lib/supabase'
import { BRAND } from './config/brand'
import { alpha, darken } from './lib/color'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useData } from './context/DataContext'
import { Modal } from './components/ui'
import DatabasePage from './pages/DatabasePage'
import SettingsPage from './pages/SettingsPage'

const NAV = [
  { id: 'tasks', label: 'Tasks', Icon: LayoutGrid },
  { id: 'briefs', label: 'Briefs', Icon: FileText },
  { id: 'clients', label: 'Clients', Icon: Users },
  { id: 'campaigns', label: 'Ad Ops', Icon: Radio },
]

function SetupScreen() {
  return (
    <div className="center-screen"><div className="center-card left">
      <h2>One more step: connect Supabase</h2>
      <p>Create a file named <code>.env</code> next to <code>package.json</code> with:</p>
      <pre>{`VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-public-key`}</pre>
      <p className="muted-note">Both values are in Supabase → Project Settings → API Keys / Data API. Then restart <code>npm run dev</code>.</p>
    </div></div>
  )
}

function ErrorScreen({ message }) {
  const missing = /schema cache|does not exist|relation|Could not find/i.test(message)
  const badKey = /api key|jwt/i.test(message)
  return (
    <div className="center-screen"><div className="center-card left">
      <h2>Can't load the data</h2>
      {missing && <p>The database tables don't exist yet. In Supabase → SQL Editor run, in order: <code>01_schema.sql</code>, <code>02_defaults.sql</code>, <code>03_test_data.sql</code>.</p>}
      {badKey && <p>Supabase rejected the key. Re-copy the <strong>anon / public</strong> key into <code>.env</code> and restart the dev server.</p>}
      <pre>{message}</pre>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
    </div></div>
  )
}

function LoginModal({ onClose }) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    const { error: err } = await signIn(email, password)
    setBusy(false)
    if (err) setError(err.message); else onClose()
  }
  return (
    <Modal title="Developer sign-in" onClose={onClose} width={380}>
      <form onSubmit={submit}>
        <div className="field"><label>Email</label>
          <input className="form-input" type="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></div>
        <div className="field"><label>Password</label>
          <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></div>
        {error && <div className="form-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy || !email || !password}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Shell() {
  const { status, settings, toasts, employees, meId, setViewingAs } = useData()
  const { email, isDeveloper, signOut } = useAuth()
  const [page, setPage] = useState(() => { try { return localStorage.getItem(`${BRAND.slug}:page`) || 'tasks' } catch { return 'tasks' } })
  const [login, setLogin] = useState(false)
  const go = (id) => { setPage(id); try { localStorage.setItem(`${BRAND.slug}:page`, id) } catch { /* ignore */ } }

  useEffect(() => {
    const r = document.documentElement.style
    r.setProperty('--violet', settings.accent)
    r.setProperty('--violet-hover', darken(settings.accent))
    r.setProperty('--violet-soft', alpha(settings.accent, 0.15))
    document.title = settings.app_name
  }, [settings.accent, settings.app_name])

  if (status.error) return <ErrorScreen message={status.error} />
  if (status.loading) return <div className="center-screen"><div className="muted-note">Loading…</div></div>

  const nav = [...NAV, ...(isDeveloper ? [{ id: 'settings', label: 'Customize', Icon: Settings }] : [])]
  const current = nav.some((n) => n.id === page) || page === 'settings' ? page : 'tasks'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">{settings.logo_text}</div>
          <div><div className="logo-name">{settings.app_name}</div><div className="logo-org">{settings.org_name}</div></div>
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ id, label, Icon }) => (
            <button key={id} className={`nav-item${current === id ? ' active' : ''}`} onClick={() => go(id)}><Icon size={15} />{label}</button>))}
        </nav>
        <div className="sidebar-foot">
          <label className="viewing-as">Viewing as
            <select value={meId || 'none'} onChange={(e) => setViewingAs(e.target.value === 'none' ? null : e.target.value)}>
              <option value="none">Nobody (everyone)</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </label>
          {email ? (
            <div className="acct">
              <span className="acct-mail" title={email}>{isDeveloper && <ShieldCheck size={13} />}{isDeveloper ? 'Developer' : email}</span>
              <button className="icon-btn" title="Sign out" aria-label="Sign out" onClick={signOut}><LogOut size={14} /></button>
            </div>
          ) : (
            <button className="btn btn-ghost full" onClick={() => setLogin(true)}><LogIn size={14} /> Developer sign-in</button>)}
        </div>
      </aside>

      <main className="main-area"><div className="page-body">
        {current === 'settings' ? <SettingsPage onSignIn={() => setLogin(true)} />
          : <DatabasePage key={current} entity={current} />}
      </div></main>

      {login && <LoginModal onClose={() => setLogin(false)} />}
      <div className="toasts">{toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>)}</div>
    </div>
  )
}

export default function App() {
  if (!supabaseConfigured) return <SetupScreen />
  return <AuthProvider><DataProvider><Shell /></DataProvider></AuthProvider>
}
