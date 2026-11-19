import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// No login wall: everybody can use the app anonymously for now. Signing in with an
// email listed in `app_admins` unlocks the developer kit (Customize + saving views).
const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isDeveloper, setIsDeveloper] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const email = session?.user?.email || null
  useEffect(() => {
    let alive = true
    if (!email) { setIsDeveloper(false); setChecking(false); return }
    setChecking(true)
    // RLS: a signed-in user only sees their own app_admins row, a developer sees all.
    supabase.from('app_admins').select('email').then(({ data }) => {
      if (!alive) return
      setIsDeveloper(Array.isArray(data) && data.length > 0)
      setChecking(false)
    })
    return () => { alive = false }
  }, [email])

  const signIn = useCallback(async (mail, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: mail.trim(), password })
    return { error }
  }, [])
  const signOut = useCallback(() => supabase.auth.signOut(), [])

  const value = useMemo(() => ({ session, email, isDeveloper, checking, signIn, signOut }),
    [session, email, isDeveloper, checking, signIn, signOut])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
