import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { fetchCheckins } from '@/src/lib/data'
import { ageFromBirthYear, checkinToAnalysis } from '@/src/lib/skin-read'
import { ui } from '@/src/theme/ui'
import type { Checkin } from '@/src/types/models'

/**
 * Lists saved checks, newest first.
 */
const HistoryScreen = () => {
  const { profile } = useAuth()
  const [rows, setRows] = useState<Checkin[]>([])
  const [error, setError] = useState('')
  const age = ageFromBirthYear(profile?.birthYear ?? null)

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
      <Text style={ui.brand}>History</Text>
      <Text style={ui.title}>Past reads</Text>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {rows.length === 0 ? <Text style={ui.muted}>No check-ins yet.</Text> : null}
      {rows.map((row) => (
        <View key={row.id} style={{ gap: 8 }}>
          <Text style={ui.muted}>{new Date(row.capturedAt).toLocaleString()}</Text>
          <AnalysisCard analysis={checkinToAnalysis(row)} chronologicalAge={age} />
        </View>
      ))}
    </Screen>
  )
}

export default HistoryScreen
