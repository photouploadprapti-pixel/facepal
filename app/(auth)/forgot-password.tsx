import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { AppButton, BrandMark } from '@/src/components/app-button'
import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { ui } from '@/src/theme/ui'

/**
 * Sends a Supabase password-reset email for the account address.
 */
const ForgotPasswordScreen = () => {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (): Promise<void> => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await requestPasswordReset(email)
      setMessage('If that email has an account, a reset link is on the way.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send reset email')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <BrandMark size={52} />
        <Text style={ui.brand}>FacePal</Text>
        <Text style={ui.title}>Reset password</Text>
        <Text style={ui.subtitle}>
          Enter the email on your account. We will send a reset link when the address matches.
        </Text>
      </View>
      <Field label="Email">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={ui.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          placeholderTextColor="#8B95A1"
        />
      </Field>
      {message ? <Text style={ui.muted}>{message}</Text> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <AppButton
        label={busy ? 'Sending…' : 'Send reset link'}
        icon="mail-outline"
        disabled={busy}
        onPress={() => void submit()}
      />
      <Link href="/sign-in" asChild>
        <Pressable style={ui.ghost}>
          <Text style={ui.ghostText}>Back to sign in</Text>
        </Pressable>
      </Link>
    </Screen>
  )
}

export default ForgotPasswordScreen
