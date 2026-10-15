import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { Screen } from '@/src/components/screen'
import { fetchCheckins } from '@/src/lib/data'
import { checkinToAnalysis } from '@/src/lib/skin-read'
import { ui } from '@/src/theme/ui'
import type { Checkin } from '@/src/types/models'

/**
 * Lists saved checks, newest first.
 */
const HistoryScreen = () => {
  const [rows, setRows] = useState<Checkin[]>([])
  const [error, setError] = useState('')

  useFocusEffect(
    useCallback(() => {
      let active = true
      fetchCheckins()
        .then((checkins) => {
          if (active) setRows(checkins)
        })
        .catch((caught: unknown) => {
          if (active) setError(caught instanceof Error ? caught.message : 'Could not load history')
        })
      return () => {
        active = false
      }
    }, []),
  )

  return (
    <Screen>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {rows.length === 0 ? <Text style={ui.muted}>No check-ins yet.</Text> : null}
      {rows.map((row) => (
        <View key={row.id} style={{ gap: 8 }}>
          <Text style={ui.muted}>{new Date(row.capturedAt).toLocaleString()}</Text>
          <AnalysisCard analysis={checkinToAnalysis(row)} />
        </View>
      ))}
    </Screen>
  )
}

export default HistoryScreen
