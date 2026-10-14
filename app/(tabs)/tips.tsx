import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { Screen } from '@/src/components/screen'
import { fetchTips } from '@/src/lib/data'
import { ui } from '@/src/theme/ui'
import type { Tip } from '@/src/types/models'

/**
 * Youth-care tips grouped in the order stored in Supabase.
 */
const TipsScreen = () => {
  const [tips, setTips] = useState<Tip[]>([])
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchTips()
        .then((rows) => {
          if (active) setTips(rows)
        })
        .catch((caught: unknown) => {
          if (active) setError(caught instanceof Error ? caught.message : 'Could not load tips')
        })
      return () => {
        active = false
      }
    }, []),
  )

  return (
    <Screen>
      <Text style={ui.muted}>
        Habits that support a rested look. Products help less than sleep, sunscreen, and not
        smoking.
      </Text>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {tips.map((tip) => (
        <View key={tip.id} style={ui.card}>
          <Text style={ui.muted}>{tip.category}</Text>
          <Text style={ui.body}>{tip.title}</Text>
          <Text style={ui.muted}>{tip.body}</Text>
        </View>
      ))}
    </Screen>
  )
}

export default TipsScreen
