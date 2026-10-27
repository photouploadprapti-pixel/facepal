import { useState } from 'react'
import { Text, View } from 'react-native'

import { AppButton } from '@/src/components/app-button'
import { Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { colors, ui } from '@/src/theme/ui'

/**
 * Records explicit consent before any selfie is stored.
 */
const ConsentScreen = () => {
  const { acceptConsent } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const agree = async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      await acceptConsent()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save consent')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Text style={ui.brand}>Privacy first</Text>
      <Text style={ui.title}>Before you start</Text>
      <View style={[ui.card, { backgroundColor: colors.sky }]}>
        <Text style={ui.body}>
          FacePal captures a selfie to estimate flush, under-eye darkness, texture, uneven tone,
          and spot-like redness. The check runs on your device. The photo is then saved privately
          so you can track trends and compare days.
        </Text>
      </View>
      <View style={ui.card}>
        <Text style={ui.kicker}>Important</Text>
        <Text style={ui.body}>
          FacePal is not a medical device. It does not diagnose skin disease, estimate clinical
          biological age for care decisions, or predict survival or disease risk.
        </Text>
        <Text style={ui.body}>
          You can delete your photos, history, and account anytime from the You tab.
        </Text>
      </View>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <AppButton
        label={busy ? 'Saving…' : 'I agree, store my selfies'}
        disabled={busy}
        onPress={() => void agree()}
      />
    </Screen>
  )
}

export default ConsentScreen
