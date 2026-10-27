import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { AppButton } from '@/src/components/app-button'
import { Screen } from '@/src/components/screen'
import { analyzeJpeg } from '@/src/lib/analyze-face'
import { useAuth } from '@/src/lib/auth'
import { decodeBase64, fetchCheckins, saveCheckin } from '@/src/lib/data'
import { peekPendingScan, takePendingScan } from '@/src/lib/pending-scan'
import { ageFromBirthYear, compareReads } from '@/src/lib/skin-read'
import { streakFromDates } from '@/src/lib/streak'
import { ui } from '@/src/theme/ui'
import type { AnalysisResult, Checkin } from '@/src/types/models'

/**
 * Shows the skin read for the new selfie, then saves it.
 */
const ReviewScreen = () => {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [base64, setBase64] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [previous, setPrevious] = useState<Checkin[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const pending = peekPendingScan()
    if (!pending) {
      setError('Take a selfie first.')
      return
    }
    setBase64(pending)
    try {
      setAnalysis(analyzeJpeg(decodeBase64(pending)))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not read the photo')
    }
    fetchCheckins()
      .then((rows) => setPrevious(rows))
      .catch(() => setPrevious([]))
  }, [])

  const save = async (): Promise<void> => {
    if (!user || !base64 || !analysis) return
    setBusy(true)
    setError('')
    try {
      takePendingScan()
      await saveCheckin(user.id, base64, analysis)
      router.replace('/')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save')
    } finally {
      setBusy(false)
    }
  }

  const last = previous[0]
  const streak = streakFromDates([
    ...previous.map((row) => row.capturedAt),
    new Date().toISOString(),
  ])
  const compareLines = analysis && last ? compareReads(analysis, last, streak) : []
  const age = ageFromBirthYear(profile?.birthYear ?? null)

  return (
    <Screen>
      <Text style={ui.brand}>Daily check</Text>
      <Text style={ui.title}>Today’s read</Text>
      <Text style={ui.subtitle}>
        Review what this photo shows, then save it to your private history.
      </Text>
      {analysis ? (
        <AnalysisCard
          analysis={analysis}
          compareLines={compareLines}
          chronologicalAge={age}
        />
      ) : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {analysis ? (
        <AppButton
          label={busy ? 'Saving…' : 'Save this read'}
          disabled={busy}
          onPress={() => void save()}
        />
      ) : null}
      <AppButton
        label={analysis && !analysis.photoQuality.ok ? 'Retake photo' : 'Discard'}
        variant="ghost"
        onPress={() => {
          takePendingScan()
          router.replace('/scan')
        }}
      />
    </Screen>
  )
}

export default ReviewScreen
