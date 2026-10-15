import { StyleSheet, Text, View } from 'react-native'

import { ScoreMeter } from '@/src/components/score-meter'
import { findingTitle } from '@/src/lib/findings'
import { skinHeadline } from '@/src/lib/skin-read'
import { colors, ui } from '@/src/theme/ui'
import type { AnalysisResult } from '@/src/types/models'

type AnalysisCardProps = {
  analysis: AnalysisResult
  compareLines?: string[]
}

/**
 * Renders skin quality, what the photo shows, and care tips.
 * @param analysis On-device result or the same fields loaded from a check-in.
 * @param compareLines Extra notes when an older selfie exists.
 */
export const AnalysisCard = ({ analysis, compareLines = [] }: AnalysisCardProps) => (
  <View style={{ gap: 14 }}>
    <View style={[ui.card, styles.hero]}>
      <View style={styles.badge}>
        <Text style={styles.badgeScore}>{analysis.quality}</Text>
        <Text style={styles.badgeLabel}>quality</Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.kicker}>What this photo shows</Text>
        <Text style={ui.body}>{skinHeadline(analysis.quality, analysis.findings)}</Text>
      </View>
    </View>
    <Text style={ui.muted}>{analysis.summary}</Text>
    <View style={styles.grid}>
      <ScoreMeter label="Spots" score={analysis.blemishes} tint={colors.blush} />
      <ScoreMeter label="Flush" score={analysis.redness} tint={colors.peach} />
      <ScoreMeter label="Under-eye" score={analysis.underEye} tint={colors.lilac} />
      <ScoreMeter label="Texture" score={analysis.texture} tint={colors.sky} />
    </View>
    {analysis.findings.length > 0 ? (
      <View style={[ui.card, { backgroundColor: colors.blush }]}>
        <Text style={styles.kicker}>Watch</Text>
        <Text style={ui.body}>{analysis.findings.map((code) => findingTitle[code]).join(' · ')}</Text>
      </View>
    ) : (
      <View style={[ui.card, { backgroundColor: colors.mint }]}>
        <Text style={styles.kicker}>Looking steady</Text>
        <Text style={ui.body}>No pimple-like spots or strong flush stood out in this frame.</Text>
      </View>
    )}
    {compareLines.length > 0 ? (
      <View style={[ui.card, { backgroundColor: colors.lilac }]}>
        <Text style={styles.kicker}>Compared with past photos</Text>
        {compareLines.map((line) => (
          <Text key={line} style={ui.body}>
            {line}
          </Text>
        ))}
      </View>
    ) : null}
    <View style={ui.card}>
      <Text style={styles.kicker}>Tips for this photo</Text>
      {analysis.tips.map((tip) => (
        <Text key={tip} style={ui.body}>
          {tip}
        </Text>
      ))}
      <Text style={ui.muted}>Wellness estimate only. This is not a medical diagnosis.</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.sky,
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeScore: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  badgeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
})
