import { Text, View } from 'react-native'

import { ScoreMeter } from '@/src/components/score-meter'
import { findingAdvice, findingTitle } from '@/src/lib/findings'
import { ui } from '@/src/theme/ui'
import type { AnalysisResult } from '@/src/types/models'

type AnalysisCardProps = {
  analysis: AnalysisResult
}

/**
 * Renders scores, warnings, and care notes for one photo check.
 * @param analysis On-device result or the same fields loaded from a check-in.
 */
export const AnalysisCard = ({ analysis }: AnalysisCardProps) => (
  <View style={ui.card}>
    <Text style={ui.body}>{analysis.summary}</Text>
    <ScoreMeter label="Flushed cheeks" score={analysis.redness} />
    <ScoreMeter label="Under-eye darkness" score={analysis.underEye} />
    <ScoreMeter label="Texture" score={analysis.texture} />
    <ScoreMeter label="Uneven tone" score={analysis.unevenTone} />
    {analysis.findings.map((code) => (
      <View key={code} style={{ gap: 4 }}>
        <Text style={ui.body}>{findingTitle[code]}</Text>
        <Text style={ui.muted}>{findingAdvice[code]}</Text>
      </View>
    ))}
    <Text style={ui.muted}>
      Wellness estimate from this photo only. It is not a medical diagnosis.
    </Text>
  </View>
)
