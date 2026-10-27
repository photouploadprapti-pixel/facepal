import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/src/theme/ui'

type ScoreMeterProps = {
  label: string
  score: number
  tint: string
}

/**
 * Shows one 0–100 signal tile. Higher means more of that signal in the photo.
 * @param label Short name such as Spots.
 * @param score Integer score from the on-device check.
 * @param tint Soft fill color.
 */
export const ScoreMeter = ({ label, score, tint }: ScoreMeterProps) => (
  <View style={[styles.tile, { backgroundColor: tint }]}>
    <Text style={styles.score}>{score}</Text>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${score}%`,
            backgroundColor: score >= 58 ? colors.warn : colors.plum,
          },
        ]}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  score: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(18,23,28,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 999,
  },
})
