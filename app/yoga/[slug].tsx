import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Text } from 'react-native'

import { Screen } from '@/src/components/screen'
import { YogaSession } from '@/src/components/yoga-session'
import { YogaVideo } from '@/src/components/yoga-video'
import { useAuth } from '@/src/lib/auth'
import { completeRoutine, fetchRoutine } from '@/src/lib/data'
import { ui } from '@/src/theme/ui'
import type { YogaRoutine } from '@/src/types/models'

/**
 * One routine: summary, optional video, and the guided animation.
 */
const YogaDetailScreen = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { user } = useAuth()
  const [routine, setRoutine] = useState<YogaRoutine | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!slug) return
    let active = true
    fetchRoutine(slug)
      .then((row) => {
        if (active) setRoutine(row)
      })
      .catch((caught: unknown) => {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load routine')
      })
    return () => {
      active = false
    }
  }, [slug])

  const onComplete = useCallback(() => {
    if (!user || !routine) return
    void completeRoutine(user.id, routine.id)
  }, [user, routine])

  if (!routine) {
    return (
      <Screen>
        <Text style={ui.muted}>{error || 'Loading routine…'}</Text>
      </Screen>
    )
  }

  return (
    <Screen>
      <Text style={ui.title}>{routine.title}</Text>
      <Text style={ui.muted}>
        {routine.zone} · {routine.minutes} min · {routine.level}
      </Text>
      <Text style={ui.body}>{routine.summary}</Text>
      {routine.videoUrl ? <YogaVideo url={routine.videoUrl} /> : null}
      <YogaSession steps={routine.steps} onComplete={onComplete} />
    </Screen>
  )
}

export default YogaDetailScreen
