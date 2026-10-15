import { Link } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput } from 'react-native'

import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { ui } from '@/src/theme/ui'

/**
 * Creates an email account and stores the display name in profile metadata.
 */
const SignUpScreen = () => {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (): Promise<void> => {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const message = await signUp(email.trim(), password, name.trim())
      if (message) setNotice(message)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Text style={ui.title}>Create account</Text>
      <Field label="Name">
        <TextInput style={ui.input} value={name} onChangeText={setName} />
      </Field>
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
      {notice ? <Text style={ui.muted}>{notice}</Text> : null}
      <Pressable style={ui.button} disabled={busy} onPress={() => void submit()}>
        <Text style={ui.buttonText}>{busy ? 'Creating…' : 'Create account'}</Text>
      </Pressable>
      <Link href="/sign-in" asChild>
        <Pressable style={ui.ghost}>
          <Text style={ui.ghostText}>I already have an account</Text>
        </Pressable>
      </Link>
    </Screen>
  )
}

export default SignUpScreen
