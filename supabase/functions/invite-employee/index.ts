// invite-employee Edge Function
// Called by the app to invite a new employee via Supabase Auth email.
// Requires the service role key (set in Supabase Dashboard → Functions → Secrets).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Auth: only authenticated users can send invites ──────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Admin client (service role) ──────────────────────────
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // ── Verify caller is a valid employee ────────────────────
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Parse body ────────────────────────────────────────────
    const { employee_id, redirect_to } = await req.json()
    if (!employee_id) {
      return new Response(JSON.stringify({ error: 'employee_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Load employee record ──────────────────────────────────
    const { data: employee, error: empErr } = await adminClient
      .from('employees')
      .select('id, email, full_name, user_id')
      .eq('id', employee_id)
      .single()

    if (empErr || !employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (employee.user_id) {
      return new Response(JSON.stringify({ error: 'Employee already has an account' }), {
        status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Send Supabase invite email ────────────────────────────
    const { data: invited, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
      employee.email,
      {
        redirectTo: redirect_to ?? `${Deno.env.get('SITE_URL') ?? ''}/set-password`,
        data: { full_name: employee.full_name, employee_id: employee.id },
      }
    )

    if (inviteErr) {
      return new Response(JSON.stringify({ error: inviteErr.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Link auth user → employee row ─────────────────────────
    await adminClient
      .from('employees')
      .update({ user_id: invited.user.id, invite_sent_at: new Date().toISOString() })
      .eq('id', employee.id)

    return new Response(JSON.stringify({ ok: true, user_id: invited.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
