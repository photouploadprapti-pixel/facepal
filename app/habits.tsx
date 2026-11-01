import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { AppButton } from '@/src/components/app-button'
import { AppIcon, IconChip } from '@/src/components/app-icon'
import { Field, Screen } from '@/src/components/screen'
import { useAuth } from '@/src/lib/auth'
import { fetchHabitDay, upsertHabitDay } from '@/src/lib/data'
import { emptyHabitDay, localDayKey, routineDoneCount } from '@/src/lib/habits'
import { colors, ui } from '@/src/theme/ui'
import type { HabitDay } from '@/src/types/models'

/**
 * Daily sleep, water, SPF, stress, and AM/PM care checklist.
 */
const HabitsScreen = () => {
  const { user } = useAuth()
  const day = localDayKey()
  const [habit, setHabit] = useState<HabitDay | null>(null)
  const [sleepText, setSleepText] = useState('')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let active = true
      if (!user) return () => undefined
      fetchHabitDay(day)
        .then((row) => {
          if (!active) return
          const next = row ?? emptyHabitDay(user.id, day)
          setHabit(next)
          setSleepText(next.sleepHours === null ? '' : String(next.sleepHours))
          setNote(next.note)
        })
        .catch((caught: unknown) => {
          if (active) {
            setHabit(emptyHabitDay(user.id, day))
            setError(caught instanceof Error ? caught.message : 'Could not load habits')
          }
        })
      return () => {
        active = false
      }
    }, [day, user]),
  )

  const patch = (partial: Partial<HabitDay>): void => {
    setHabit((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  const save = async (): Promise<void> => {
    if (!user || !habit) return
    let sleepHours: number | null = null
    if (sleepText.trim()) {
      const parsed = Number(sleepText)
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 24) {
        setError('Sleep hours should be between 0 and 24.')
        return
      }
      sleepHours = Math.round(parsed * 10) / 10
    }
    setBusy(true)
    setError('')
    try {
      const saved = await upsertHabitDay(user.id, {
        day,
        sleepHours,
        waterGlasses: habit.waterGlasses,
        spfWorn: habit.spfWorn,
        stressLevel: habit.stressLevel,
        cleansedAm: habit.cleansedAm,
        moisturized: habit.moisturized,
        cleansedPm: habit.cleansedPm,
        note: note.trim(),
      })
      setHabit(saved)
      setMessage('Today’s habits saved.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save habits')
    } finally {
      setBusy(false)
    }
  }

  if (!habit) {
    return (
      <Screen>
        <Text style={ui.subtitle}>Loading today’s habits…</Text>
      </Screen>
    )
  }

  const done = routineDoneCount(habit)

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <IconChip name="leaf" tone="mauve" />
        <View style={{ flex: 1 }}>
          <Text style={ui.brand}>Daily ritual</Text>
          <Text style={ui.title}>Skin habits</Text>
        </View>
      </View>
      <Text style={ui.subtitle}>
        Log the lifestyle signals that sit next to your selfie — sleep, water, SPF, stress, and a
        short care checklist. Wellness tracking only.
      </Text>

      <View style={[ui.card, { backgroundColor: colors.sky }]}>
        <View style={styles.inline}>
          <AppIcon name="checkbox" size={18} color={colors.ink} />
          <Text style={ui.kicker}>Care checklist · {done}/4</Text>
        </View>
        <ToggleRow
          label="Cleansed this morning"
          icon="sunny-outline"
          active={habit.cleansedAm}
          onPress={() => patch({ cleansedAm: !habit.cleansedAm })}
        />
        <ToggleRow
          label="Moisturized"
          icon="water-outline"
          active={habit.moisturized}
          onPress={() => patch({ moisturized: !habit.moisturized })}
        />
        <ToggleRow
          label="SPF worn today"
          icon="sunny"
          active={habit.spfWorn}
          onPress={() => patch({ spfWorn: !habit.spfWorn })}
        />
        <ToggleRow
          label="Evening cleanse"
          icon="moon-outline"
          active={habit.cleansedPm}
          onPress={() => patch({ cleansedPm: !habit.cleansedPm })}
        />
      </View>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="water" tone="sky" />
          <Text style={ui.kicker}>Water · {habit.waterGlasses}/8 glasses</Text>
        </View>
        <View style={styles.row}>
          <AppButton
            label="−"
            variant="ghost"
            onPress={() =>
              patch({ waterGlasses: Math.max(0, habit.waterGlasses - 1) })
            }
          />
          <AppButton
            label="+"
            icon="add"
            onPress={() =>
              patch({ waterGlasses: Math.min(20, habit.waterGlasses + 1) })
            }
          />
        </View>
      </View>

      <Field label="Sleep last night (hours)">
        <TextInput
          keyboardType="decimal-pad"
          style={ui.input}
          value={sleepText}
          onChangeText={setSleepText}
          placeholder="e.g. 7.5"
          placeholderTextColor="#8B95A1"
        />
      </Field>

      <View style={ui.card}>
        <View style={styles.inline}>
          <IconChip name="pulse" tone="navy" />
          <Text style={ui.kicker}>Stress today (1 calm → 5 high)</Text>
        </View>
        <View style={styles.stressRow}>
          {[1, 2, 3, 4, 5].map((level) => (
            <Pressable
              key={level}
              onPress={() =>
                patch({ stressLevel: habit.stressLevel === level ? null : level })
              }
              style={[
                styles.stressChip,
                habit.stressLevel === level ? styles.stressActive : null,
              ]}
            >
              <Text
                style={[
                  styles.stressText,
                  habit.stressLevel === level ? { color: '#FFFFFF' } : null,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Field label="Optional note (food, travel, cycle, products…)">
        <TextInput
          style={[ui.input, { minHeight: 72, textAlignVertical: 'top' }]}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Anything that might have changed today’s look"
          placeholderTextColor="#8B95A1"
        />
      </Field>

      {message ? <Text style={ui.muted}>{message}</Text> : null}
      {error ? <Text style={ui.error}>{error}</Text> : null}

      <AppButton
        label={busy ? 'Saving…' : 'Save today’s habits'}
        icon="checkmark-circle"
        disabled={busy}
        onPress={() => void save()}
      />
      <Text style={ui.disclaimer}>
        Habit notes are associations from your own logs, not medical advice or diagnoses.
      </Text>
    </Screen>
  )
}

type ToggleRowProps = {
  label: string
  icon: 'sunny-outline' | 'water-outline' | 'sunny' | 'moon-outline'
  active: boolean
  onPress: () => void
}

/**
 * One checklist row with icon and on/off state.
 * @param label Visible label.
 * @param icon Leading Ionicons glyph.
 * @param active Whether the step is done.
 * @param onPress Toggle handler.
 */
const ToggleRow = ({ label, icon, active, onPress }: ToggleRowProps) => (
  <Pressable onPress={onPress} style={styles.toggle}>
    <AppIcon name={icon} size={18} color={active ? colors.ink : colors.muted} />
    <Text style={[ui.body, { flex: 1, fontWeight: active ? '700' : '500' }]}>{label}</Text>
    <AppIcon
      name={active ? 'checkmark-circle' : 'ellipse-outline'}
      size={22}
      color={active ? colors.plum : colors.tabMuted}
    />
  </Pressable>
)

const styles = {
  inline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  row: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  toggle: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  stressRow: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  stressChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  stressActive: {
    backgroundColor: colors.midnight,
    borderColor: colors.plum,
  },
  stressText: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: colors.ink,
  },
}

export default HabitsScreen
