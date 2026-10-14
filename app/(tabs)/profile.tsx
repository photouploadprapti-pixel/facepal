import { useState } from 'react'
import { Pressable, Text } from 'react-native'

import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { deleteMyData } from '@/src/lib/data'
import { supabaseKey, supabaseUrl } from '@/src/lib/env'
import { scheduleDailyReminder } from '@/src/lib/reminders'
import { supabase } from '@/src/lib/supabase'
import { ui } from '@/src/theme/ui'

/**
 * Profile, reminder hour, and a full data delete.
 */
const ProfileScreen = () => {
  const { profile, user, signOut, updateReminderHour } = useAuth()
  const [hour, setHour] = useState(String(profile?.reminderHour ?? 8))
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
      <Text style={ui.title}>{profile?.displayName || 'Your account'}</Text>
      <Text style={ui.muted}>{user?.email}</Text>
      <Field label="Daily reminder hour (0–23)">
        <Text style={ui.input}>{hour}</Text>
      </Field>
      <ViewHour hour={hour} onChange={setHour} />
      <Pressable style={ui.button} onPress={() => void saveReminder()}>
        <Text style={ui.buttonText}>Save reminder</Text>
      </Pressable>
      {message ? <Text style={ui.muted}>{message}</Text> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}
      <Pressable style={ui.ghost} onPress={() => void signOut()}>
        <Text style={ui.ghostText}>Sign out</Text>
      </Pressable>
      <Pressable style={ui.ghost} disabled={busy} onPress={() => void wipe()}>
        <Text style={ui.ghostText}>
          {busy ? 'Deleting…' : 'Delete my photos, history, and account'}
        </Text>
      </Pressable>
      <Text style={ui.muted}>
        Selfies are private to your login. Deleting removes them from FacePal storage.
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
        <Text style={ui.ghostText}>{choice}:00{hour === choice ? ' · selected' : ''}</Text>
      </Pressable>
    ))}
  </>
)

export default ProfileScreen
