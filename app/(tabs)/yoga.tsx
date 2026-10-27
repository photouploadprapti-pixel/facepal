import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text } from 'react-native'

import { Screen } from '@/src/components/screen'
import { fetchRoutines } from '@/src/lib/data'
import { ui } from '@/src/theme/ui'
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
      <Text style={ui.brand}>Practice</Text>
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
          <Text style={ui.body}>{routine.title}</Text>
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
