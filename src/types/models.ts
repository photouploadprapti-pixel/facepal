/** Stable codes for photo signals the check can raise. */
export type FindingCode = 'redness' | 'under_eye' | 'texture' | 'uneven_tone'

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
  consentAcceptedAt: string | null
  reminderHour: number
  createdAt: string
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
  findings: FindingCode[]
  summary: string
}
