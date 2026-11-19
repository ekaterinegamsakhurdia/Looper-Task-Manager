import { useEffect, useState } from 'react'
import { AlertTriangle, MessageCircle, Send } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useData } from '../context/DataContext'
import { Avatar } from './ui'

const when = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

/** Bounce buttons, revision history and comments — shown under a task's properties. */
export default function TaskExtras({ task }) {
  const { meId, maps, settings, getOptions, updateRow, notify } = useData()
  const [bounce, setBounce] = useState(null)       // 'internal' | 'client' | null
  const [note, setNote] = useState('')
  const [revisions, setRevisions] = useState([])
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    let alive = true
    supabase.from('revision_log').select('*').eq('task_id', task.id).order('created_at', { ascending: false })
      .then(({ data }) => alive && setRevisions(data || []))
    supabase.from('task_comments').select('*').eq('task_id', task.id).order('created_at', { ascending: true })
      .then(({ data }) => alive && setComments(data || []))
    const ch = supabase.channel(`task-${task.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${task.id}` },
        (p) => setComments((c) => (c.some((x) => x.id === p.new.id) ? c : [...c, p.new])))
      .subscribe()
    return () => { alive = false; supabase.removeChannel(ch) }
  }, [task.id])

  const confirmBounce = async () => {
    const internal = bounce === 'internal'
    const stageExists = getOptions('stage').some((o) => o.value === settings.bounce_stage)
    const patch = internal
      ? { bounce_internal: true, rev_internal: (task.rev_internal || 0) + 1 }
      : { bounce_client: true, rev_client: (task.rev_client || 0) + 1 }
    if (stageExists) patch.stage = settings.bounce_stage
    const { error } = await updateRow('tasks', task.id, patch)
    if (error) return
    const { data } = await supabase.from('revision_log')
      .insert({ task_id: task.id, bounce_type: bounce, note: note.trim() || null, logged_by: meId }).select().single()
    if (data) setRevisions((r) => [data, ...r])
    notify(`Bounced (${bounce})${stageExists ? ` → ${settings.bounce_stage}` : ''}`)
    setBounce(null); setNote('')
  }

  const post = async () => {
    if (!text.trim()) return
    const { data, error } = await supabase.from('task_comments')
      .insert({ task_id: task.id, author_id: meId, body: text.trim() }).select().single()
    if (error) return notify(error.message, 'error')
    setComments((c) => (c.some((x) => x.id === data.id) ? c : [...c, data]))
    setText('')
  }

  return (
    <>
      <section className="drawer-section">
        <h4>Bounce <span className="muted-note">AM only — sends the task back for revision</span></h4>
        <div className="row-gap">
          <button className="btn btn-ghost warn" onClick={() => setBounce(bounce === 'internal' ? null : 'internal')}><AlertTriangle size={13} /> Internal bounce</button>
          <button className="btn btn-ghost amber" onClick={() => setBounce(bounce === 'client' ? null : 'client')}><AlertTriangle size={13} /> Client bounce</button>
        </div>
        {bounce && (
          <div className="row-gap top">
            <input className="form-input slim grow" autoFocus placeholder={`What needs to change? (${bounce} bounce)`} value={note}
              onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmBounce()} />
            <button className="btn btn-primary" onClick={confirmBounce}>Confirm</button>
          </div>)}
        {revisions.length > 0 && (
          <ul className="revlist">
            {revisions.map((r) => (
              <li key={r.id}>
                <span className={`rev-pill ${r.bounce_type}`}>{r.bounce_type}</span>
                <span className="grow">{r.note || <em>No note</em>}</span>
                <span className="muted-note">{maps.employees.get(String(r.logged_by)) || ''} · {when(r.created_at)}</span>
              </li>))}
          </ul>)}
      </section>

      <section className="drawer-section">
        <h4><MessageCircle size={13} /> Comments ({comments.length})</h4>
        <div className="comments">
          {comments.map((c) => {
            const name = maps.employees.get(String(c.author_id)) || 'Guest'
            return (
              <div className="comment" key={c.id}>
                <Avatar name={name} size={24} />
                <div><div className="comment-head"><strong>{name}</strong><span className="muted-note">{when(c.created_at)}</span></div><div>{c.body}</div></div>
              </div>)
          })}
          {comments.length === 0 && <div className="muted-note">No comments yet.</div>}
        </div>
        <div className="row-gap top">
          <input className="form-input slim grow" placeholder="Write a comment…" value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && post()} />
          <button className="btn btn-primary" aria-label="Send comment" onClick={post}><Send size={13} /></button>
        </div>
      </section>
    </>
  )
}
