import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Screen } from '@/src/components/screen'
import { fetchCheckins } from '@/src/lib/data'
import { useAuth } from '@/src/lib/auth'
import { streakFromDates } from '@/src/lib/streak'
import { ui } from '@/src/theme/ui'
import type { Checkin } from '@/src/types/models'

/**
 * Home shows the streak, the latest summary, and the daily scan action.
 */
const HomeScreen = () => {
  const { profile } = useAuth()
  const router = useRouter()
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchCheckins()
        .then((rows) => {
          if (active) setCheckins(rows)
        })
        .catch((caught: unknown) => {
          if (active) setError(caught instanceof Error ? caught.message : 'Could not load')
        })
      return () => {
        active = false
      }
    }, []),
  )

  const latest = checkins[0]
  const streak = streakFromDates(checkins.map((row) => row.capturedAt))
  const name = profile?.displayName ? profile.displayName : 'there'

  return (
    <Screen>
      <Text style={ui.title}>Hello, {name}</Text>
      <ViewCard label="Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} />
      <ViewCard label="Latest check" value={latest ? latest.summary : 'No selfie yet today.'} />
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <Pressable style={ui.button} onPress={() => router.push('/scan')}>
        <Text style={ui.buttonText}>Take today’s selfie</Text>
      </Pressable>
      <Pressable style={ui.ghost} onPress={() => router.push('/history')}>
        <Text style={ui.ghostText}>History</Text>
      </Pressable>
      {checkins.length > 1 ? (
        <Pressable style={ui.ghost} onPress={() => router.push('/compare')}>
          <Text style={ui.ghostText}>Compare photos</Text>
        </Pressable>
      ) : null}
    </Screen>
  )
}

type ViewCardProps = {
  label: string
  value: string
}

/**
 * Small home card with a label and one sentence.
 * @param label Card heading.
 * @param value Detail text.
 */
const ViewCard = ({ label, value }: ViewCardProps) => (
  <View style={ui.card}>
    <Text style={ui.muted}>{label}</Text>
    <Text style={ui.body}>{value}</Text>
  </View>
)

export default HomeScreen
