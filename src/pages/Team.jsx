import { useState, useEffect } from 'react'
import { Mail, Check, Plus, X } from 'lucide-react'
import { fetchEmployees, inviteEmployee } from '../lib/queries'
import supabase from '../lib/supabase'
import BRAND from '../config/brand'
import Avatar from '../components/Avatar'

// ── Add Employee form ─────────────────────────────────────────
function AddEmployeeModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    full_name: '', email: '', role: 'Designer', department: 'Design',
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    setSaving(true); setErr(null)
    try {
      // Derive initials
      const parts = form.full_name.trim().split(' ')
      const initials = (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
      // Random avatar colour from brand palette
      const colors = ['#A78BFA','#7C5CFC','#F472B6','#34D399','#60A5FA','#FB923C','#F9A8D4','#38BDF8','#818CF8','#FCD34D']
      const avatar_color = colors[Math.floor(Math.random() * colors.length)]

      const { data, error } = await supabase
        .from('employees')
        .insert({ ...form, initials, avatar_color })
        .select()
        .single()

      if (error) throw error
      onAdded(data)
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px',
    background: 'var(--surface-3)', border: '1px solid var(--border)',
    borderRadius: 'var(--r-md)', color: 'var(--text-primary)',
    fontSize: 13, fontFamily: 'var(--font-ui)', outline: 'none',
  }
  const selectStyle = { ...inputStyle }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40,
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 420, background: 'var(--surface-1)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-xl)',
        padding: 24, zIndex: 50,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Add employee</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full name</label>
            <input required style={inputStyle} value={form.full_name} onChange={set('full_name')}
              placeholder="e.g. Mariami Kvaratskhelia" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
              letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
            <input required type="email" style={inputStyle} value={form.email} onChange={set('email')}
              placeholder="email@looperagency.ge" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role</label>
              <select style={selectStyle} value={form.role} onChange={set('role')}>
                {BRAND.roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                letterSpacing: '0.05em', textTransform: 'uppercase' }}>Department</label>
              <select style={selectStyle} value={form.department} onChange={set('department')}>
                <option value="">—</option>
                {Object.keys(BRAND.departments).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {err && <p style={{ fontSize: 12, color: 'var(--p1)' }}>{err}</p>}

          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            The employee is added without an account. Send them an invite email whenever you're ready.
          </p>

          <button type="submit" disabled={saving} style={{
            padding: '9px', borderRadius: 'var(--r-md)',
            background: 'var(--violet)', border: 'none',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Adding…' : 'Add employee'}
          </button>
        </form>
      </div>
    </>
  )
}

// ── Team page ─────────────────────────────────────────────────
export function Team() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [inviting, setInviting]   = useState({})   // { [id]: 'sending' | 'done' | 'error' }
  const [inviteMsg, setInviteMsg] = useState({})

  const load = () => {
    // fetch all employees including inactive
    supabase.from('employees').select('*').order('full_name')
      .then(({ data }) => { setEmployees(data ?? []); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const sendInvite = async emp => {
    setInviting(s => ({ ...s, [emp.id]: 'sending' }))
    setInviteMsg(s => ({ ...s, [emp.id]: '' }))
    try {
      await inviteEmployee(emp.id)
      setInviting(s => ({ ...s, [emp.id]: 'done' }))
      setInviteMsg(s => ({ ...s, [emp.id]: 'Invite sent ✓' }))
      load() // refresh to show invite_sent_at
    } catch (e) {
      setInviting(s => ({ ...s, [emp.id]: 'error' }))
      setInviteMsg(s => ({ ...s, [emp.id]: e.message }))
    }
  }

  const deptColor = d => BRAND.departments[d]?.color ?? '#8B9BB8'

  return (
    <div style={{ padding: 24, flex: 1, overflowY: 'auto', maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700 }}>Team</h1>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--violet)', border: 'none',
            color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Add employee
        </button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {employees.map((emp, i) => {
            const hasAccount  = !!emp.user_id
            const inviteSent  = !!emp.invite_sent_at
            const pending     = inviting[emp.id]
            const noAccount   = !hasAccount

            return (
              <div
                key={emp.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr 90px 80px 130px 120px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 16px',
                  background: i % 2 === 0 ? 'var(--surface-1)' : 'var(--surface-2)',
                  borderBottom: i < employees.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: noAccount && !inviteSent ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {/* Avatar */}
                <Avatar
                  name={emp.full_name}
                  initials={emp.initials}
                  color={emp.avatar_color}
                  size={32}
                />

                {/* Name + email */}
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.full_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {emp.email}
                  </div>
                </div>

                {/* Role */}
                <span style={{ fontSize: 11, color: 'var(--text-second)', whiteSpace: 'nowrap' }}>
                  {emp.role}
                </span>

                {/* Department */}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: emp.department ? deptColor(emp.department) : 'var(--text-muted)',
                }}>
                  {emp.department ?? '—'}
                </span>

                {/* Account status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {hasAccount ? (
                    <span style={{
                      fontSize: 11, color: 'var(--s-approved)',
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.2)',
                      borderRadius: 99, padding: '2px 8px',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Check size={10} /> Active
                    </span>
                  ) : inviteSent ? (
                    <span style={{
                      fontSize: 11, color: 'var(--p2)',
                      background: 'rgba(244,163,42,0.1)',
                      border: '1px solid rgba(244,163,42,0.2)',
                      borderRadius: 99, padding: '2px 8px',
                    }}>
                      Invite sent
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11, color: 'var(--text-muted)',
                      background: 'var(--surface-3)',
                      border: '1px solid var(--border)',
                      borderRadius: 99, padding: '2px 8px',
                    }}>
                      No account
                    </span>
                  )}
                </div>

                {/* Invite button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
                  {!hasAccount && (
                    <button
                      onClick={() => sendInvite(emp)}
                      disabled={pending === 'sending'}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 'var(--r-sm)',
                        background: pending === 'done' ? 'rgba(16,185,129,0.1)' : 'var(--violet-dim)',
                        border: `1px solid ${pending === 'done' ? 'rgba(16,185,129,0.2)' : 'rgba(124,92,252,0.25)'}`,
                        color: pending === 'done' ? 'var(--s-approved)' : 'var(--violet)',
                        fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        opacity: pending === 'sending' ? 0.5 : 1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Mail size={11} />
                      {pending === 'sending' ? 'Sending…'
                        : pending === 'done'    ? 'Sent!'
                        : inviteSent            ? 'Resend invite'
                        : 'Send invite'}
                    </button>
                  )}
                  {inviteMsg[emp.id] && pending === 'error' && (
                    <span style={{ fontSize: 10, color: 'var(--p1)' }}>{inviteMsg[emp.id]}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onAdded={emp => { setEmployees(prev => [...prev, emp].sort((a,b) => a.full_name.localeCompare(b.full_name))) }}
        />
      )}
    </div>
  )
}

export default Team
