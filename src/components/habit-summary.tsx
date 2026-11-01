import { useRouter, type Href } from 'expo-router'
import { Pressable, Text, View } from 'react-native'

import { AppIcon, IconChip } from '@/src/components/app-icon'
import { routineDoneCount } from '@/src/lib/habits'
import { colors, ui } from '@/src/theme/ui'
import type { HabitDay } from '@/src/types/models'

type HabitSummaryProps = {
  habit: HabitDay | null
  insightLines: string[]
  focusTitle: string
  focusBody: string
  yogaSlug?: string
}

/**
 * Home cards for today’s habits, weekly notes, and tonight’s focus.
 * @param habit Today’s habit row when logged.
 * @param insightLines Weekly pattern sentences.
 * @param focusTitle Tonight focus headline.
 * @param focusBody Supporting care sentence.
 * @param yogaSlug Optional yoga route slug.
 */
export const HabitSummary = ({
  habit,
  insightLines,
  focusTitle,
  focusBody,
  yogaSlug,
}: HabitSummaryProps) => {
  const router = useRouter()
  const done = habit ? routineDoneCount(habit) : 0

  return (
    <View style={{ gap: 14 }}>
      <Pressable
        style={[ui.card, { backgroundColor: colors.peach }]}
        onPress={() => router.push('/habits' as Href)}
      >
        <View style={styles.inline}>
          <IconChip name="leaf" tone="mauve" />
          <Text style={ui.kicker}>Today’s skin habits</Text>
        </View>
        {habit ? (
          <>
            <Text style={ui.body}>
              Care {done}/4 · Water {habit.waterGlasses} glasses
              {habit.sleepHours !== null ? ` · Sleep ${habit.sleepHours}h` : ''}
              {habit.spfWorn ? ' · SPF on' : ''}
            </Text>
            <Text style={ui.muted}>Tap to update sleep, stress, and your checklist.</Text>
          </>
        ) : (
          <Text style={ui.body}>
            Log sleep, water, SPF, and AM/PM care so FacePal can sit habits next to your selfie.
          </Text>
        )}
        <View style={styles.inline}>
          <AppIcon name="arrow-forward-circle" size={18} color={colors.plum} />
          <Text style={[ui.muted, { fontWeight: '700', color: colors.ink }]}>Open habit log</Text>
        </View>
      </Pressable>

      <View style={[ui.card, { backgroundColor: colors.lilac }]}>
        <View style={styles.inline}>
          <IconChip name="analytics" tone="sky" />
          <Text style={ui.kicker}>Weekly habit notes</Text>
        </View>
        {insightLines.map((line) => (
          <Text key={line} style={ui.body}>
            {line}
          </Text>
        ))}
      </View>

      <View style={[ui.card, { backgroundColor: colors.sky }]}>
        <View style={styles.inline}>
          <IconChip name="moon" tone="navy" />
          <Text style={ui.kicker}>{focusTitle}</Text>
        </View>
        <Text style={ui.body}>{focusBody}</Text>
        {yogaSlug ? (
          <Pressable
            style={styles.inline}
            onPress={() => router.push(`/yoga/${yogaSlug}` as Href)}
          >
            <AppIcon name="body" size={18} color={colors.ink} />
            <Text style={[ui.muted, { fontWeight: '700', color: colors.ink }]}>
              Open suggested yoga
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = {
  inline: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
}
