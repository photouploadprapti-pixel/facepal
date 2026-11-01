import { useFocusEffect, useRouter, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { AppButton, BrandMark } from '@/src/components/app-button'
import { AppIcon, IconChip } from '@/src/components/app-icon'
import { HabitSummary } from '@/src/components/habit-summary'
import { Screen } from '@/src/components/screen'
import { TrendSpark } from '@/src/components/trend-spark'
import { fetchCheckins, fetchHabitDay, fetchHabitDays } from '@/src/lib/data'
import { useAuth } from '@/src/lib/auth'
import {
  localDayKey,
  tonightFocus,
  weeklyHabitInsights,
} from '@/src/lib/habits'
import {
  ageFromBirthYear,
  checkinToAnalysis,
  compareReads,
  weeklyTrend,
} from '@/src/lib/skin-read'
import { streakFromDates } from '@/src/lib/streak'
import { colors, ui } from '@/src/theme/ui'
import type { Checkin, HabitDay } from '@/src/types/models'

/**
 * Home shows streak, habits, weekly notes, latest skin read, and scan actions.
 */
const HomeScreen = () => {
  const { profile, user } = useAuth()
  const router = useRouter()
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [todayHabit, setTodayHabit] = useState<HabitDay | null>(null)
  const [habitDays, setHabitDays] = useState<HabitDay[]>([])
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      let active = true
      Promise.all([
        fetchCheckins(),
        user ? fetchHabitDay(localDayKey()) : Promise.resolve(null),
        user ? fetchHabitDays(14) : Promise.resolve([]),
      ])
        .then(([rows, habit, habits]) => {
          if (!active) return
          setCheckins(rows)
          setTodayHabit(habit)
          setHabitDays(habits)
        })
        .catch((caught: unknown) => {
          if (active) setError(caught instanceof Error ? caught.message : 'Could not load')
        })
      return () => {
        active = false
      }
    }, [user]),
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
  const focus = tonightFocus(latestRead?.findings ?? [])
  const insightLines = weeklyHabitInsights(habitDays, checkins)

  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark size={42} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={ui.brand}>FacePal</Text>
          <Text style={ui.title}>Hello, {name}</Text>
        </View>
      </View>
      <Text style={ui.subtitle}>
        A calm daily check for skin quality, spots, and habits — not a medical diagnosis.
      </Text>

      <View style={styles.row}>
        <View style={[styles.stat, { backgroundColor: colors.plumSoft }]}>
          <IconChip name="flame" tone="mauve" />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.sky }]}>
          <IconChip name="sparkles" tone="sky" />
          <Text style={styles.statValue}>{latest ? latest.quality : '—'}</Text>
          <Text style={styles.statLabel}>skin quality</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.lilac }]}>
          <IconChip name="time" tone="mauve" />
          <Text style={styles.statValue}>
            {latestRead ? `+${latestRead.appearanceLoad}` : '—'}
          </Text>
          <Text style={styles.statLabel}>wear yrs</Text>
        </View>
      </View>

      {trend.length > 1 ? <TrendSpark points={trend} /> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}

      <HabitSummary
        habit={todayHabit}
        insightLines={insightLines}
        focusTitle={focus.title}
        focusBody={focus.body}
        yogaSlug={focus.yogaSlug}
      />

      {latestRead ? (
        <AnalysisCard
          analysis={latestRead}
          compareLines={compareLines}
          chronologicalAge={age}
        />
      ) : (
        <View style={[ui.card, { backgroundColor: colors.plumSoft }]}>
          <View style={styles.inline}>
            <AppIcon name="camera" size={18} color={colors.ink} />
            <Text style={ui.kicker}>Start your first read</Text>
          </View>
          <Text style={ui.body}>
            Capture a selfie in even light. FacePal checks spots, flush, under-eyes, texture,
            photo quality, and gives tips for that picture.
          </Text>
        </View>
      )}

      <AppButton
        label="Take today’s selfie"
        icon="camera"
        onPress={() => router.push('/scan')}
      />
      <AppButton
        label="Log skin habits"
        variant="ghost"
        icon="leaf-outline"
        onPress={() => router.push('/habits' as Href)}
      />
      <AppButton
        label="History"
        variant="ghost"
        icon="time-outline"
        onPress={() => router.push('/history')}
      />
      {checkins.length > 1 ? (
        <AppButton
          label="Compare photos"
          variant="ghost"
          icon="git-compare-outline"
          onPress={() => router.push('/compare')}
        />
      ) : null}
    </Screen>
  )
}

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  inline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  stat: {
    flex: 1,
    borderRadius: 22,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: colors.ink,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: colors.muted,
  },
}

export default HomeScreen
