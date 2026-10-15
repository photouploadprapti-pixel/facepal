import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { Screen } from '@/src/components/screen'
import { fetchCheckins } from '@/src/lib/data'
import { useAuth } from '@/src/lib/auth'
import { checkinToAnalysis, compareReads } from '@/src/lib/skin-read'
import { streakFromDates } from '@/src/lib/streak'
import { colors, ui } from '@/src/theme/ui'
import type { Checkin } from '@/src/types/models'

/**
 * Home shows the streak, the latest skin read, and the daily scan action.
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
  const previous = checkins[1]
  const streak = streakFromDates(checkins.map((row) => row.capturedAt))
  const name = profile?.displayName ? profile.displayName : 'there'
  const latestRead = latest ? checkinToAnalysis(latest) : null
  const compareLines =
    latestRead && previous ? compareReads(latestRead, previous, streak) : []

  return (
    <Screen>
      <Text style={ui.muted}>FacePal</Text>
      <Text style={ui.title}>Hello, {name}</Text>
      <View style={styles.row}>
        <View style={[styles.stat, { backgroundColor: colors.lilac }]}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>{streak === 1 ? 'day streak' : 'day streak'}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.mint }]}>
          <Text style={styles.statValue}>{latest ? latest.quality : '—'}</Text>
          <Text style={styles.statLabel}>skin quality</Text>
        </View>
      </View>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {latestRead ? (
        <AnalysisCard analysis={latestRead} compareLines={compareLines} />
      ) : (
        <View style={[ui.card, { backgroundColor: colors.sky }]}>
          <Text style={ui.body}>
            Your first selfie gets a skin read: spots, flush, under-eyes, texture, and tips.
          </Text>
        </View>
      )}
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

const styles = {
  row: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  stat: {
    flex: 1,
    borderRadius: 28,
    padding: 18,
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: colors.ink,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.ink,
  },
}

export default HomeScreen
