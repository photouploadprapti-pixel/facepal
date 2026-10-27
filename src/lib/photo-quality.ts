/**
 * Assesses whether a selfie has usable light and detail before scoring skin.
 */

/**
 * Clamps a score to 0–100.
 * @param value Unbounded score.
 */
const clamp = (value: number): number => {
  if (value < 0) return 0
  if (value > 100) return 100
  return Math.round(value)
}

/**
 * Relative luminance for one RGB pixel.
 * @param red Red channel.
 * @param green Green channel.
 * @param blue Blue channel.
 */
const luminance = (red: number, green: number, blue: number): number =>
  0.2126 * red + 0.7152 * green + 0.0722 * blue

export type PhotoQuality = {
  score: number
  ok: boolean
  issues: string[]
  meanLight: number
}

/**
 * Checks brightness and local contrast inside the face oval.
 * @param width Image width.
 * @param height Image height.
 * @param data RGBA bytes.
 */
export const assessPhotoQuality = (
  width: number,
  height: number,
  data: Uint8Array,
): PhotoQuality => {
  const centerX = width / 2
  const centerY = height * 0.46
  const radiusX = width * 0.32
  const radiusY = height * 0.34
  let count = 0
  let lightSum = 0
  let contrastSum = 0
  let contrastCount = 0
  const step = 2

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const nx = (x - centerX) / radiusX
      const ny = (y - centerY) / radiusY
      if (nx * nx + ny * ny > 1) continue
      const index = (y * width + x) * 4
      const lum = luminance(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0)
      lightSum += lum
      count += 1
      if (x >= step) {
        const previous = (y * width + (x - step)) * 4
        const prev = luminance(
          data[previous] ?? 0,
          data[previous + 1] ?? 0,
          data[previous + 2] ?? 0,
        )
        contrastSum += Math.abs(lum - prev)
        contrastCount += 1
      }
    }
  }

  const meanLight = count > 0 ? lightSum / count : 0
  const meanContrast = contrastCount > 0 ? contrastSum / contrastCount : 0
  const issues: string[] = []

  if (meanLight < 55) issues.push('The face oval looks too dark. Move nearer a window or lamp.')
  if (meanLight > 210) issues.push('The face oval looks overexposed. Soften the light or step back.')
  if (meanContrast < 3.5) {
    issues.push('Detail looks flat. Hold still and use even side light, not a flash.')
  }

  let score = 100
  if (meanLight < 55) score -= clamp(((55 - meanLight) / 55) * 45)
  if (meanLight > 210) score -= clamp(((meanLight - 210) / 45) * 40)
  if (meanContrast < 3.5) score -= clamp(((3.5 - meanContrast) / 3.5) * 35)
  score = clamp(score)

  return {
    score,
    ok: issues.length === 0 && score >= 55,
    issues,
    meanLight: Math.round(meanLight),
  }
}
