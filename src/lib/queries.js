import { supabase } from './supabase'

// ── Tasks ──────────────────────────────────────────────────────────────────
export async function fetchTasks(filters = {}) {
  let q = supabase.from('tasks_full').select('*')
  if (filters.stage)       q = q.eq('stage', filters.stage)
  if (filters.priority)    q = q.eq('priority', filters.priority)
  if (filters.department)  q = q.eq('department', filters.department)
  if (filters.brief_id)    q = q.eq('brief_id', filters.brief_id)
  if (filters.assigned_to) q = q.contains('assigned_to', [filters.assigned_to])
  if (filters.search)      q = q.ilike('title', `%${filters.search}%`)
  q = q.order('created_at', { ascending: false })
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function updateTaskStage(id, stage) {
  const { error } = await supabase.from('tasks').update({ stage, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function fetchComments(taskId) {
  const { data, error } = await supabase
    .from('task_comments').select('*, author:employees(id,full_name)')
    .eq('task_id', taskId).order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createComment(taskId, authorId, body) {
  const { data, error } = await supabase.from('task_comments').insert({ task_id: taskId, author_id: authorId, body }).select().single()
  if (error) throw error
  return data
}

export async function logBounce(taskId, type, note, employeeId) {
  const field = type === 'internal' ? 'bounce_internal' : 'bounce_client'
  const revField = type === 'internal' ? 'rev_internal' : 'rev_client'
  const { data: task } = await supabase.from('tasks').select(`${revField}`).eq('id', taskId).single()
  const newCount = (task?.[revField] || 0) + 1
  const { error } = await supabase.from('tasks').update({
    [field]: true, [revField]: newCount,
    stage: 'Bounced', updated_at: new Date().toISOString()
  }).eq('id', taskId)
  if (error) throw error
  await supabase.from('revision_log').insert({ task_id: taskId, bounce_type: type, note, logged_by: employeeId })
}

// ── Briefs ─────────────────────────────────────────────────────────────────
export async function fetchBriefs(filters = {}) {
  let q = supabase.from('briefs').select(`
    *, client:clients(id,name,tier), campaign:ad_campaigns(id,name),
    am_owner:employees!briefs_am_owner_id_fkey(id,full_name),
    copywriter:employees!briefs_copywriter_id_fkey(id,full_name)
  `)
  if (filters.client_id)   q = q.eq('client_id', filters.client_id)
  if (filters.campaign_id) q = q.eq('campaign_id', filters.campaign_id)
  if (filters.status)      q = q.eq('status', filters.status)
  if (filters.search)      q = q.ilike('title', `%${filters.search}%`)
  q = q.order('created_at', { ascending: false })
  const { data, error } = await q
  if (error) throw error
  return data || []
}

// ── Clients ────────────────────────────────────────────────────────────────
export async function fetchClients(filters = {}) {
  let q = supabase.from('clients').select(`
    *, am_owner:employees(id,full_name),
    ad_campaigns(id,name,status),
    briefs(id,title)
  `)
  if (filters.am_owner_id) q = q.eq('am_owner_id', filters.am_owner_id)
  if (filters.tier)        q = q.eq('tier', filters.tier)
  if (filters.status)      q = q.eq('status', filters.status)
  if (filters.search)      q = q.ilike('name', `%${filters.search}%`)
  q = q.order('name')
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function fetchClient(id) {
  const { data, error } = await supabase.from('clients').select(`
    *, am_owner:employees(id,full_name),
    ad_campaigns(id,name,status,start_date,end_date,budget,last_reported,report_status,advertiser_id),
    briefs(id,title,status,created_at)
  `).eq('id', id).single()
  if (error) throw error
  return data
}

// ── Ad Campaigns (Ad Ops) ──────────────────────────────────────────────────
export async function fetchAdCampaigns(filters = {}) {
  let q = supabase.from('ad_campaigns').select(`
    *, client:clients(id,name,tier,platforms),
    am_owner:employees!ad_campaigns_am_owner_id_fkey(id,full_name),
    advertiser:employees!ad_campaigns_advertiser_id_fkey(id,full_name),
    briefs(id,title,status)
  `)
  if (filters.am_owner_id) q = q.eq('am_owner_id', filters.am_owner_id)
  if (filters.client_id)   q = q.eq('client_id', filters.client_id)
  if (filters.status)      q = q.eq('status', filters.status)
  if (filters.search)      q = q.ilike('name', `%${filters.search}%`)
  q = q.order('client_id').order('start_date', { ascending: false })
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function updateAdCampaign(id, fields) {
  const { error } = await supabase.from('ad_campaigns').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

// ── Helpers ────────────────────────────────────────────────────────────────
export async function fetchEmployees() {
  const { data, error } = await supabase.from('employees').select('*').order('full_name')
  if (error) throw error
  return data || []
}

export async function fetchCampaigns() {
  const { data, error } = await supabase.from('ad_campaigns').select('id,name,client_id').order('name')
  if (error) throw error
  return data || []
}
