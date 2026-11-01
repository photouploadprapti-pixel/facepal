import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'
import { Image, Pressable, Text, TextInput, View } from 'react-native'

import { AppButton, BrandMark } from '@/src/components/app-button'
import { AppIcon, IconChip } from '@/src/components/app-icon'
import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { publicAvatarUrl } from '@/src/lib/avatar'
import { colors, ui } from '@/src/theme/ui'

/**
 * Dedicated screen for name, email, password, birth year, and avatar edits.
 */
const EditProfileScreen = () => {
  const {
    profile,
    user,
    updateBirthYear,
    updateDisplayName,
    updateEmail,
    updatePassword,
    updateAvatar,
  } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [nextPassword, setNextPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [birthYear, setBirthYear] = useState(
    profile?.birthYear ? String(profile.birthYear) : '',
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '')
    setBirthYear(profile?.birthYear ? String(profile.birthYear) : '')
  }, [profile])

  useEffect(() => {
    setEmail(user?.email ?? '')
  }, [user?.email])

  const avatarUri = publicAvatarUrl(profile?.avatarUrl)

  const saveName = async (): Promise<void> => {
    try {
      await updateDisplayName(displayName)
      setMessage('Display name saved.')
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save name')
    }
  }

  const saveEmail = async (): Promise<void> => {
    try {
      const note = await updateEmail(email)
      setMessage(note)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update email')
    }
  }

  const savePassword = async (): Promise<void> => {
    if (nextPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    try {
      await updatePassword(currentPassword, nextPassword)
      setCurrentPassword('')
      setNextPassword('')
      setConfirmPassword('')
      setMessage('Password updated.')
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update password')
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

  const pickAvatar = async (): Promise<void> => {
    setAvatarBusy(true)
    setError('')
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        setError('Photo library permission is required for a profile picture.')
        return
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      })
      if (picked.canceled || !picked.assets[0]) return
      const resized = await ImageManipulator.manipulateAsync(
        picked.assets[0].uri,
        [{ resize: { width: 512 } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG, base64: true },
      )
      if (!resized.base64) throw new Error('Could not read the selected photo')
      await updateAvatar(resized.base64)
      setMessage('Profile picture updated.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update photo')
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => void pickAvatar()} style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <BrandMark size={72} />
          )}
          <View style={styles.cameraBadge}>
            <AppIcon name="camera" size={14} color="#FFFFFF" />
          </View>
        </Pressable>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={ui.brand}>Edit profile</Text>
          <Text style={ui.title}>Your details</Text>
          <Text style={[ui.muted, { fontWeight: '700', color: colors.plum }]}>
            {avatarBusy ? 'Uploading photo…' : 'Tap photo to change'}
          </Text>
        </View>
      </View>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="person" tone="navy" />
          <Text style={ui.kicker}>Display name</Text>
        </View>
        <Field label="Name">
          <TextInput
            style={ui.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor="#8B95A1"
            autoCapitalize="words"
          />
        </Field>
        <AppButton
          label="Save name"
          variant="ghost"
          icon="checkmark-outline"
          onPress={() => void saveName()}
        />
      </View>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="mail" tone="sky" />
          <Text style={ui.kicker}>Email</Text>
        </View>
        <Text style={ui.muted}>
          Changing email sends a confirmation link. Keep access to both addresses until confirmed.
        </Text>
        <Field label="Email address">
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
        <AppButton
          label="Update email"
          variant="ghost"
          icon="mail-outline"
          onPress={() => void saveEmail()}
        />
      </View>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="lock-closed" tone="mauve" />
          <Text style={ui.kicker}>Password</Text>
        </View>
        <Field label="Current password">
          <TextInput
            secureTextEntry
            style={ui.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor="#8B95A1"
          />
        </Field>
        <Field label="New password (min 8 characters)">
          <TextInput
            secureTextEntry
            style={ui.input}
            value={nextPassword}
            onChangeText={setNextPassword}
            placeholder="New password"
            placeholderTextColor="#8B95A1"
          />
        </Field>
        <Field label="Confirm new password">
          <TextInput
            secureTextEntry
            style={ui.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            placeholderTextColor="#8B95A1"
          />
        </Field>
        <AppButton
          label="Change password"
          variant="ghost"
          icon="key-outline"
          onPress={() => void savePassword()}
        />
      </View>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="calendar" tone="sky" />
          <Text style={ui.kicker}>Birth year</Text>
        </View>
        <Text style={ui.muted}>
          Optional four-digit year (for example 1998). Used only for face-age style wellness
          wording — not a medical age.
        </Text>
        <Field label="Year you were born">
          <TextInput
            keyboardType="number-pad"
            style={ui.input}
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder="1998"
            placeholderTextColor="#8B95A1"
            maxLength={4}
          />
        </Field>
        <AppButton
          label="Save birth year"
          variant="ghost"
          icon="calendar-outline"
          onPress={() => void saveBirthYear()}
        />
      </View>

      {message ? <Text style={ui.muted}>{message}</Text> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}
    </Screen>
  )
}

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
  avatarWrap: {
    position: 'relative' as const,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.plum,
  },
  cameraBadge: {
    position: 'absolute' as const,
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.midnight,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: colors.plumSoft,
  },
}

export default EditProfileScreen
