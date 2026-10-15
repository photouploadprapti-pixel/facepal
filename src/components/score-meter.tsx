import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/src/theme/ui'

type ScoreMeterProps = {
  label: string
  score: number
  tint: string
}

/**
 * Shows one 0–100 signal. Higher means the photo showed more of that signal.
 * @param label Short name such as Redness.
 * @param score Integer score from the on-device check.
 * @param tint Pastel fill for the card.
 */
export const ScoreMeter = ({ label, score, tint }: ScoreMeterProps) => (
  <View style={[styles.tile, { backgroundColor: tint }]}>
    <Text style={styles.score}>{score}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
)

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 4,
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
})
