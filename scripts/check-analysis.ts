import { scorePixels } from '../src/lib/analyze-face'

/**
 * Fills an RGBA buffer using a painter.
 * @param width Image width.
 * @param height Image height.
 * @param paint Returns RGB for one pixel.
 */
const paint = (
  width: number,
  height: number,
  paintPixel: (x: number, y: number) => [number, number, number],
): Uint8Array => {
  const data = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const [red, green, blue] = paintPixel(x, y)
      const index = (y * width + x) * 4
      data[index] = red
      data[index + 1] = green
      data[index + 2] = blue
      data[index + 3] = 255
    }
  }
  return data
}

const width = 200
const height = 260
const centerX = width / 2
const centerY = height * 0.46
const radiusX = width * 0.32
const radiusY = height * 0.34

/**
 * Returns true when a pixel sits in a named face zone.
 * @param x Pixel x.
 * @param y Pixel y.
 * @param zone Zone name used by the checker.
 */
const inZone = (x: number, y: number, zone: 'cheek' | 'eye' | 'forehead'): boolean => {
  const nx = (x - centerX) / radiusX
  const ny = (y - centerY) / radiusY
  if (zone === 'forehead') return ny < -0.35
  if (zone === 'eye') return ny > -0.2 && ny < 0.15 && Math.abs(nx) > 0.18 && Math.abs(nx) < 0.72
  return ny > 0.05 && ny < 0.55 && Math.abs(nx) > 0.25
}

const skin: [number, number, number] = [210, 170, 150]
const calm = scorePixels(width, height, paint(width, height, () => skin))
if (calm.findings.length !== 0) {
  throw new Error(`Calm photo raised ${calm.findings.join(',')}`)
}

const flushed = scorePixels(
  width,
  height,
  paint(width, height, (x, y) => (inZone(x, y, 'cheek') ? [230, 90, 90] : skin)),
)
if (!flushed.findings.includes('redness')) {
  throw new Error(`Expected redness, got ${flushed.findings.join(',') || 'none'} (${flushed.redness})`)
}

const tired = scorePixels(
  width,
  height,
  paint(width, height, (x, y) => (inZone(x, y, 'eye') ? [70, 55, 50] : skin)),
)
if (!tired.findings.includes('under_eye')) {
  throw new Error(`Expected under_eye, got ${tired.findings.join(',') || 'none'} (${tired.underEye})`)
}

console.log('analysis checks passed', {
  calm: calm.redness,
  flushed: flushed.redness,
  tired: tired.underEye,
})
