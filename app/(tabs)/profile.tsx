import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { AppButton } from '@/src/components/app-button'
import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { deleteMyData } from '@/src/lib/data'
import { supabaseKey, supabaseUrl } from '@/src/lib/env'
import { scheduleDailyReminder } from '@/src/lib/reminders'
import { supabase } from '@/src/lib/supabase'
import { ui } from '@/src/theme/ui'

/**
 * Profile, birth year, reminder hour, and a full data delete.
 */
const ProfileScreen = () => {
  const { profile, user, signOut, updateReminderHour, updateBirthYear } = useAuth()
  const [hour, setHour] = useState(String(profile?.reminderHour ?? 8))
  const [birthYear, setBirthYear] = useState(
    profile?.birthYear ? String(profile.birthYear) : '',
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const saveReminder = async (): Promise<void> => {
    const parsed = Number(hour)
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) {
      setError('Use an hour from 0 to 23')
      return
    }
    setError('')
    try {
      await updateReminderHour(parsed)
      await scheduleDailyReminder(parsed)
      setMessage(`Reminder set for ${parsed}:00 on this phone.`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save reminder')
    }
  }

  const saveBirthYear = async (): Promise<void> => {
    if (!birthYear.trim()) {
      try {
        await updateBirthYear(null)
        setMessage('Birth year cleared.')
        setError('')
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Could not clear birth year')
      }
      return
    }
    const year = Number(birthYear)
    const current = new Date().getFullYear()
    if (!Number.isInteger(year) || year < current - 100 || year > current - 13) {
      setError('Enter a birth year that makes you 13–100 years old.')
      return
    }
    try {
      await updateBirthYear(year)
      setMessage('Birth year saved for face-age style estimates.')
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save birth year')
    }
  }

  const wipe = async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      await deleteMyData()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) {
        await fetch(`${supabaseUrl()}/auth/v1/user`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseKey(),
          },
        })
      }
      await signOut()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete data')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen>
      <Text style={ui.brand}>Account</Text>
      <Text style={ui.title}>{profile?.displayName || 'Your account'}</Text>
      <Text style={ui.subtitle}>{user?.email}</Text>

      <View style={ui.card}>
        <Text style={ui.kicker}>Privacy</Text>
        <Text style={ui.body}>
          Selfies stay in your private FacePal storage. Analysis runs on your device before
          upload. You can delete everything below.
        </Text>
      </View>

      <Field label="Birth year (optional, for face-age style estimates)">
        <TextInput
          keyboardType="number-pad"
          style={ui.input}
          value={birthYear}
          onChangeText={setBirthYear}
          placeholder="e.g. 1998"
          placeholderTextColor="#8B95A1"
        />
      </Field>
      <AppButton label="Save birth year" variant="ghost" onPress={() => void saveBirthYear()} />

      <Field label="Daily reminder hour (0–23)">
        <Text style={ui.input}>{hour}</Text>
      </Field>
      <ViewHour hour={hour} onChange={setHour} />
      <AppButton label="Save reminder" onPress={() => void saveReminder()} />

      {message ? <Text style={ui.muted}>{message}</Text> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}

      <AppButton label="Sign out" variant="ghost" onPress={() => void signOut()} />
      <AppButton
        label={busy ? 'Deleting…' : 'Delete my photos, history, and account'}
        variant="ghost"
        disabled={busy}
        onPress={() => void wipe()}
      />
      <Text style={ui.disclaimer}>
        FacePal is a wellness tool, not a medical device. It does not diagnose disease or predict
        clinical outcomes.
      </Text>
    </Screen>
  )
}

type ViewHourProps = {
  hour: string
  onChange: (value: string) => void
}

/**
 * Four common reminder hours. The saved value can still be any hour 0–23.
 * @param hour Current text value.
 * @param onChange Called with the chosen hour.
 */
const ViewHour = ({ hour, onChange }: ViewHourProps) => (
  <>
    {['7', '8', '20', '21'].map((choice) => (
      <Pressable key={choice} style={ui.ghost} onPress={() => onChange(choice)}>
        <Text style={ui.ghostText}>
          {choice}:00{hour === choice ? ' · selected' : ''}
        </Text>
      </Pressable>
    ))}
  </>
)

export default ProfileScreen
