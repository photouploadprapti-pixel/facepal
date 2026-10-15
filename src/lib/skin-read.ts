import type { AnalysisResult, Checkin, FindingCode } from '@/src/types/models'
import { findingAdvice } from '@/src/lib/findings'

const CALM_TIPS = [
  'Skin looks steady in this light. Keep the same window tomorrow so the next photo is fair.',
  'Sunscreen in the morning still does more for tone than a new product tonight.',
  'If your jaw feels tight, run the jawline release before bed.',
]

/**
 * Turns stored scores into the same read the camera just produced.
 * @param row Saved check-in.
 */
export const checkinToAnalysis = (row: Checkin): AnalysisResult => {
  const draft = {
    redness: row.redness,
    underEye: row.underEye,
    texture: row.texture,
    unevenTone: row.unevenTone,
    blemishes: row.blemishes,
    quality: row.quality,
    findings: row.findings,
  }
  return {
    ...draft,
    summary: row.summary,
    tips: tipsFor(draft),
  }
}

/**
 * Care notes for this photo. Calm photos still get habits to keep.
 * @param scores Current signal scores.
 */
export const tipsFor = (scores: {
  redness: number
  underEye: number
  texture: number
  unevenTone: number
  blemishes: number
  findings: FindingCode[]
}): string[] => {
  const ranked: { code: FindingCode; score: number }[] = [
    { code: 'blemish', score: scores.blemishes },
    { code: 'redness', score: scores.redness },
    { code: 'under_eye', score: scores.underEye },
    { code: 'texture', score: scores.texture },
    { code: 'uneven_tone', score: scores.unevenTone },
  ]
  ranked.sort((left, right) => right.score - left.score)
  const notable = ranked.filter((item) => item.score >= 40).slice(0, 3)
  if (notable.length === 0) return CALM_TIPS
  return notable.map((item) => findingAdvice[item.code])
}

/**
 * One sentence about how the face looks right now.
 * @param quality 0–100, higher is calmer skin in this photo.
 * @param findings Signals that crossed the warn line.
 */
export const skinHeadline = (quality: number, findings: FindingCode[]): string => {
  const look =
    quality >= 80 ? 'calm and even' : quality >= 60 ? 'a little tired' : 'under stress today'
  if (findings.length === 0) {
    return `Skin looks ${look}. Face quality is ${quality} out of 100.`
  }
  return `Skin looks ${look}. Face quality is ${quality} out of 100, with a few spots to watch.`
}

/**
 * Extra lines once a previous selfie exists, including streak context.
 * @param current Fresh on-device read.
 * @param previous Last saved check-in.
 * @param streak Current day streak, including today when a photo exists.
 */
export const compareReads = (
  current: AnalysisResult,
  previous: Checkin,
  streak: number,
): string[] => {
  const lines: string[] = []
  const delta = current.quality - previous.quality
  if (streak >= 2) {
    lines.push(`You are on a ${streak}-day streak, so this photo can be compared with the last one.`)
  }
  if (delta >= 5) {
    lines.push(`Face quality is up ${delta} points since your last photo.`)
  } else if (delta <= -5) {
    lines.push(`Face quality is down ${Math.abs(delta)} points since your last photo.`)
  } else {
    lines.push('Face quality is holding steady against your last photo.')
  }
  if (current.blemishes >= 58 && previous.blemishes < 40) {
    lines.push('New spot-like redness shows up that was quieter last time.')
  } else if (previous.blemishes - current.blemishes >= 15) {
    lines.push('Spot-like redness looks quieter than in the last photo.')
  }
  if (current.underEye - previous.underEye >= 15) {
    lines.push('The under-eye area looks darker than last time. Sleep is the first thing to check.')
  } else if (previous.underEye - current.underEye >= 15) {
    lines.push('The under-eye area looks brighter than last time.')
  }
  if (current.redness - previous.redness >= 15) {
    lines.push('Cheeks look more flushed than in the previous photo.')
  }
  return lines
}
