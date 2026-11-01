import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { AppIcon, IconChip } from '@/src/components/app-icon'
import { Screen } from '@/src/components/screen'
import { fetchRoutines } from '@/src/lib/data'
import { colors, ui } from '@/src/theme/ui'
import type { YogaRoutine } from '@/src/types/models'

/**
 * Lists face-yoga routines stored in Supabase.
 */
const YogaListScreen = () => {
  const router = useRouter()
  const [routines, setRoutines] = useState<YogaRoutine[]>([])
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchRoutines()
        .then((rows) => {
          if (active) setRoutines(rows)
        })
        .catch((caught: unknown) => {
          if (active) setError(caught instanceof Error ? caught.message : 'Could not load')
        })
      return () => {
        active = false
      }
    }, []),
  )

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <IconChip name="body" tone="mauve" />
        <Text style={ui.brand}>Practice</Text>
      </View>
      <Text style={ui.title}>Face yoga</Text>
      <Text style={ui.subtitle}>
        Short guided sessions for the jaw, eyes, forehead, and cheeks. Follow the animation,
        then the video when a routine has one.
      </Text>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {routines.map((routine) => (
        <Pressable
          key={routine.id}
          style={ui.card}
          onPress={() => router.push(`/yoga/${routine.slug}`)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <Text style={[ui.body, { fontWeight: '700', flex: 1 }]}>{routine.title}</Text>
            <AppIcon name="chevron-forward" size={18} color={colors.plum} />
          </View>
          <Text style={ui.muted}>
            {routine.zone} · {routine.minutes} min · {routine.level}
          </Text>
          <Text style={ui.muted}>{routine.summary}</Text>
        </Pressable>
      ))}
    </Screen>
  )
}

export default YogaListScreen
