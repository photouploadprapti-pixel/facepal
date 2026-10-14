import { StyleSheet, Text, View } from 'react-native'

import { colors } from '@/src/theme/ui'

type ScoreMeterProps = {
  label: string
  score: number
}

/**
 * Shows one 0–100 signal. Higher means the photo showed more of that signal.
 * @param label Short name such as Redness.
 * @param score Integer score from the on-device check.
 */
export const ScoreMeter = ({ label, score }: ScoreMeterProps) => {
  const hot = score >= 58
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, hot ? styles.hot : styles.calm]}>{score}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${score}%`, backgroundColor: hot ? colors.warn : colors.sage },
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  value: { fontSize: 15, fontWeight: '700' },
  hot: { color: colors.warn },
  calm: { color: colors.ok },
  track: {
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 8 },
})
