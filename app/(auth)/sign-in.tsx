import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'

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
      <Text style={ui.title}>FacePal</Text>
      <Text style={ui.muted}>
        Daily selfie check, care tips, and face yoga. Photos stay in your account.
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
      <Pressable style={ui.button} disabled={busy} onPress={() => void submit()}>
        <Text style={ui.buttonText}>{busy ? 'Signing in…' : 'Sign in'}</Text>
      </Pressable>
      <Link href="/sign-up" style={ui.muted}>
        Create an account
      </Link>
    </Screen>
  )
}

export default SignInScreen
