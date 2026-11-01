import { StyleSheet, Text, View } from 'react-native'

import { AppIcon, IconChip } from '@/src/components/app-icon'
import { ScoreMeter } from '@/src/components/score-meter'
import { findingTitle } from '@/src/lib/findings'
import { faceAgeLine, skinHeadline } from '@/src/lib/skin-read'
import { colors, ui } from '@/src/theme/ui'
import type { AnalysisResult } from '@/src/types/models'

type AnalysisCardProps = {
  analysis: AnalysisResult
  compareLines?: string[]
  chronologicalAge?: number | null
}

/**
 * Renders skin quality, zones, face-age framing, and care tips.
 * @param analysis On-device result or the same fields loaded from a check-in.
 * @param compareLines Extra notes when an older selfie exists.
 * @param chronologicalAge Optional age for face-age style wording.
 */
export const AnalysisCard = ({
  analysis,
  compareLines = [],
  chronologicalAge = null,
}: AnalysisCardProps) => (
  <View style={{ gap: 14 }}>
    {!analysis.photoQuality.ok ? (
      <View style={[ui.card, { borderColor: colors.plum, backgroundColor: colors.peach }]}>
        <View style={styles.inline}>
          <AppIcon name="warning" size={18} color={colors.warn} />
          <Text style={ui.kicker}>Photo quality</Text>
        </View>
        {analysis.photoQuality.issues.map((issue) => (
          <Text key={issue} style={ui.body}>
            {issue}
          </Text>
        ))}
        <Text style={ui.muted}>Scores below may be less reliable. Retake in even light if you can.</Text>
      </View>
    ) : null}

    <View style={[ui.card, styles.hero]}>
      <View style={styles.badge}>
        <Text style={styles.badgeScore}>{analysis.quality}</Text>
        <Text style={styles.badgeLabel}>quality</Text>
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.inline}>
          <AppIcon name="sparkles" size={14} color={colors.plum} />
          <Text style={ui.kicker}>Today’s skin read</Text>
        </View>
        <Text style={ui.body}>
          {skinHeadline(analysis.quality, analysis.findings, analysis.appearanceLoad)}
        </Text>
        {chronologicalAge ? (
          <Text style={[ui.body, { fontWeight: '700' }]}>
            {faceAgeLine(chronologicalAge, analysis.appearanceLoad)}
          </Text>
        ) : (
          <Text style={ui.muted}>
            Add your birth year in You to unlock a face-age style estimate.
          </Text>
        )}
      </View>
    </View>

    <View style={styles.grid}>
      <ScoreMeter label="Spots" score={analysis.blemishes} tint={colors.blush} icon="ellipse" />
      <ScoreMeter label="Flush" score={analysis.redness} tint={colors.peach} icon="water" />
      <ScoreMeter
        label="Under-eye"
        score={analysis.underEye}
        tint={colors.lilac}
        icon="moon"
      />
      <ScoreMeter
        label="Texture"
        score={analysis.texture}
        tint={colors.sky}
        icon="grid"
      />
    </View>

    <View style={ui.card}>
      <View style={styles.inline}>
        <IconChip name="eye" tone="sky" />
        <Text style={ui.kicker}>What FacePal looked at</Text>
      </View>
      {analysis.regions.map((region) => (
        <View key={region.id} style={styles.regionRow}>
          <View style={styles.regionHead}>
            <Text style={ui.body}>{region.label}</Text>
            <Text style={styles.regionScore}>{region.score}</Text>
          </View>
          <Text style={ui.muted}>{region.note}</Text>
        </View>
      ))}
    </View>

    {analysis.findings.length > 0 ? (
      <View style={[ui.card, { backgroundColor: colors.peach }]}>
        <View style={styles.inline}>
          <AppIcon name="alert-circle" size={16} color={colors.ink} />
          <Text style={ui.kicker}>Watch</Text>
        </View>
        <Text style={ui.body}>{analysis.findings.map((code) => findingTitle[code]).join(' · ')}</Text>
      </View>
    ) : (
      <View style={[ui.card, { backgroundColor: colors.sky }]}>
        <View style={styles.inline}>
          <AppIcon name="checkmark-circle" size={16} color={colors.slate} />
          <Text style={ui.kicker}>Looking steady</Text>
        </View>
        <Text style={ui.body}>No pimple-like spots or strong flush stood out in this frame.</Text>
      </View>
    )}

    {compareLines.length > 0 ? (
      <View style={[ui.card, { backgroundColor: colors.lilac }]}>
        <View style={styles.inline}>
          <AppIcon name="trending-up" size={16} color={colors.ink} />
          <Text style={ui.kicker}>Compared with past photos</Text>
        </View>
        {compareLines.map((line) => (
          <Text key={line} style={ui.body}>
            {line}
          </Text>
        ))}
      </View>
    ) : null}

    <View style={ui.card}>
      <View style={styles.inline}>
        <IconChip name="leaf" tone="mauve" />
        <Text style={ui.kicker}>Tips for this photo</Text>
      </View>
      {analysis.tips.map((tip) => (
        <Text key={tip} style={ui.body}>
          • {tip}
        </Text>
      ))}
      <Text style={ui.disclaimer}>
        Wellness estimate from this photo only. FacePal is not a medical device and does not
        diagnose disease or predict health outcomes.
      </Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.plum,
  },
  badgeScore: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  badgeLabel: {
    color: colors.plumSoft,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  regionRow: {
    gap: 2,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  regionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.plum,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})
