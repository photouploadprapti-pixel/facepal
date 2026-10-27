import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { AppButton } from '@/src/components/app-button'
import { Screen } from '@/src/components/screen'
import { TrendSpark } from '@/src/components/trend-spark'
import { fetchCheckins } from '@/src/lib/data'
import { useAuth } from '@/src/lib/auth'
import {
  ageFromBirthYear,
  checkinToAnalysis,
  compareReads,
  weeklyTrend,
} from '@/src/lib/skin-read'
import { streakFromDates } from '@/src/lib/streak'
import { colors, ui } from '@/src/theme/ui'
import type { Checkin } from '@/src/types/models'

/**
 * Home shows streak, weekly trend, latest skin read, and daily scan actions.
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
  const age = ageFromBirthYear(profile?.birthYear ?? null)
  const trend = weeklyTrend(checkins)

  return (
    <Screen>
      <Text style={ui.brand}>FacePal</Text>
      <Text style={ui.title}>Hello, {name}</Text>
      <Text style={ui.subtitle}>
        A calm daily check for skin quality, spots, and habits — not a medical diagnosis.
      </Text>

      <View style={styles.row}>
        <View style={[styles.stat, { backgroundColor: colors.mint }]}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.sky }]}>
          <Text style={styles.statValue}>{latest ? latest.quality : '—'}</Text>
          <Text style={styles.statLabel}>skin quality</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.lilac }]}>
          <Text style={styles.statValue}>
            {latestRead ? `+${latestRead.appearanceLoad}` : '—'}
          </Text>
          <Text style={styles.statLabel}>wear yrs</Text>
        </View>
      </View>

      {trend.length > 1 ? <TrendSpark points={trend} /> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}

      {latestRead ? (
        <AnalysisCard
          analysis={latestRead}
          compareLines={compareLines}
          chronologicalAge={age}
        />
      ) : (
        <View style={[ui.card, { backgroundColor: colors.sky }]}>
          <Text style={ui.kicker}>Start your first read</Text>
          <Text style={ui.body}>
            Capture a selfie in even light. FacePal checks spots, flush, under-eyes, texture,
            photo quality, and gives tips for that picture.
          </Text>
        </View>
      )}

      <AppButton label="Take today’s selfie" onPress={() => router.push('/scan')} />
      <AppButton label="History" variant="ghost" onPress={() => router.push('/history')} />
      {checkins.length > 1 ? (
        <AppButton label="Compare photos" variant="ghost" onPress={() => router.push('/compare')} />
      ) : null}
    </Screen>
  )
}

const styles = {
  row: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.ink,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.muted,
  },
}

export default HomeScreen
