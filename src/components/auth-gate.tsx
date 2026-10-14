import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { useAuth } from '@/src/lib/auth'
import { colors } from '@/src/theme/ui'

/**
 * Sends people to sign-in, consent, or the main tabs.
 * @param children The router stack.
 */
export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { session, profile, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const group = segments[0]
    const inAuth = group === '(auth)'
    const onConsent = group === 'consent'
    if (!session) {
      if (!inAuth) router.replace('/sign-in')
      return
    }
    if (!profile?.consentAcceptedAt) {
      if (!onConsent) router.replace('/consent')
      return
    }
    if (inAuth || onConsent) router.replace('/')
  }, [loading, session, profile, segments, router])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.plum} />
      </View>
    )
  }

  return children
}
