import { StyleSheet, Text, View } from 'react-native'

import { colors, ui } from '@/src/theme/ui'

type TrendPoint = {
  label: string
  value: number
}

type TrendSparkProps = {
  points: TrendPoint[]
  title?: string
}

/**
 * Compact bar chart of recent skin-quality scores.
 * @param points Newest-last sequence of quality values.
 * @param title Optional section label.
 */
export const TrendSpark = ({ points, title = '7-day quality' }: TrendSparkProps) => {
  if (points.length === 0) return null
  const max = Math.max(...points.map((point) => point.value), 1)
  return (
    <View style={ui.card}>
      <Text style={ui.kicker}>{title}</Text>
      <View style={styles.row}>
        {points.map((point) => (
          <View key={point.label} style={styles.col}>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.max((point.value / max) * 100, 8)}%`,
                    backgroundColor: point.value >= 70 ? colors.plum : colors.warn,
                  },
                ]}
              />
            </View>
            <Text style={styles.label}>{point.label}</Text>
            <Text style={styles.value}>{point.value}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    minHeight: 120,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  track: {
    width: '100%',
    height: 84,
    borderRadius: 10,
    backgroundColor: colors.sky,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 10,
  },
  label: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '700',
  },
})
