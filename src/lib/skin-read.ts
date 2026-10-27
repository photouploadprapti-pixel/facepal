import type {
  AnalysisResult,
  Checkin,
  FindingCode,
  RegionInsight,
} from '@/src/types/models'
import { findingAdvice } from '@/src/lib/findings'

const CALM_TIPS = [
  'Skin looks steady in this light. Keep the same window tomorrow so the next photo is fair.',
  'Sunscreen in the morning still does more for tone than a new product tonight.',
  'If your jaw feels tight, run the jawline release before bed.',
]

/**
 * Builds zone notes from the numeric skin scores.
 * @param scores Signal scores from the on-device check.
 */
export const regionInsights = (scores: {
  redness: number
  underEye: number
  texture: number
  unevenTone: number
  blemishes: number
}): RegionInsight[] => [
  {
    id: 'cheeks',
    label: 'Cheeks',
    score: Math.round((scores.redness + scores.texture) / 2),
    note:
      scores.redness >= 50
        ? 'Cheeks look more flushed than the forehead in this frame.'
        : 'Cheek flush looks mild in this light.',
  },
  {
    id: 'under_eye',
    label: 'Under-eyes',
    score: scores.underEye,
    note:
      scores.underEye >= 50
        ? 'The under-eye area looks darker than the cheeks.'
        : 'Under-eyes look relatively even with the cheeks.',
  },
  {
    id: 'forehead',
    label: 'Tone balance',
    score: scores.unevenTone,
    note:
      scores.unevenTone >= 50
        ? 'Tone shifts across the face oval more than usual.'
        : 'Overall tone looks fairly even across the oval.',
  },
  {
    id: 'spots',
    label: 'Spot-like redness',
    score: scores.blemishes,
    note:
      scores.blemishes >= 50
        ? 'Small red spots stand out from nearby skin.'
        : 'No strong spot-like redness stood out.',
  },
]

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
 * Rough “years of wear” mapped from quality signals. Not a medical age.
 * @param quality Skin quality 0–100.
 */
export const appearanceLoadFromQuality = (quality: number): number => {
  const load = Math.round((100 - quality) / 12)
  if (load < 0) return 0
  if (load > 8) return 8
  return load
}

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
  const appearanceLoad = appearanceLoadFromQuality(row.quality)
  return {
    ...draft,
    appearanceLoad,
    regions: regionInsights(draft),
    photoQuality: { score: 100, ok: true, issues: [] },
    summary: row.summary,
    tips: tipsFor(draft),
  }
}

/**
 * One sentence about how the face looks right now.
 * @param quality 0–100, higher is calmer skin in this photo.
 * @param findings Signals that crossed the warn line.
 * @param appearanceLoad Rough years of wear from this photo.
 */
export const skinHeadline = (
  quality: number,
  findings: FindingCode[],
  appearanceLoad = 0,
): string => {
  const look =
    quality >= 80 ? 'calm and even' : quality >= 60 ? 'a little tired' : 'under stress today'
  const ageBit =
    appearanceLoad <= 1
      ? 'Appearance load looks light today.'
      : `Appearance load is about +${appearanceLoad} years of wear in this photo.`
  if (findings.length === 0) {
    return `Skin looks ${look}. Face quality is ${quality}/100. ${ageBit}`
  }
  return `Skin looks ${look}. Face quality is ${quality}/100, with a few spots to watch. ${ageBit}`
}

/**
 * Face-age style line when the user has shared a birth year.
 * @param chronologicalAge Age in whole years.
 * @param appearanceLoad Extra years of wear from this photo.
 */
export const faceAgeLine = (chronologicalAge: number, appearanceLoad: number): string => {
  const estimate = chronologicalAge + appearanceLoad - 2
  const delta = estimate - chronologicalAge
  if (delta <= -1) {
    return `Wellness estimate: you look about ${Math.abs(delta)} year${Math.abs(delta) === 1 ? '' : 's'} fresher than your age in this photo.`
  }
  if (delta >= 1) {
    return `Wellness estimate: you look about ${delta} year${delta === 1 ? '' : 's'} more worn than your age in this photo.`
  }
  return 'Wellness estimate: your look roughly matches your age in this photo.'
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

/**
 * Builds daily quality points for the last week of check-ins.
 * @param checkins Newest-first saved reads.
 */
export const weeklyTrend = (checkins: Checkin[]): { label: string; value: number }[] => {
  const byDay = new Map<string, number>()
  for (const row of checkins) {
    const date = new Date(row.capturedAt)
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
    if (!byDay.has(key)) byDay.set(key, row.quality)
  }
  const points: { label: string; value: number }[] = []
  const cursor = new Date()
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(cursor)
    day.setDate(cursor.getDate() - offset)
    const key = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`
    const label = day.toLocaleDateString(undefined, { weekday: 'narrow' })
    const value = byDay.get(key)
    if (value !== undefined) points.push({ label, value })
  }
  return points
}

/**
 * Chronological age from birth year, or null when unknown.
 * @param birthYear Four-digit year or null.
 */
export const ageFromBirthYear = (birthYear: number | null): number | null => {
  if (birthYear === null) return null
  const age = new Date().getFullYear() - birthYear
  if (age < 13 || age > 100) return null
  return age
}
