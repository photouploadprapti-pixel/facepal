import type {
  AnimationKey,
  Checkin,
  FindingCode,
  Profile,
  Tip,
  YogaRoutine,
  YogaStep,
} from '@/src/types/models'
import { isFindingCode } from '@/src/lib/findings'

/**
 * Narrows unknown JSON to a string-keyed record.
 * @param value Value from Supabase.
 */
const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

/**
 * Reads a string field or returns null.
 * @param row Object to read.
 * @param key Field name.
 */
const readString = (row: Record<string, unknown>, key: string): string | null => {
  const value = row[key]
  return typeof value === 'string' ? value : null
}

/**
 * Reads an integer field or returns null.
 * @param row Object to read.
 * @param key Field name.
 */
const readNumber = (row: Record<string, unknown>, key: string): number | null => {
  const value = row[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

const animationKeys: AnimationKey[] = [
  'blink',
  'smile',
  'puff',
  'brow',
  'jaw',
  'kiss',
  'neck',
]

/**
 * Returns true when the string is a known yoga animation.
 * @param value Candidate animation key.
 */
const isAnimationKey = (value: string): value is AnimationKey =>
  animationKeys.some((key) => key === value)

/**
 * Maps a profiles row into the app model.
 * @param value Unknown row.
 */
export const parseProfile = (value: unknown): Profile | null => {
  const row = asRecord(value)
  if (!row) return null
  const id = readString(row, 'id')
  const createdAt = readString(row, 'created_at')
  const reminderHour = readNumber(row, 'reminder_hour')
  const displayName = row.display_name
  const consent = row.consent_accepted_at
  if (!id || !createdAt || reminderHour === null) return null
  if (typeof displayName !== 'string') return null
  if (consent !== null && typeof consent !== 'string') return null
  return {
    id,
    displayName,
    consentAcceptedAt: consent,
    reminderHour,
    createdAt,
  }
}

/**
 * Maps a check-ins row into the app model.
 * @param value Unknown row.
 */
export const parseCheckin = (value: unknown): Checkin | null => {
  const row = asRecord(value)
  if (!row) return null
  const id = readString(row, 'id')
  const userId = readString(row, 'user_id')
  const capturedAt = readString(row, 'captured_at')
  const storagePath = readString(row, 'storage_path')
  const summary = readString(row, 'summary')
  const redness = readNumber(row, 'redness')
  const underEye = readNumber(row, 'under_eye')
  const texture = readNumber(row, 'texture')
  const unevenTone = readNumber(row, 'uneven_tone')
  const blemishes = readNumber(row, 'blemishes') ?? 0
  const quality = readNumber(row, 'quality') ?? 0
  const rawFindings = row.findings
  if (
    !id ||
    !userId ||
    !capturedAt ||
    !storagePath ||
    !summary ||
    redness === null ||
    underEye === null ||
    texture === null ||
    unevenTone === null ||
    !Array.isArray(rawFindings)
  ) {
    return null
  }
  const findings: FindingCode[] = []
  for (const item of rawFindings) {
    if (typeof item === 'string' && isFindingCode(item)) findings.push(item)
  }
  return {
    id,
    userId,
    capturedAt,
    storagePath,
    redness,
    underEye,
    texture,
    unevenTone,
    blemishes,
    quality,
    findings,
    summary,
  }
}

/**
 * Maps one yoga step row.
 * @param value Unknown row.
 */
const parseStep = (value: unknown): YogaStep | null => {
  const row = asRecord(value)
  if (!row) return null
  const id = readString(row, 'id')
  const title = readString(row, 'title')
  const instruction = readString(row, 'instruction')
  const order = readNumber(row, 'step_order')
  const seconds = readNumber(row, 'seconds')
  const animation = readString(row, 'animation_key')
  if (!id || !title || !instruction || order === null || seconds === null) return null
  if (!animation || !isAnimationKey(animation)) return null
  return { id, order, title, instruction, seconds, animationKey: animation }
}

/**
 * Maps a routine with nested steps.
 * @param value Unknown row from the nested select.
 */
export const parseRoutine = (value: unknown): YogaRoutine | null => {
  const row = asRecord(value)
  if (!row) return null
  const id = readString(row, 'id')
  const slug = readString(row, 'slug')
  const title = readString(row, 'title')
  const zone = readString(row, 'zone')
  const summary = readString(row, 'summary')
  const level = readString(row, 'level')
  const minutes = readNumber(row, 'minutes')
  const video = row.video_url
  if (!id || !slug || !title || !zone || !summary || !level || minutes === null) return null
  if (video !== null && typeof video !== 'string') return null
  const rawSteps = row.yoga_steps
  if (!Array.isArray(rawSteps)) return null
  const steps = rawSteps
    .map((step) => parseStep(step))
    .filter((step): step is YogaStep => step !== null)
    .sort((left, right) => left.order - right.order)
  return {
    id,
    slug,
    title,
    zone,
    minutes,
    summary,
    level,
    videoUrl: video,
    steps,
  }
}

/**
 * Maps a tips row.
 * @param value Unknown row.
 */
export const parseTip = (value: unknown): Tip | null => {
  const row = asRecord(value)
  if (!row) return null
  const id = readString(row, 'id')
  const category = readString(row, 'category')
  const title = readString(row, 'title')
  const body = readString(row, 'body')
  if (!id || !category || !title || !body) return null
  return { id, category, title, body }
}
