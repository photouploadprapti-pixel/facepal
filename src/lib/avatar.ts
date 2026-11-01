import { supabaseUrl } from '@/src/lib/env'

/**
 * Builds a public CDN URL for an avatars storage path.
 * @param path Object path like `{userId}/avatar.jpg`, or null.
 */
export const publicAvatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl()}/storage/v1/object/public/avatars/${path}`
}
