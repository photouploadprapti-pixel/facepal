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
      <Text style={ui.brand}>Care</Text>
      <Text style={ui.title}>Youth habits</Text>
      <Text style={ui.subtitle}>
        Habits that support a rested look. Sleep, sunscreen, and not smoking matter more than most
        products.
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
