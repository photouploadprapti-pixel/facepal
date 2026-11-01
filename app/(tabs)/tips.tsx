import { useFocusEffect, useRouter, type Href } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { AppButton } from '@/src/components/app-button'
import { IconChip } from '@/src/components/app-icon'
import { Screen } from '@/src/components/screen'
import { fetchTips } from '@/src/lib/data'
import { ui } from '@/src/theme/ui'
import type { Tip } from '@/src/types/models'

/**
 * Youth-care tips grouped in the order stored in Supabase.
 */
const TipsScreen = () => {
  const router = useRouter()
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <IconChip name="bulb" tone="sky" />
        <Text style={ui.brand}>Care</Text>
      </View>
      <Text style={ui.title}>Youth habits</Text>
      <Text style={ui.subtitle}>
        Habits that support a rested look. Sleep, sunscreen, and not smoking matter more than most
        products.
      </Text>
      <AppButton
        label="Log today’s skin habits"
        icon="leaf-outline"
        variant="ghost"
        onPress={() => router.push('/habits' as Href)}
      />
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {tips.map((tip) => (
        <View key={tip.id} style={ui.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconChip name="leaf-outline" tone="mauve" />
            <Text style={ui.muted}>{tip.category}</Text>
          </View>
          <Text style={[ui.body, { fontWeight: '700' }]}>{tip.title}</Text>
          <Text style={ui.muted}>{tip.body}</Text>
        </View>
      ))}
    </Screen>
  )
}

export default TipsScreen
