import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Pressable, Text } from 'react-native'

import { AnalysisCard } from '@/src/components/analysis-card'
import { Screen } from '@/src/components/screen'
import { analyzeJpeg } from '@/src/lib/analyze-face'
import { useAuth } from '@/src/lib/auth'
import { decodeBase64, saveCheckin } from '@/src/lib/data'
import { peekPendingScan, takePendingScan } from '@/src/lib/pending-scan'
import { ui } from '@/src/theme/ui'
import type { AnalysisResult } from '@/src/types/models'

/**
 * Runs the on-device check and lets the user save or discard the selfie.
 */
const ReviewScreen = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [base64, setBase64] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
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

  return (
    <Screen>
      {analysis ? <AnalysisCard analysis={analysis} /> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}
      {analysis ? (
        <Pressable style={ui.button} disabled={busy} onPress={() => void save()}>
          <Text style={ui.buttonText}>{busy ? 'Saving…' : 'Save check-in'}</Text>
        </Pressable>
      ) : null}
      <Pressable
        style={ui.ghost}
        onPress={() => {
          takePendingScan()
          router.back()
        }}
      >
        <Text style={ui.ghostText}>Discard</Text>
      </Pressable>
    </Screen>
  )
}

export default ReviewScreen
