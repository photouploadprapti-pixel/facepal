import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'

import { AppButton } from '@/src/components/app-button'
import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { ui } from '@/src/theme/ui'

/**
 * Email and password sign-in.
 */
const SignInScreen = () => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      await signIn(email.trim(), password)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Text style={ui.brand}>FacePal</Text>
      <Text style={ui.title}>Look after your face, daily.</Text>
      <Text style={ui.subtitle}>
        Professional skin reads, habits, and face yoga — designed for consistent selfies.
      </Text>
      <Field label="Email">
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          style={ui.input}
          value={email}
          onChangeText={setEmail}
        />
      </Field>
      <Field label="Password">
        <TextInput secureTextEntry style={ui.input} value={password} onChangeText={setPassword} />
      </Field>
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <AppButton
        label={busy ? 'Signing in…' : 'Sign in'}
        disabled={busy}
        onPress={() => void submit()}
      />
      <Link href="/sign-up" asChild>
        <Pressable style={ui.ghost}>
          <Text style={ui.ghostText}>Create an account</Text>
        </Pressable>
      </Link>
      <Text style={ui.disclaimer}>
        Wellness tool only. Not a medical device and not for clinical decisions.
      </Text>
    </Screen>
  )
}

export default SignInScreen
