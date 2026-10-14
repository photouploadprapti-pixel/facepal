type PendingScan = {
  base64: string
}

let pending: PendingScan | null = null

/**
 * Holds the resized JPEG until the review screen saves or discards it.
 * @param base64 JPEG base64 without a data-URL prefix.
 */
export const setPendingScan = (base64: string): void => {
  pending = { base64 }
}

/**
 * Returns the pending JPEG once, then clears it.
 */
export const takePendingScan = (): string | null => {
  const value = pending?.base64 ?? null
  pending = null
  return value
}

/**
 * Reads the pending JPEG without clearing it, for a re-render.
 */
export const peekPendingScan = (): string | null => pending?.base64 ?? null
