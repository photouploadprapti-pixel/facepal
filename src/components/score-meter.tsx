import { StyleSheet, Text, View } from 'react-native'

import { AppIcon, type IconName } from '@/src/components/app-icon'
import { colors } from '@/src/theme/ui'

type ScoreMeterProps = {
  label: string
  score: number
  tint: string
  icon?: IconName
}

/**
 * Shows one 0–100 signal tile with an optional icon.
 * @param label Short name such as Spots.
 * @param score Integer score from the on-device check.
 * @param tint Soft fill color.
 * @param icon Optional Ionicons glyph.
 */
export const ScoreMeter = ({ label, score, tint, icon }: ScoreMeterProps) => (
  <View style={[styles.tile, { backgroundColor: tint }]}>
    <View style={styles.head}>
      {icon ? <AppIcon name={icon} size={16} color={colors.ink} /> : null}
      <Text style={styles.score}>{score}</Text>
    </View>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${score}%`,
            backgroundColor: score >= 58 ? colors.warn : colors.skyBlue,
          },
        ]}
      />
    </View>
  </View>
)

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  track: {
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(14,27,72,0.10)',
    overflow: 'hidden',
  },
  fill: {
    height: 5,
    borderRadius: 999,
  },
})
