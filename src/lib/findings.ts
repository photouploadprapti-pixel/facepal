import type { FindingCode } from '@/src/types/models'

/** Plain-language label for a signal code. */
export const findingTitle: Record<FindingCode, string> = {
  redness: 'Flushed cheeks',
  under_eye: 'Under-eye darkness',
  texture: 'Uneven texture',
  uneven_tone: 'Uneven tone',
  blemish: 'Spot-like redness',
}

/** What to try when a signal shows up. This is care advice, not treatment. */
export const findingAdvice: Record<FindingCode, string> = {
  redness:
    'Use a bland moisturizer, skip harsh scrubs, and wear sunscreen. If flushing stays painful or spreading, see a dermatologist.',
  under_eye:
    'Prioritize sleep, ease salt late in the day, and try a cool compress. Creams can help the look; they do not erase dark circles overnight.',
  texture:
    'Moisturize on damp skin and introduce exfoliation slowly. Stop if skin stings. Ask a clinician before retinoids if you are pregnant.',
  uneven_tone:
    'Daily sunscreen matters more than any brightening product. Re-take the photo in shade so side light is not read as patchy tone.',
  blemish:
    'A small red spot showed up. Leave it alone, cleanse gently, and skip scrubs until it settles. See a clinician if it grows, hurts, or lasts for weeks.',
}

/**
 * Returns true when a string is one of the known finding codes.
 * @param value Unknown value from the database.
 */
export const isFindingCode = (value: string): value is FindingCode =>
  value === 'redness' ||
  value === 'under_eye' ||
  value === 'texture' ||
  value === 'uneven_tone' ||
  value === 'blemish'
