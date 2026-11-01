import { useRouter, type Href } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image, Pressable, Text, View } from 'react-native'

import { AppButton, BrandMark } from '@/src/components/app-button'
import { IconChip } from '@/src/components/app-icon'
import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { publicAvatarUrl } from '@/src/lib/avatar'
import { deleteMyData } from '@/src/lib/data'
import { supabaseKey, supabaseUrl } from '@/src/lib/env'
import { scheduleDailyReminder } from '@/src/lib/reminders'
import { supabase } from '@/src/lib/supabase'
import { colors, ui } from '@/src/theme/ui'

/**
 * Account overview with a link to edit profile, reminder settings, and delete.
 */
const ProfileScreen = () => {
  const { profile, user, signOut, updateReminderHour } = useAuth()
  const router = useRouter()
  const [hour, setHour] = useState(String(profile?.reminderHour ?? 8))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setHour(String(profile?.reminderHour ?? 8))
  }, [profile])

  const avatarUri = publicAvatarUrl(profile?.avatarUrl)

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
      <View style={styles.header}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <BrandMark size={72} />
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={ui.brand}>Account</Text>
          <Text style={ui.title}>{profile?.displayName || 'Your account'}</Text>
          <Text style={ui.muted}>{user?.email}</Text>
          {profile?.birthYear ? (
            <Text style={ui.muted}>Birth year · {profile.birthYear}</Text>
          ) : null}
        </View>
      </View>

      <AppButton
        label="Edit profile"
        icon="create-outline"
        onPress={() => router.push('/edit-profile' as Href)}
      />

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="shield-checkmark" tone="navy" />
          <Text style={ui.kicker}>Privacy</Text>
        </View>
        <Text style={ui.body}>
          Selfies stay in your private FacePal storage. Analysis runs on your device before
          upload. You can delete everything below.
        </Text>
      </View>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="notifications" tone="sky" />
          <Text style={ui.kicker}>Daily reminder</Text>
        </View>
        <Field label="Reminder hour (0–23)">
          <Text style={ui.input}>{hour}:00</Text>
        </Field>
        <ViewHour hour={hour} onChange={setHour} />
        <AppButton
          label="Save reminder"
          icon="notifications-outline"
          onPress={() => void saveReminder()}
        />
      </View>

      {message ? <Text style={ui.muted}>{message}</Text> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}

      <AppButton
        label="Sign out"
        variant="ghost"
        icon="log-out-outline"
        onPress={() => void signOut()}
      />
      <AppButton
        label={busy ? 'Deleting…' : 'Delete my photos, history, and account'}
        variant="ghost"
        icon="trash-outline"
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

const styles = {
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  inline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.plum,
  },
}

export default ProfileScreen
