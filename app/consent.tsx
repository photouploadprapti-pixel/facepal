import { useState } from 'react'
import { Pressable, Text } from 'react-native'

import { Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { ui } from '@/src/theme/ui'

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
      <Text style={ui.title}>Before you start</Text>
      <Text style={ui.body}>
        FacePal takes a selfie to estimate flushed skin, under-eye darkness, texture, and uneven
        tone. The check runs on your phone. The photo is then saved in your private FacePal
        storage so you can look back and compare.
      </Text>
      <Text style={ui.body}>
        This is not a medical device and it does not diagnose skin disease. You can delete your
        photos, history, and account from the You tab.
      </Text>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <Pressable style={ui.button} disabled={busy} onPress={() => void agree()}>
        <Text style={ui.buttonText}>{busy ? 'Saving…' : 'I agree, store my selfies'}</Text>
      </Pressable>
    </Screen>
  )
}

export default ConsentScreen
