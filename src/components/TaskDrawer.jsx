import { useState, useEffect } from 'react'
import { X, AlertTriangle, MessageCircle, Send } from 'lucide-react'
import { BRAND } from '../config/brand'
import { fetchComments, createComment, logBounce } from '../lib/queries'
import { supabase } from '../lib/supabase'

export default function TaskDrawer({ task, onClose, currentEmployee, onUpdate }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [bouncingType, setBouncingType] = useState(null)
  const [bounceNote, setBounceNote] = useState('')

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!task) return
    fetchComments(task.id).then(setComments).catch(() => {})
    const ch = supabase.channel(`comments-${task.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_comments', filter: `task_id=eq.${task.id}` },
        payload => setComments(prev => [...prev, payload.new]))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [task?.id])

  const submitComment = async () => {
    if (!newComment.trim() || !currentEmployee) return
    setPosting(true)
    await createComment(task.id, currentEmployee.id, newComment.trim())
    setNewComment('')
    setPosting(false)
  }

  const submitBounce = async () => {
    if (!bouncingType) return
    await logBounce(task.id, bouncingType, bounceNote, currentEmployee?.id)
    setBounceNote(''); setBouncingType(null)
    if (onUpdate) onUpdate()
    onClose()
  }

  if (!task) return null
  const stageCfg = BRAND.stages.find(s => s.id === task.stage) || BRAND.stages[0]
  const priorityCfg = BRAND.priorities[task.priority]
  const initials = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em' }}>
              {task.client_name} · {task.brief_title}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{task.title}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <span className="stage-pill" style={{ background: stageCfg.color + '22', color: stageCfg.color }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: stageCfg.color, display: 'inline-block' }} />
                {task.stage}
              </span>
              {priorityCfg && (
                <span className="priority-pill" style={{ background: priorityCfg.bg, color: priorityCfg.color }}>
                  {task.priority}
                </span>
              )}
              {task.bounce_internal && <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>↩ Internal</span>}
              {task.bounce_client && <span className="badge" style={{ background: 'rgba(239,68,68,0.15)', color: '#F59E0B' }}>↩ Client</span>}
            </div>
          </div>
          <button className="drawer-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="drawer-body">
          {/* Details */}
          <div className="detail-grid">
            <div className="detail-item"><label>Department</label><div className="val">{task.department || '—'}</div></div>
            <div className="detail-item"><label>Type</label><div className="val">{task.task_type || '—'}</div></div>
            <div className="detail-item"><label>AM</label><div className="val">{task.am_name || '—'}</div></div>
            <div className="detail-item">
              <label>Revisions</label>
              <div className="val mono" style={{ fontSize: 13 }}>
                Int: {task.rev_internal ?? 0} · Client: {task.rev_client ?? 0}
              </div>
            </div>
            <div className="detail-item"><label>Deadline</label><div className="val">{task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}</div></div>
            <div className="detail-item"><label>Created</label><div className="val">{task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}</div></div>
          </div>

          {/* Bounce buttons */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 8 }}>BOUNCE</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, borderColor: '#EF444466', color: '#EF4444' }}
                onClick={() => setBouncingType(t => t === 'internal' ? null : 'internal')}
              ><AlertTriangle size={13} /> Bounce Internal</button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: 12, borderColor: '#F59E0B66', color: '#F59E0B' }}
                onClick={() => setBouncingType(t => t === 'client' ? null : 'client')}
              ><AlertTriangle size={13} /> Bounce Client</button>
            </div>
            {bouncingType && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input
                  className="form-input"
                  style={{ flex: 1, fontSize: 12 }}
                  placeholder={`Note for ${bouncingType} bounce…`}
                  value={bounceNote}
                  onChange={e => setBounceNote(e.target.value)}
                />
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={submitBounce}>Confirm</button>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 10 }}>
              <MessageCircle size={12} style={{ display: 'inline', marginRight: 5 }} />
              COMMENTS ({comments.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto', marginBottom: 12 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <div className="am-ava" style={{ flexShrink: 0, marginTop: 1 }}>{initials(c.author?.full_name || 'U')}</div>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 2 }}>{c.author?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{c.body}</div>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>No comments yet.</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                style={{ flex: 1, fontSize: 13 }}
                placeholder="Add a comment…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
              />
              <button className="btn btn-primary" onClick={submitComment} disabled={posting}>
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
