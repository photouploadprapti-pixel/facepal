/** Stable codes for photo signals the check can raise. */
export type FindingCode =
  | 'redness'
  | 'under_eye'
  | 'texture'
  | 'uneven_tone'
  | 'blemish'

/** Pose the face-yoga animation should play. */
export type AnimationKey =
  | 'blink'
  | 'smile'
  | 'puff'
  | 'brow'
  | 'jaw'
  | 'kiss'
  | 'neck'

/** Signed-in profile row. */
export type Profile = {
  id: string
  displayName: string
  birthYear: number | null
  consentAcceptedAt: string | null
  reminderHour: number
  createdAt: string
}

/** Face zone that contributed to the skin read. */
export type RegionInsight = {
  id: 'forehead' | 'under_eye' | 'cheeks' | 'spots'
  label: string
  score: number
  note: string
}

/** Lighting readiness of the captured selfie. */
export type PhotoQualityInfo = {
  score: number
  ok: boolean
  issues: string[]
}

/** One saved daily selfie and its scores. */
export type Checkin = {
  id: string
  userId: string
  capturedAt: string
  storagePath: string
  redness: number
  underEye: number
  texture: number
  unevenTone: number
  blemishes: number
  quality: number
  findings: FindingCode[]
  summary: string
}

/** One timed move inside a face-yoga routine. */
export type YogaStep = {
  id: string
  order: number
  title: string
  instruction: string
  seconds: number
  animationKey: AnimationKey
}

/** A face-yoga routine and its steps. */
export type YogaRoutine = {
  id: string
  slug: string
  title: string
  zone: string
  minutes: number
  summary: string
  level: string
  videoUrl: string | null
  steps: YogaStep[]
}

/** A short youth-care tip. */
export type Tip = {
  id: string
  category: string
  title: string
  body: string
}

/** Numeric result of the on-device photo check. */
export type AnalysisResult = {
  redness: number
  underEye: number
  texture: number
  unevenTone: number
  blemishes: number
  quality: number
  /** Rough years of “appearance load” relative to a rested look. Higher means more worn. */
  appearanceLoad: number
  findings: FindingCode[]
  regions: RegionInsight[]
  photoQuality: PhotoQualityInfo
  summary: string
  tips: string[]
}
