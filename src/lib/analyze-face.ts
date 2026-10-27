import { decode } from 'jpeg-js'

import { assessPhotoQuality } from '@/src/lib/photo-quality'
import {
  appearanceLoadFromQuality,
  regionInsights,
  skinHeadline,
  tipsFor,
} from '@/src/lib/skin-read'
import type { AnalysisResult, FindingCode } from '@/src/types/models'

const WARN_AT = 58

/**
 * Clamps a score to the 0–100 range used in the database.
 * @param value Unbounded score.
 */
const clampScore = (value: number): number => {
  if (value < 0) return 0
  if (value > 100) return 100
  return Math.round(value)
}

/**
 * Relative luminance for one RGB pixel.
 * @param red Red channel, 0–255.
 * @param green Green channel, 0–255.
 * @param blue Blue channel, 0–255.
 */
const luminance = (red: number, green: number, blue: number): number =>
  0.2126 * red + 0.7152 * green + 0.0722 * blue

/**
 * How much the red channel leads green and blue.
 * @param red Red channel.
 * @param green Green channel.
 * @param blue Blue channel.
 */
const redExcess = (red: number, green: number, blue: number): number =>
  red - (green + blue) / 2

type ZoneStats = {
  count: number
  lumSum: number
  redSum: number
  contrastSum: number
  contrastCount: number
}

/**
 * Empty running stats for one face zone.
 */
const emptyZone = (): ZoneStats => ({
  count: 0,
  lumSum: 0,
  redSum: 0,
  contrastSum: 0,
  contrastCount: 0,
})

/**
 * Builds the user-facing summary from quality and which signals were high.
 * @param quality Higher means calmer skin in this photo.
 * @param findings Codes that were high enough to mention.
 * @param appearanceLoad Rough years of wear from this photo.
 */
const summarize = (
  quality: number,
  findings: FindingCode[],
  appearanceLoad: number,
): string => {
  const headline = skinHeadline(quality, findings, appearanceLoad)
  if (findings.length === 0) return `${headline} No strong warning in this photo.`
  const labels: Record<FindingCode, string> = {
    redness: 'cheeks look more flushed than the forehead',
    under_eye: 'the under-eye area looks darker than the cheeks',
    texture: 'cheek texture looks rougher',
    uneven_tone: 'tone shifts across the face',
    blemish: 'small red spots stand out from the surrounding skin',
  }
  return `${headline} This photo suggests ${findings.map((code) => labels[code]).join(', and ')}.`
}

/**
 * Scores an RGBA image. The face is assumed to sit in the center oval.
 * @param width Image width in pixels.
 * @param height Image height in pixels.
 * @param data Tight RGBA bytes, 4 per pixel.
 */
export const scorePixels = (
  width: number,
  height: number,
  data: Uint8Array,
): AnalysisResult => {
  const photoQualityRaw = assessPhotoQuality(width, height, data)
  const centerX = width / 2
  const centerY = height * 0.46
  const radiusX = width * 0.32
  const radiusY = height * 0.34
  const forehead = emptyZone()
  const underEye = emptyZone()
  const cheek = emptyZone()
  const quadrants = [0, 0, 0, 0].map(() => emptyZone())
  const step = 2

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const nx = (x - centerX) / radiusX
      const ny = (y - centerY) / radiusY
      if (nx * nx + ny * ny > 1) continue
      const index = (y * width + x) * 4
      const red = data[index] ?? 0
      const green = data[index + 1] ?? 0
      const blue = data[index + 2] ?? 0
      const lum = luminance(red, green, blue)
      const excess = redExcess(red, green, blue)
      const quadrant = (nx < 0 ? 0 : 1) + (ny < 0 ? 0 : 2)
      const bucket = quadrants[quadrant]
      if (bucket) {
        bucket.count += 1
        bucket.lumSum += lum
      }
      const add = (zone: ZoneStats, withContrast: boolean): void => {
        zone.count += 1
        zone.lumSum += lum
        zone.redSum += excess
        if (!withContrast || x < step) return
        const previous = (y * width + (x - step)) * 4
        const prevLum = luminance(
          data[previous] ?? 0,
          data[previous + 1] ?? 0,
          data[previous + 2] ?? 0,
        )
        zone.contrastSum += Math.abs(lum - prevLum)
        zone.contrastCount += 1
      }
      if (ny < -0.35) add(forehead, false)
      if (ny > -0.2 && ny < 0.15 && Math.abs(nx) > 0.18 && Math.abs(nx) < 0.72) {
        add(underEye, false)
      }
      if (ny > 0.05 && ny < 0.55 && Math.abs(nx) > 0.25) add(cheek, true)
    }
  }

  const mean = (sum: number, count: number): number => (count > 0 ? sum / count : 0)
  const foreheadRed = mean(forehead.redSum, forehead.count)
  const cheekRed = mean(cheek.redSum, cheek.count)
  const cheekLum = mean(cheek.lumSum, cheek.count)
  const eyeLum = mean(underEye.lumSum, underEye.count)
  const contrast = mean(cheek.contrastSum, cheek.contrastCount)
  const quadrantMeans = quadrants
    .filter((zone) => zone.count > 20)
    .map((zone) => mean(zone.lumSum, zone.count))
  const toneMean =
    quadrantMeans.reduce((total, value) => total + value, 0) /
    Math.max(quadrantMeans.length, 1)
  const toneStd = Math.sqrt(
    quadrantMeans.reduce((total, value) => total + (value - toneMean) ** 2, 0) /
      Math.max(quadrantMeans.length, 1),
  )

  const redness =
    forehead.count > 40 && cheek.count > 40
      ? clampScore(((cheekRed - foreheadRed - 4) / 28) * 100)
      : 0
  const underEyeScore =
    cheek.count > 40 && underEye.count > 30 && cheekLum > 1
      ? clampScore((((cheekLum - eyeLum) / cheekLum - 0.08) / 0.35) * 100)
      : 0
  const texture =
    cheek.contrastCount > 40 ? clampScore(((contrast - 5) / 16) * 100) : 0
  const unevenTone =
    quadrantMeans.length === 4 ? clampScore(((toneStd - 10) / 22) * 100) : 0

  let spotPixels = 0
  let cheekPixels = 0
  const cheekBaseline = cheekRed
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const nx = (x - centerX) / radiusX
      const ny = (y - centerY) / radiusY
      if (nx * nx + ny * ny > 1) continue
      const onCheek = ny > 0.05 && ny < 0.55 && Math.abs(nx) > 0.25
      const onForehead = ny < -0.15 && Math.abs(nx) < 0.45
      if (!onCheek && !onForehead) continue
      const index = (y * width + x) * 4
      const excess = redExcess(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0)
      cheekPixels += 1
      if (excess > cheekBaseline + 22 && excess > 35) spotPixels += 1
    }
  }
  const spotRatio = cheekPixels > 0 ? spotPixels / cheekPixels : 0
  const blemishes = cheekPixels > 40 ? clampScore(((spotRatio - 0.004) / 0.03) * 100) : 0
  const quality = clampScore(
    100 - (redness + underEyeScore + texture + unevenTone + blemishes) / 5,
  )
  const appearanceLoad = appearanceLoadFromQuality(quality)

  const findings: FindingCode[] = []
  if (blemishes >= WARN_AT) findings.push('blemish')
  if (redness >= WARN_AT) findings.push('redness')
  if (underEyeScore >= WARN_AT) findings.push('under_eye')
  if (texture >= WARN_AT) findings.push('texture')
  if (unevenTone >= WARN_AT) findings.push('uneven_tone')

  const partial = {
    redness,
    underEye: underEyeScore,
    texture,
    unevenTone,
    blemishes,
    quality,
    findings,
  }
  return {
    ...partial,
    appearanceLoad,
    regions: regionInsights(partial),
    photoQuality: {
      score: photoQualityRaw.score,
      ok: photoQualityRaw.ok,
      issues: photoQualityRaw.issues,
    },
    summary: summarize(quality, findings, appearanceLoad),
    tips: tipsFor(partial),
  }
}

/**
 * Decodes a JPEG and scores the face oval.
 * @param jpegBytes Encoded JPEG bytes from the camera.
 */
export const analyzeJpeg = (jpegBytes: Uint8Array): AnalysisResult => {
  const image = decode(jpegBytes, { useTArray: true, formatAsRGBA: true })
  return scorePixels(image.width, image.height, image.data)
}
