import type { Session, User } from '@supabase/supabase-js'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { parseProfile } from '@/src/lib/guards'
import { supabase } from '@/src/lib/supabase'
import type { Profile } from '@/src/types/models'

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>
  signOut: () => Promise<void>
  acceptConsent: () => Promise<void>
  updateReminderHour: (hour: number) => Promise<void>
  updateBirthYear: (year: number | null) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Loads or creates the profile row for the signed-in user.
 * @param user Auth user.
 */
const ensureProfile = async (user: User): Promise<Profile | null> => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw new Error(error.message)
  if (data) return parseProfile(data)
  const metaName = user.user_metadata.display_name
  const displayName = typeof metaName === 'string' ? metaName : ''
  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert({ id: user.id, display_name: displayName })
    .select('*')
    .single()
  if (insertError) throw new Error(insertError.message)
  return parseProfile(inserted)
}

/**
 * Holds auth session and profile for the whole app.
 * @param children Routed screens.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    const user = session?.user
    if (!user) {
      setProfile(null)
      return
    }
    setProfile(await ensureProfile(user))
  }, [session])

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session?.user) {
        try {
          setProfile(await ensureProfile(data.session.user))
        } catch {
          setProfile(null)
        }
      }
      setLoading(false)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next?.user) {
        setProfile(null)
        return
      }
      ensureProfile(next.user)
        .then((nextProfile) => {
          if (active) setProfile(nextProfile)
        })
        .catch(() => {
          if (active) setProfile(null)
        })
    })
    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw new Error(error.message)
    if (!data.session) return 'Check your email to confirm the account, then sign in.'
    return null
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }, [])

  const acceptConsent = useCallback(async () => {
    const userId = session?.user.id
    if (!userId) throw new Error('Sign in first')
    const { data, error } = await supabase
      .from('profiles')
      .update({ consent_accepted_at: new Date().toISOString() })
      .eq('id', userId)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    const next = parseProfile(data)
    if (!next) throw new Error('Could not save consent')
    setProfile(next)
  }, [session])

  const updateReminderHour = useCallback(
    async (hour: number) => {
      const userId = session?.user.id
      if (!userId) throw new Error('Sign in first')
      const { data, error } = await supabase
        .from('profiles')
        .update({ reminder_hour: hour })
        .eq('id', userId)
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      const next = parseProfile(data)
      if (next) setProfile(next)
    },
    [session],
  )

  const updateBirthYear = useCallback(
    async (year: number | null) => {
      const userId = session?.user.id
      if (!userId) throw new Error('Sign in first')
      const { data, error } = await supabase
        .from('profiles')
        .update({ birth_year: year })
        .eq('id', userId)
        .select('*')
        .single()
      if (error) throw new Error(error.message)
      const next = parseProfile(data)
      if (next) setProfile(next)
    },
    [session],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      acceptConsent,
      updateReminderHour,
      updateBirthYear,
    }),
    [
      session,
      profile,
      loading,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      acceptConsent,
      updateReminderHour,
      updateBirthYear,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Reads the auth context. Throws if used outside AuthProvider.
 */
export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}
